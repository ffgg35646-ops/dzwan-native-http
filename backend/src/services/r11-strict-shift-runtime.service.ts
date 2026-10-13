
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

import { assertCaptainInsideShift as assertSelectedCaptainShift } from "./captain-shift-management.service.js";

export async function checkStrictShift(captainId: string, date = new Date()): Promise<StrictShiftResult> {
  try {
    const { shift } = await assertSelectedCaptainShift(captainId, date);
    return { allowed: true, reason: "IN_SHIFT", shiftId: String(shift._id) };
  } catch (error: any) {
    return { allowed: false, reason: error?.message === "CAPTAIN_HAS_NO_WEEKLY_SHIFT" ? "NO_SHIFT" : "OUTSIDE_SHIFT" };
  }
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
