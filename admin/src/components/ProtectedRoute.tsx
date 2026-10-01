
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStoredAdminUser } from "../lib/api";

type Role =
  | "super_admin"
  | "admin"
  | "governorate_leader"
  | "area_leader"
  | "captain"
  | "shop"
  | "customer";

type User = {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  role: Role;
  status: string;
  avatarUrl?: string | null;
};

type Props = {
  allowedRoles?: Role[];
};

export default function ProtectedRoute({
  allowedRoles,
}: Props) {
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const authenticatedUser = (
      location.state as
        | { authenticatedUser?: User }
        | null
        | undefined
    )?.authenticatedUser;

    if (
      authenticatedUser &&
      authenticatedUser.status === "active"
    ) {
      return authenticatedUser;
    }

    const storedUser = getStoredAdminUser();

    return storedUser && storedUser.status === "active"
      ? (storedUser as User)
      : null;
  });

  useEffect(() => {
    const authenticatedUser = (
      location.state as
        | { authenticatedUser?: User }
        | null
        | undefined
    )?.authenticatedUser;

    if (
      authenticatedUser &&
      authenticatedUser.status === "active"
    ) {
      setUser(authenticatedUser);
      return;
    }

    const storedUser = getStoredAdminUser();

    setUser(
      storedUser && storedUser.status === "active"
        ? (storedUser as User)
        : null,
    );
  }, [location.state]);

  if (loading) {
    return (
      <div
        className="dashboard-loading"
        dir="rtl"
      >
        <div className="loading-spinner" />
        <span>
          جارٍ التحقق من الجلسة...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div
        className="global-error-page"
        dir="rtl"
      >
        <div className="global-error-card">
          <h2>
            لا يمكنك الوصول إلى هذه الصفحة
          </h2>

          <p>
            هذا القسم غير متاح لحسابك.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.assign("/dashboard")
            }
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
