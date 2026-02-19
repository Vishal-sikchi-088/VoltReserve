import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import "./styles/layout.css";
import "./styles/typography.css";
import OverviewView from "./views/Overview/OverviewView";
import LoginView from "./views/Auth/LoginView";
import AdminDashboardView from "./views/Admin/AdminDashboardView";
import ManagerDashboardView from "./views/Manager/ManagerDashboardView";
import OperatorDashboardView from "./views/Operator/OperatorDashboardView";

function App() {
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
