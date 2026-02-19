import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import "./styles/layout.css";
import "./styles/typography.css";
import OverviewView from "./views/Overview/OverviewView";
import LoginView from "./views/Auth/LoginView";

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
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<OverviewView />} />
          <Route path="/login" element={<LoginView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
