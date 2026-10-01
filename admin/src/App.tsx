import {
  lazy,
  Suspense,
  useEffect,
} from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AppThemeSettings from "./pages/AppThemeSettings";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Captains = lazy(() => import("./pages/Captains"));
const CaptainDetails = lazy(() => import("./pages/CaptainDetails"));
const Establishments = lazy(() => import("./pages/Establishments"));
const EstablishmentDetails = lazy(() => import("./pages/EstablishmentDetails"));
const Users = lazy(() => import("./pages/Users"));
const Locations = lazy(() => import("./pages/Locations"));
const Leaders = lazy(() => import("./pages/Leaders"));
const Customers = lazy(() => import("./pages/Customers"));
const Products = lazy(() => import("./pages/Products"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Offers = lazy(() => import("./pages/Offers"));
const Geofencing = lazy(() => import("./pages/Geofencing"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Orders = lazy(() => import("./pages/Orders"));
const Complaints = lazy(() => import("./pages/Complaints"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const Reports = lazy(() => import("./pages/Reports"));
const OperationsSettings = lazy(() => import("./pages/OperationsSettings"));
const SubAdmins = lazy(() => import("./pages/SubAdmins"));
const CaptainRatings = lazy(() => import("./pages/CaptainRatings"));
const CashAccounting = lazy(() => import("./pages/CashAccounting"));
const Settings = lazy(() => import("./pages/Settings"));
const SupportSettings = lazy(() => import("./pages/SupportSettings"));
const EstablishmentLocations = lazy(() => import("./pages/EstablishmentLocations"));
const RegistrationRequests = lazy(() => import("./pages/RegistrationRequests"));
const OperationsCenter = lazy(() => import("./pages/OperationsCenter"));
const AppVersions = lazy(() => import("./pages/AppVersions"));
const SecurityLog = lazy(() => import("./pages/SecurityLog"));
const CaptainShifts = lazy(() => import("./pages/CaptainShifts"));
const CaptainAttendance = lazy(() => import("./pages/CaptainAttendance"));

const protectedPagePreloads = [
  () => import("./pages/Captains"),
  () => import("./pages/CaptainDetails"),
  () => import("./pages/Establishments"),
  () => import("./pages/EstablishmentDetails"),
  () => import("./pages/Users"),
  () => import("./pages/Locations"),
  () => import("./pages/Leaders"),
  () => import("./pages/Customers"),
  () => import("./pages/Products"),
  () => import("./pages/Pricing"),
  () => import("./pages/Offers"),
  () => import("./pages/Geofencing"),
  () => import("./pages/Notifications"),
  () => import("./pages/Orders"),
  () => import("./pages/Complaints"),
  () => import("./pages/OrderDetails"),
  () => import("./pages/AdminProfile"),
  () => import("./pages/AuditLogs"),
  () => import("./pages/Reports"),
  () => import("./pages/OperationsSettings"),
  () => import("./pages/SubAdmins"),
  () => import("./pages/CaptainRatings"),
  () => import("./pages/CashAccounting"),
  () => import("./pages/Settings"),
  () => import("./pages/SupportSettings"),
  () => import("./pages/EstablishmentLocations"),
  () => import("./pages/RegistrationRequests"),
  () => import("./pages/OperationsCenter"),
  () => import("./pages/AppVersions"),
  () => import("./pages/SecurityLog"),
  () => import("./pages/CaptainShifts"),
  () => import("./pages/CaptainAttendance"),
];

function LazyPageFallback() {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: "#6b7280",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          border: "3px solid #e5e7eb",
          borderTopColor: "#f28c28",
          borderRadius: "50%",
          animation: "app-route-spin .8s linear infinite",
        }}
      />
      <span>جارٍ تحميل الصفحة...</span>
      <style>{`
        @keyframes app-route-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function BackgroundPagePreloader() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/dashboard") {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const preload = () => {
      if (cancelled) return;

      void Promise.all(
        protectedPagePreloads.map((load) => load()),
      ).catch(() => {
        // A failed background chunk will retry normally when its page is opened.
      });
    };

    timeoutId = window.setTimeout(preload, 1200);

    return () => {
      cancelled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };

  }, [location.pathname]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <BackgroundPagePreloader />

      <Suspense fallback={<LazyPageFallback />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/app-theme"
            element={<AppThemeSettings />}
          />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["super_admin", "admin"]}
              />
            }
          >
            <Route element={<AdminLayout />}>
              <Route
                path="/complaints"
                element={<Complaints />}
              />

              <Route
                path="/profile"
                element={<AdminProfile />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/users"
                element={<Users />}
              />

              <Route
                path="/captains"
                element={<Captains />}
              />

              <Route
                path="/registration-requests"
                element={<RegistrationRequests />}
              />

              <Route
                path="/captains/:id"
                element={<CaptainDetails />}
              />

              <Route
                path="/establishments"
                element={<Establishments />}
              />

              <Route
                path="/establishment-locations"
                element={<EstablishmentLocations />}
              />

              <Route
                path="/establishments/:id"
                element={<EstablishmentDetails />}
              />

              <Route
                path="/products"
                element={<Products />}
              />

              <Route
                path="/captain-shifts"
                element={<CaptainShifts />}
              />

              <Route
                path="/captain-attendance"
                element={<CaptainAttendance />}
              />

              <Route
                path="/pricing"
                element={<Pricing />}
              />

              <Route
                path="/offers"
                element={<Offers />}
              />

              <Route
                path="/geofencing"
                element={<Geofencing />}
              />

              <Route
                path="/audit-logs"
                element={<AuditLogs />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

              <Route
                path="/support-settings"
                element={<SupportSettings />}
              />

              <Route
                path="/reports"
                element={<Reports />}
              />

              <Route
                path="/cash-accounting"
                element={<CashAccounting />}
              />

              <Route
                path="/captain-ratings"
                element={<CaptainRatings />}
              />

              <Route
                path="/sub-admins"
                element={<SubAdmins />}
              />

              <Route
                path="/operations-center"
                element={<OperationsCenter />}
              />

              <Route
                path="/operations-settings"
                element={<OperationsSettings />}
              />

              <Route
                path="/app-versions"
                element={<AppVersions />}
              />

              <Route
                path="/security-log"
                element={<SecurityLog />}
              />

              <Route
                path="/notifications"
                element={<Notifications />}
              />

              <Route
                path="/customers"
                element={<Customers />}
              />

              <Route
                path="/leaders"
                element={<Leaders />}
              />

              <Route
                path="/locations"
                element={<Locations />}
              />

              <Route
                path="/orders"
                element={<Orders />}
              />

              <Route
                path="/orders/:id"
                element={<OrderDetails />}
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ErrorBoundary>
  );
}
