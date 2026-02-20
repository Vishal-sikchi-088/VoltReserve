import { useEffect, useState } from "react";
import api from "../../services/api";

function ManagerDashboardView() {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

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
      setActionError(null);
      setActionSuccess(null);
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
    setActionError(null);
    setActionSuccess(null);
  }

  async function handleCompleteBooking(booking) {
    if (!selectedStationId) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.post(
        `/api/manager/stations/${selectedStationId}/bookings/${booking.id}/complete`
      );
      setActionSuccess("Booking marked as completed.");
      const refreshedBookings = await api.get(
        `/api/manager/stations/${selectedStationId}/bookings`
      );
      setBookings(refreshedBookings.bookings || []);
      const refreshedStats = await api.get(
        `/api/manager/stations/${selectedStationId}/stats`
      );
      setStats(refreshedStats);
    } catch (err) {
      setActionError(
        err.message || "Booking could not be marked as completed."
      );
    }
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
              <div className="table-header table-header-4">
                <span>Operator</span>
                <span>Start</span>
                <span>Status</span>
                <span />
              </div>
              {actionError && (
                <div className="login-error">{actionError}</div>
              )}
              {actionSuccess && (
                <div className="login-success">{actionSuccess}</div>
              )}
              {bookings.map((booking) => {
                const start = new Date(booking.slot_start_utc);
                const label = start.toLocaleString();
                 const now = new Date();
                 const diffMs = start.getTime() - now.getTime();
                 const diffMinutes = diffMs / (1000 * 60);
                 const canComplete =
                   booking.status === "CONFIRMED" && diffMinutes <= 30;
                return (
                  <div
                    key={booking.id}
                    className="table-row bookings-row table-row-4"
                  >
                    <span>{booking.operator_name}</span>
                    <span>{label}</span>
                    <span>{booking.status}</span>
                    <span className="table-actions">
                      {canComplete && (
                        <button
                          type="button"
                          className="chip-button"
                          onClick={() => handleCompleteBooking(booking)}
                        >
                          Mark completed
                        </button>
                      )}
                    </span>
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
            <>
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
              {stats.recent && stats.recent.length > 0 && (
                <div className="table">
                  <div className="table-header">
                    <span>Operator</span>
                    <span>Start</span>
                    <span>Status</span>
                  </div>
                  {stats.recent.map((item) => {
                    const start = new Date(item.slot_start_utc);
                    const label = start.toLocaleString();
                    return (
                      <div key={item.id} className="table-row">
                        <span>{item.operator_name}</span>
                        <span>{label}</span>
                        <span>{item.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {(!stats.recent || stats.recent.length === 0) && (
                <p className="section-body">
                  No bookings in the last 7 days for this station.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default ManagerDashboardView;
