import { useEffect, useState } from "react";
import api from "../../services/api";

function OperatorDashboardView() {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);

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
    function loadBookings() {
      api
        .get("/api/operator/bookings")
        .then((data) => {
          setUpcoming(data.upcoming || []);
          setHistory(data.history || []);
        })
        .catch(() => {
          setUpcoming([]);
          setHistory([]);
        });
    }

    loadBookings();

    const id = window.setInterval(loadBookings, 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selectedStationId) {
      setSlots([]);
      return;
    }

    api
      .get(`/api/operator/stations/${selectedStationId}/slots`)
      .then((data) => {
        setSlots(data.slots || []);
      })
      .catch((err) => {
        setSlots([]);
        setBookingError(err.message || "Could not load slots.");
      });
  }, [selectedStationId]);

  async function handleSelectStation(stationId) {
    setSelectedStationId(stationId);
    setBookingError(null);
    setBookingSuccess(null);
    setBookingToReschedule(null);
  }

  async function handleBookSlot(slot) {
    if (!selectedStationId) {
      return;
    }

    setBookingError(null);
    setBookingSuccess(null);

    try {
      if (bookingToReschedule) {
        await api.post("/api/operator/bookings", {
          stationId: selectedStationId,
          slotStartUtc: slot.startUtc
        });
        await api.delete(`/api/operator/bookings/${bookingToReschedule.id}`);
        setBookingToReschedule(null);
        setBookingSuccess("Booking rescheduled.");
      } else {
        await api.post("/api/operator/bookings", {
          stationId: selectedStationId,
          slotStartUtc: slot.startUtc
        });
        setBookingSuccess("Booking created.");
      }

      const bookings = await api.get("/api/operator/bookings");
      setUpcoming(bookings.upcoming || []);
      setHistory(bookings.history || []);

      const data = await api.get(`/api/operator/stations/${selectedStationId}/slots`);
      setSlots(data.slots || []);
    } catch (err) {
      setBookingError(err.message || "Booking failed.");
    }
  }

  async function handleCancelBooking(booking) {
    setBookingError(null);
    setBookingSuccess(null);
    setBookingToReschedule(null);
    try {
      await api.delete(`/api/operator/bookings/${booking.id}`);
      setBookingSuccess("Booking cancelled.");
      const bookings = await api.get("/api/operator/bookings");
      setUpcoming(bookings.upcoming || []);
      setHistory(bookings.history || []);
      if (selectedStationId) {
        const data = await api.get(
          `/api/operator/stations/${selectedStationId}/slots`
        );
        setSlots(data.slots || []);
      }
    } catch (err) {
      setBookingError(
        err.message ||
          "Booking could not be cancelled. It might be too close to the start time."
      );
    }
  }

  function handleReschedule(booking) {
    setBookingError(null);
    setBookingSuccess(null);
    setBookingToReschedule(booking);
    setSelectedStationId(booking.station_id);
  }

  useEffect(() => {
    api
      .get("/api/operator/stations")
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
          <h1 className="hero-title">Operator console.</h1>
          <p className="hero-body">
            View available swap stations and, in later iterations, drill into rolling
            slot availability to create bookings.
          </p>
          {user && (
            <p className="section-body">
              Signed in as {user.name} ({user.role})
            </p>
          )}
          {!user && (
            <p className="section-body">
              You are not signed in. Use the Sign in screen and log in as an operator
              to see compatible stations.
            </p>
          )}
        </div>
      </section>

      <section className="grid-panel">
        <div className="grid-card">
          <h2 className="section-title">Stations</h2>
          {stations.length === 0 && (
            <p className="section-body">No stations available for booking yet.</p>
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
          <h2 className="section-title">Next 24 hours</h2>
          {!selectedStationId && (
            <p className="section-body">
              Select a station to see 15 minute slots and capacity.
            </p>
          )}
          {selectedStationId && slots.length === 0 && (
            <p className="section-body">No slots found.</p>
          )}
          {selectedStationId && slots.length > 0 && (
            <>
              {bookingError && <div className="login-error">{bookingError}</div>}
              {bookingSuccess && (
                <div className="login-success">{bookingSuccess}</div>
              )}
              {bookingToReschedule && (
                <p className="section-body">
                  Rescheduling booking starting at{" "}
                  {new Date(
                    bookingToReschedule.slot_start_utc
                  ).toLocaleString()}
                  . Choose a new slot above to confirm.
                </p>
              )}
              <div className="slots-grid">
                {slots.map((slot) => {
                  const start = new Date(slot.startUtc);
                  const label = start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  const isAvailable = slot.availableCapacity > 0;
                  return (
                    <button
                      key={slot.startUtc}
                      type="button"
                      className={
                        "slot-pill" + (isAvailable ? " slot-pill-available" : "")
                      }
                      disabled={!isAvailable}
                      onClick={() => handleBookSlot(slot)}
                    >
                      <span>{label}</span>
                      <span className="slot-pill-meta">
                        {slot.availableCapacity}/{slot.maxCapacity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="grid-card">
          <h2 className="section-title">Your bookings</h2>
          {upcoming.length === 0 && history.length === 0 && (
            <p className="section-body">No bookings yet.</p>
          )}
          {upcoming.length > 0 && (
            <>
              <h3 className="section-subtitle">Upcoming</h3>
              <div className="table">
                <div className="table-header">
                  <span>Station</span>
                  <span>Start</span>
                  <span>Status</span>
                  <span />
                </div>
                {upcoming.map((booking) => {
                  const start = new Date(booking.slot_start_utc);
                  const label = start.toLocaleString();
                  const now = new Date();
                  const diffMs = start.getTime() - now.getTime();
                  const diffHours = diffMs / (1000 * 60 * 60);
                  const canCancel =
                    booking.status === "CONFIRMED" && diffHours >= 1;
                  const stationLabel = booking.station_name || booking.station_id;
                  return (
                    <div key={booking.id} className="table-row bookings-row">
                      <span>{stationLabel}</span>
                      <span>{label}</span>
                      <span>{booking.status}</span>
                      <span>
                        {canCancel && (
                          <>
                            <button
                              type="button"
                              className="chip-button"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="chip-button"
                              onClick={() => handleReschedule(booking)}
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {history.length > 0 && (
            <>
              <h3 className="section-subtitle">History</h3>
              <div className="table">
                <div className="table-header">
                  <span>Station</span>
                  <span>Start</span>
                  <span>Status</span>
                </div>
                {history.map((booking) => {
                  const start = new Date(booking.slot_start_utc);
                  const label = start.toLocaleString();
                  const stationLabel = booking.station_name || booking.station_id;
                  return (
                    <div key={booking.id} className="table-row">
                      <span>{stationLabel}</span>
                      <span>{label}</span>
                      <span>{booking.status}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default OperatorDashboardView;
