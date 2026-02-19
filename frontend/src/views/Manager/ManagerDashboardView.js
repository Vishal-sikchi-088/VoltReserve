import { useEffect, useState } from "react";
import api from "../../services/api";

function ManagerDashboardView() {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);

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
    if (!selectedStationId) {
      setSlots([]);
      setBookings([]);
      setStats(null);
      return;
    }

    api
      .get(`/api/manager/stations/${selectedStationId}/slots`)
      .then((data) => {
        setSlots(data.slots || []);
      })
      .catch(() => {
        setSlots([]);
      });

    api
      .get(`/api/manager/stations/${selectedStationId}/bookings`)
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch(() => {
        setBookings([]);
      });

    api
      .get(`/api/manager/stations/${selectedStationId}/stats`)
      .then((data) => {
        setStats(data);
      })
      .catch(() => {
        setStats(null);
      });
  }, [selectedStationId]);

  function handleSelectStation(stationId) {
    setSelectedStationId(stationId);
  }

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
                <button
                  key={station.id}
                  type="button"
                  className={
                    "table-row table-row-button" +
                    (selectedStationId === station.id ? " table-row-selected" : "")
                  }
                  onClick={() => handleSelectStation(station.id)}
                >
                  <span>{station.name}</span>
                  <span>{station.location}</span>
                  <span>{station.hourly_capacity}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid-card">
          <h2 className="section-title">Capacity outlook (24h)</h2>
          {!selectedStationId && (
            <p className="section-body">
              Select a station to see how its next 24 hours of slots compare to
              available capacity.
            </p>
          )}
          {selectedStationId && slots.length === 0 && (
            <p className="section-body">No slots found for the selected station.</p>
          )}
          {selectedStationId && slots.length > 0 && (
            <div className="slots-grid">
              {slots.map((slot) => {
                const start = new Date(slot.startUtc);
                const label = start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                });
                const utilisation =
                  slot.maxCapacity === 0
                    ? 0
                    : 1 - slot.availableCapacity / slot.maxCapacity;
                const isTight = utilisation >= 0.75;

                return (
                  <div
                    key={slot.startUtc}
                    className={
                      "slot-pill" + (isTight ? " slot-pill-available" : "")
                    }
                  >
                    <span>{label}</span>
                    <span className="slot-pill-meta">
                      {slot.maxCapacity - slot.availableCapacity}/{slot.maxCapacity} used
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid-card">
          <h2 className="section-title">Upcoming bookings</h2>
          {!selectedStationId && (
            <p className="section-body">
              Select a station to see confirmed upcoming bookings.
            </p>
          )}
          {selectedStationId && bookings.length === 0 && (
            <p className="section-body">No upcoming bookings for this station.</p>
          )}
          {selectedStationId && bookings.length > 0 && (
            <div className="table">
              <div className="table-header">
                <span>Operator</span>
                <span>Start</span>
                <span>Status</span>
              </div>
              {bookings.map((booking) => {
                const start = new Date(booking.slot_start_utc);
                const label = start.toLocaleString();
                return (
                  <div key={booking.id} className="table-row bookings-row">
                    <span>{booking.operator_name}</span>
                    <span>{label}</span>
                    <span>{booking.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid-card">
          <h2 className="section-title">7-day booking stats</h2>
          {!selectedStationId && (
            <p className="section-body">
              Select a station to see booking volume and no-show rate for the last
              7 days.
            </p>
          )}
          {selectedStationId && !stats && (
            <p className="section-body">No data available for this station.</p>
          )}
          {selectedStationId && stats && (
            <div className="metric-row">
              <div>
                <div className="metric-label">Total bookings</div>
                <div className="metric-value">{stats.total}</div>
                <div className="metric-meta">
                  Confirmed:{' '}
                  {(stats.byStatus && stats.byStatus.CONFIRMED) || 0}
                  {'  '} Completed:{' '}
                  {(stats.byStatus && stats.byStatus.COMPLETED) || 0}
                </div>
              </div>
              <div>
                <div className="metric-label">No-show rate</div>
                <div className="metric-value">
                  {Math.round((stats.noShowRate || 0) * 100)}%
                </div>
                <div className="metric-meta">
                  No-shows:{' '}
                  {(stats.byStatus && stats.byStatus.NO_SHOW) || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ManagerDashboardView;
