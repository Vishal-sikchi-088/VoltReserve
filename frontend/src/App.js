import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/layout.css";
import "./styles/typography.css";
import OverviewView from "./views/Overview/OverviewView";
import LoginView from "./views/Auth/LoginView";
import AdminDashboardView from "./views/Admin/AdminDashboardView";
import ManagerDashboardView from "./views/Manager/ManagerDashboardView";
import OperatorDashboardView from "./views/Operator/OperatorDashboardView";

function App() {
  const [health, setHealth] = useState({
    status: "unknown",
    components: {}
  });

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

  const appStatus =
    health.status === "ok"
      ? "All systems normal"
      : health.status === "degraded"
        ? "Degraded"
        : "Unavailable";

  return (
    <BrowserRouter>
      <div className="app-root">
        <header className="app-header">
          <div className="app-brand">
            <span className="brand-mark" />
            <div className="brand-text-group">
              <span className="brand-title">VoltReserve</span>
              <span className="brand-subtitle">Battery Swap Booking Console</span>
            </div>
          </div>
          <nav className="app-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "nav-pill" + (isActive ? " nav-pill-active" : "")
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                "nav-pill" + (isActive ? " nav-pill-active" : "")
              }
            >
              Sign in
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                "nav-pill" + (isActive ? " nav-pill-active" : "")
              }
            >
              Admin
            </NavLink>
            <NavLink
              to="/manager"
              className={({ isActive }) =>
                "nav-pill" + (isActive ? " nav-pill-active" : "")
              }
            >
              Manager
            </NavLink>
            <NavLink
              to="/operator"
              className={({ isActive }) =>
                "nav-pill" + (isActive ? " nav-pill-active" : "")
              }
            >
              Operator
            </NavLink>
          </nav>
          <div className="app-status-pill">
            <span className="app-status-dot" data-status={health.status} />
            <span className="app-status-text">{appStatus}</span>
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
    </BrowserRouter>
  );
}

export default App;
