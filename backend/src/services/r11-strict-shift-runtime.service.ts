import { isShiftRunning } from "./captain-shift-management.service.js";

import { CaptainShiftModel } from "../models/CaptainShift.js";

export type StrictShiftResult = {
  allowed: boolean;
  reason:
    | "NO_SHIFT"
    | "OUTSIDE_SHIFT"
    | "IN_SHIFT";
  shiftId?: string;
};

function timeToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);

  if (
    !Number.isInteger(h) ||
    !Number.isInteger(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return -1;
  }

  return h * 60 + m;
}

function isInsideShift(
  nowMinutes: number,
  start: string,
  end: string,
): boolean {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes < 0 || endMinutes < 0) {
    return false;
  }

  // نفس الوقت يعني شفت 24 ساعة
  if (startMinutes === endMinutes) {
    return true;
  }

  // شفت عادي داخل نفس اليوم
  if (startMinutes < endMinutes) {
    return (
      nowMinutes >= startMinutes &&
      nowMinutes < endMinutes
    );
  }

  // شفت يعبر منتصف الليل
  return (
    nowMinutes >= startMinutes ||
    nowMinutes < endMinutes
  );
}

function getCurrentDayIndex(date: Date): number {
  return date.getDay();
}

// The selected assignment remains valid until replaced; the seven-day period only locks changes.
// Never use server-local hours or the attendance button to gate dispatch.
export async function checkStrictShift(captainId: string, date = new Date()): Promise<StrictShiftResult> {
  const assignment = await CaptainShiftModel.findOne({
    captainId, shiftId: { $exists: true, $ne: null }, isActive: true,
  }).sort({ weekStart: -1, updatedAt: -1 }).lean();
  if (!assignment?.shiftId) return { allowed: false, reason: "NO_SHIFT" };
  const shift = await CaptainShiftModel.findOne({ _id: assignment.shiftId, isActive: true }).lean();
  if (!shift) return { allowed: false, reason: "NO_SHIFT" };
  const allowed = isShiftRunning(String(shift.startTime), String(shift.endTime), date);
  return { allowed, reason: allowed ? "IN_SHIFT" : "OUTSIDE_SHIFT", shiftId: String(shift._id) };
}

export async function assertCaptainInsideShift(
  captainId: string,
  date = new Date(),
) {
  const result =
    await checkStrictShift(
      captainId,
      date,
    );

  if (!result.allowed) {
    const error =
      new Error(
        result.reason === "NO_SHIFT"
          ? "لا يوجد شفت فعال للكابتن."
          : "لا يمكن للكابتن العمل خارج وقت الشفت.",
      );

    (error as any).code =
      result.reason === "NO_SHIFT"
        ? "NO_ACTIVE_SHIFT"
        : "OUTSIDE_SHIFT";

    throw error;
  }

  return result;
}
