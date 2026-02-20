import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/layout.css";
import "./styles/typography.css";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/layout/Header";

function AppShell() {
  const [health, setHealth] = useState({
    status: "unknown",
    components: {}
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
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
        })
        .finally(() => {
          setAuthChecked(true);
        });
    }

    setAuthChecked(false);
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
    if (!authChecked || !currentUser) {
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
  }, [authChecked, currentUser, location.pathname, navigate]);

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
      <Header
        currentUser={currentUser}
        health={health}
        appStatus={appStatus}
        onSignOut={handleSignOut}
      />

      <AppRoutes currentUser={currentUser} authChecked={authChecked} />
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
