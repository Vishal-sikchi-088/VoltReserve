import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/layout.css";
import "./styles/typography.css";
import OverviewView from "./views/Overview/OverviewView";
import LoginView from "./views/Auth/LoginView";
import AdminDashboardView from "./views/Admin/AdminDashboardView";
import ManagerDashboardView from "./views/Manager/ManagerDashboardView";
import OperatorDashboardView from "./views/Operator/OperatorDashboardView";

function AppShell() {
  const [health, setHealth] = useState({
    status: "unknown",
    components: {}
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function fetchMe() {
      fetch("/api/auth/me", {
        credentials: "include"
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("unauthenticated");
          }
          return response.json();
        })
        .then((data) => {
          setCurrentUser(data.user || null);
        })
        .catch(() => {
          setCurrentUser(null);
        });
    }

    fetchMe();
  }, [location.pathname]);

  useEffect(() => {
    function fetchHealth() {
      fetch("/api/health", {
        credentials: "include"
      })
        .then((response) => response.json())
        .then((data) => {
          setHealth({
            status: data.status || "unknown",
            components: data.components || {}
          });
        })
        .catch(() => {
          setHealth({
            status: "unreachable",
            components: {}
          });
        });
    }

    fetchHealth();
    const id = window.setInterval(fetchHealth, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const role = currentUser.role;
    if (location.pathname === "/" || location.pathname === "/login") {
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "MANAGER") {
        navigate("/manager", { replace: true });
      } else if (role === "OPERATOR") {
        navigate("/operator", { replace: true });
      }
    }
  }, [currentUser, location.pathname, navigate]);

  const appStatus =
    health.status === "ok"
      ? "All systems normal"
      : health.status === "degraded"
        ? "Degraded"
        : "Unavailable";

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      // ignore errors here; we'll still clear local state
    }
    setCurrentUser(null);
    navigate("/");
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-brand">
          <span className="brand-mark" />
          <div className="brand-text-group">
            <span className="brand-title">VoltReserve</span>
            <span className="brand-subtitle">Battery Swap Booking Console</span>
          </div>
        </div>
        <div className="app-header-right">
          {currentUser && (
            <button
              type="button"
              className="nav-pill nav-pill-secondary"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          )}
          <div className="app-status-pill">
            <span className="app-status-dot" data-status={health.status} />
            <span className="app-status-text">{appStatus}</span>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<OverviewView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/admin" element={<AdminDashboardView />} />
        <Route path="/manager" element={<ManagerDashboardView />} />
        <Route path="/operator" element={<OperatorDashboardView />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
