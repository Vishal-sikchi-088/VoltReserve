import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function OverviewView() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/health")
      .then((data) => {
        setHealth(data);
      })
      .catch((err) => {
        setError(err.message || "Unable to reach backend");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const result = await api.post("/api/auth/login", {
        email,
        password
      });
      setSuccessUser(result.user);

      const role = result.user && result.user.role;
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "MANAGER") {
        navigate("/manager");
      } else if (role === "OPERATOR") {
        navigate("/operator");
      } else {
        navigate("/");
      }
    } catch (err) {
      setLoginError(err.message || "Login failed");
      setSuccessUser(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-main">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1 className="hero-title">Battery swap scheduling, reimagined.</h1>
          <p className="hero-body">
            This console orchestrates rolling 24 hour capacity, 15 minute booking
            windows and deterministic slot allocation across every swap station.
          </p>
        </div>
        <div className="hero-right">
          <div className="hero-metric-card">
            <div className="metric-label">API status</div>
            <div className="metric-value">
              {isLoading && "Checking backend"}
              {!isLoading && error && "Unavailable"}
              {!isLoading && !error && health && "Online"}
            </div>
            <div className="metric-meta">
              {!isLoading && !error && health && (
                <span>
                  Last heartbeat at {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              )}
              {!isLoading && error && <span>{error}</span>}
            </div>
          </div>
          <div className="hero-metric-card">
            <div className="metric-label">Sign in</div>
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-label">
                <span>Email</span>
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@voltreserve.local"
                  required
                />
              </label>
              <label className="login-label">
                <span>Password</span>
                <input
                  type="password"
                  className="login-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin123!"
                  required
                />
              </label>
              {loginError && <div className="login-error">{loginError}</div>}
              {successUser && (
                <div className="login-success">
                  Signed in as {successUser.name} ({successUser.role})
                </div>
              )}
              <button
                className="login-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid-panel">
        <div className="grid-card">
          <h2 className="section-title">Architecture</h2>
          <p className="section-body">
            React and Express, backed by SQLite with deterministic capacity allocation
            per 15 minute slot.
          </p>
        </div>
        <div className="grid-card">
          <h2 className="section-title">Booking flow</h2>
          <p className="section-body">
            Operators see live availability for the next 24 hours and can book,
            cancel or reschedule within defined cutoffs.
          </p>
        </div>
        <div className="grid-card">
          <h2 className="section-title">Operations</h2>
          <p className="section-body">
            Admins and managers get a near real time view of station utilisation and
            no show trends.
          </p>
        </div>
      </section>
    </main>
  );
}

export default OverviewView;
