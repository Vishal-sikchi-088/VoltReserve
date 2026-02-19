import { useEffect, useState } from "react";
import "./styles/layout.css";
import "./styles/typography.css";

function App() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Failed to reach API");
        }
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHealth();
  }, []);

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
        <nav className="app-nav">
          <button className="nav-pill nav-pill-active">Overview</button>
          <button className="nav-pill">Admin</button>
          <button className="nav-pill">Manager</button>
          <button className="nav-pill">Operator</button>
        </nav>
      </header>

      <main className="app-main">
        <section className="hero-panel">
          <div className="hero-copy">
            <h1 className="hero-title">Battery swap scheduling, reimagined.</h1>
            <p className="hero-body">
              This console orchestrates rolling 24 hour capacity, 15 minute booking
              windows and deterministic slot allocation across every swap station.
            </p>
          </div>
          <div className="hero-metric-card">
            <div className="metric-label">API status</div>
            <div className="metric-value">
              {isLoading && "Checking backend"}
              {!isLoading && error && "Unavailable"}
              {!isLoading && !error && health && "Online"}
            </div>
            <div className="metric-meta">
              {!isLoading && !error && health && (
                <span>Last heartbeat at {new Date(health.timestamp).toLocaleTimeString()}</span>
              )}
              {!isLoading && error && <span>{error}</span>}
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
    </div>
  );
}

export default App;
