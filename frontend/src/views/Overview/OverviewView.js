import { useEffect, useState } from "react";
import api from "../../services/api";
import SignInForm from "../../components/auth/SignInForm";

function OverviewView() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <main className="app-main">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1 className="hero-title">Battery swap scheduling, reimagined.</h1>
          <p className="hero-body">
            This console orchestrates rolling 24 hour capacity, 15 minute booking
            windows and deterministic slot allocation across every swap station.
          </p>
          <div className="barriers-panel-hero">
            <h2 className="section-title">
              Barriers &amp; Solutions to Truck Electrification
            </h2>
            <div className="barriers-layout">
              <div className="barriers-column barriers-column-left">
                <div className="barrier-item">
                  <div className="barrier-icon">₹</div>
                  <div className="barrier-text">
                    <div className="barrier-heading">High up-front costs</div>
                    <div className="barrier-body">
                      EVs require 3x the capital investment compared to a diesel truck.
                    </div>
                  </div>
                </div>
                <div className="barrier-item">
                  <div className="barrier-icon">⏱</div>
                  <div className="barrier-text">
                    <div className="barrier-heading">Downtime</div>
                    <div className="barrier-body">
                      EVs have higher refuelling downtime compared to diesel trucks.
                    </div>
                  </div>
                </div>
                <div className="barrier-item">
                  <div className="barrier-icon">⚡</div>
                  <div className="barrier-text">
                    <div className="barrier-heading">Range anxiety</div>
                    <div className="barrier-body">
                      Limited and time consuming charging infrastructure hinders fleet
                      scalability.
                    </div>
                  </div>
                </div>
              </div>
              <div className="barriers-center">
                <div className="barriers-diamond">
                  <div className="barriers-diamond-label barriers-diamond-label-left">
                    Barriers
                  </div>
                  <div className="barriers-diamond-icon">⇄</div>
                  <div className="barriers-diamond-label barriers-diamond-label-right">
                    Solutions
                  </div>
                </div>
              </div>
              <div className="barriers-column barriers-column-right">
                <div className="solution-item">
                  <div className="solution-icon">🏷</div>
                  <div className="solution-text">
                    <div className="solution-heading">Unbundling</div>
                    <div className="solution-body">
                      Separate truck and battery ownership to reduce capital investment.
                    </div>
                  </div>
                </div>
                <div className="solution-item">
                  <div className="solution-icon">🔁</div>
                  <div className="solution-text">
                    <div className="solution-heading">Battery swap</div>
                    <div className="solution-body">
                      Five minute swapping keeps operations efficient with minimal
                      downtime.
                    </div>
                  </div>
                </div>
                <div className="solution-item">
                  <div className="solution-icon">📅</div>
                  <div className="solution-text">
                    <div className="solution-heading">Smart scheduling</div>
                    <div className="solution-body">
                      Fleet software coordinates swaps and charging for
                      high-efficiency operations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            <SignInForm />
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
