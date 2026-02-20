import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

const OverviewView = lazy(() => import("../views/Overview/OverviewView"));
const AdminDashboardView = lazy(
  () => import("../views/Admin/AdminDashboardView")
);
const ManagerDashboardView = lazy(
  () => import("../views/Manager/ManagerDashboardView")
);
const OperatorDashboardView = lazy(
  () => import("../views/Operator/OperatorDashboardView")
);

function getHomePathForRole(role) {
  if (role === "ADMIN") {
    return "/admin";
  }
  if (role === "MANAGER") {
    return "/manager";
  }
  if (role === "OPERATOR") {
    return "/operator";
  }
  return "/";
}

function ProtectedRoute({ currentUser, authChecked, allowedRoles, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!currentUser) {
      navigate("/", { replace: true });
      return;
    }

    if (
      Array.isArray(allowedRoles) &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(currentUser.role)
    ) {
      const target = getHomePathForRole(currentUser.role);
      navigate(target, { replace: true });
    }
  }, [allowedRoles, authChecked, currentUser, navigate]);

  if (!authChecked) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  return children;
}

function FallbackRoute({ currentUser, authChecked }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!currentUser) {
      navigate("/", { replace: true });
      return;
    }

    const target = getHomePathForRole(currentUser.role);
    navigate(target, { replace: true });
  }, [authChecked, currentUser, navigate]);

  return null;
}

function AppRoutes({ currentUser, authChecked }) {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<OverviewView />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              authChecked={authChecked}
              allowedRoles={["ADMIN"]}
            >
              <AdminDashboardView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              authChecked={authChecked}
              allowedRoles={["MANAGER"]}
            >
              <ManagerDashboardView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              authChecked={authChecked}
              allowedRoles={["OPERATOR"]}
            >
              <OperatorDashboardView />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <FallbackRoute
              currentUser={currentUser}
              authChecked={authChecked}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
