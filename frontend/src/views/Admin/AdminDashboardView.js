import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminDashboardView() {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: "",
    hourly_capacity: ""
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
      .get("/api/admin/stations")
      .then((data) => {
        setStations(data.stations || []);
      })
      .catch(() => {
        setStations([]);
      });
  }, []);

  function handleChange(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const name = form.name.trim();
    const location = form.location.trim();
    const parsedCapacity = parseFloat(form.hourly_capacity);

    if (!name || !location || Number.isNaN(parsedCapacity)) {
      setError("Name, location, and numeric hourly capacity are required.");
      return;
    }

    try {
      const result = await api.post("/api/admin/stations", {
        name,
        location,
        hourly_capacity: parsedCapacity
      });
      const station = result.station;
      setStations((previous) => [...previous, station]);
      setForm({
        name: "",
        location: "",
        hourly_capacity: ""
      });
      setSuccessMessage("Station created successfully.");
    } catch (err) {
      setError(err.message || "Could not create station.");
    }
  }

  return (
    <main className="app-main">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1 className="hero-title">Admin console.</h1>
          <p className="hero-body">
            Define swap stations and their hourly capacity, then assign managers and
            operators to run day to day operations.
          </p>
          {user && (
            <p className="section-body">
              Signed in as {user.name} ({user.role})
            </p>
          )}
          {!user && (
            <p className="section-body">
              You are not signed in. Use the Sign in screen and log in as an admin to
              manage stations.
            </p>
          )}
        </div>
        <div className="hero-metric-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">
              <span>Station name</span>
              <input
                type="text"
                className="login-input"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="City Logistics Hub"
              />
            </label>
            <label className="login-label">
              <span>Location</span>
              <input
                type="text"
                className="login-input"
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
                placeholder="East Warehouse District"
              />
            </label>
            <label className="login-label">
              <span>Hourly capacity</span>
              <input
                type="number"
                step="0.1"
                min="0"
                className="login-input"
                value={form.hourly_capacity}
                onChange={(event) =>
                  handleChange("hourly_capacity", event.target.value)
                }
                placeholder="2.5"
              />
            </label>
            {error && <div className="login-error">{error}</div>}
            {successMessage && (
              <div className="login-success">{successMessage}</div>
            )}
            <button className="login-button" type="submit">
              Create station
            </button>
          </form>
        </div>
      </section>

      <section className="grid-panel">
        <div className="grid-card">
          <h2 className="section-title">Stations</h2>
          {stations.length === 0 && (
            <p className="section-body">No stations defined yet.</p>
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

export default AdminDashboardView;

