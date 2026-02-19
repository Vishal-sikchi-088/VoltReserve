import { useEffect, useState } from "react";
import api from "../../services/api";

function ManagerDashboardView() {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    api
      .get("/api/manager/stations")
      .then((data) => {
        setStations(data.stations || []);
      })
      .catch(() => {
        setStations([]);
      });
  }, []);

  return (
    <main className="app-main">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1 className="hero-title">Manager view.</h1>
          <p className="hero-body">
            View the stations you are responsible for and monitor upcoming booking
            demand as the system evolves.
          </p>
          {user && (
            <p className="section-body">
              Signed in as {user.name} ({user.role})
            </p>
          )}
          {!user && (
            <p className="section-body">
              You are not signed in. Use the Sign in screen and log in as a manager to
              see assigned stations.
            </p>
          )}
        </div>
      </section>

      <section className="grid-panel">
        <div className="grid-card">
          <h2 className="section-title">Assigned stations</h2>
          {stations.length === 0 && (
            <p className="section-body">
              No stations are assigned to this manager yet.
            </p>
          )}
          {stations.length > 0 && (
            <div className="table">
              <div className="table-header">
                <span>Name</span>
                <span>Location</span>
                <span>Hourly capacity</span>
              </div>
              {stations.map((station) => (
                <div key={station.id} className="table-row">
                  <span>{station.name}</span>
                  <span>{station.location}</span>
                  <span>{station.hourly_capacity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ManagerDashboardView;

