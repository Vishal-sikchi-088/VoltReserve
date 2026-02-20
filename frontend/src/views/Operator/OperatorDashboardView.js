import { useEffect, useState } from "react";
import api from "../../services/api";
import HelpModal from "../../components/layout/HelpModal";
import OperatorHeroSection from "./OperatorHeroSection";
import OperatorStationsCard from "./OperatorStationsCard";
import OperatorSlotsCard from "./OperatorSlotsCard";
import OperatorBookingsCard from "./OperatorBookingsCard";

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
  const [showHelp, setShowHelp] = useState(false);
  const [helpContent, setHelpContent] = useState("");
  const [helpError, setHelpError] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

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

  function handleCloseHelp() {
    setShowHelp(false);
    setHelpContent("");
    setHelpError(null);
    setHelpLoading(false);
  }

  async function handleOpenHelp() {
    setShowHelp(true);
    setHelpContent("");
    setHelpError(null);
    setHelpLoading(true);
    try {
      const response = await fetch("/operator-panel-guide.md");
      if (!response.ok) {
        throw new Error("Failed to load help guide.");
      }
      const text = await response.text();
      setHelpContent(text);
    } catch (err) {
      setHelpError(err.message || "Could not load help guide.");
    } finally {
      setHelpLoading(false);
    }
  }

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

    let isCancelled = false;

    async function loadSlots() {
      try {
        const data = await api.get(
          `/api/operator/stations/${selectedStationId}/slots`
        );
        if (!isCancelled) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setSlots([]);
          setBookingError(err.message || "Could not load slots.");
        }
      }
    }

    loadSlots();

    const id = window.setInterval(loadSlots, 60000);

    return () => {
      isCancelled = true;
      window.clearInterval(id);
    };
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
      <OperatorHeroSection user={user} onOpenHelp={handleOpenHelp} />
      <section className="grid-panel">
        <OperatorStationsCard
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={handleSelectStation}
        />
        <OperatorSlotsCard
          selectedStationId={selectedStationId}
          slots={slots}
          bookingError={bookingError}
          bookingSuccess={bookingSuccess}
          bookingToReschedule={bookingToReschedule}
          onBookSlot={handleBookSlot}
        />
        <OperatorBookingsCard
          upcoming={upcoming}
          history={history}
          onCancelBooking={handleCancelBooking}
          onRescheduleBooking={handleReschedule}
        />
      </section>
      <HelpModal
        open={showHelp}
        loading={helpLoading}
        error={helpError}
        content={helpContent}
        headerLabel="Help"
        headerTitle="Operator console guide"
        onClose={handleCloseHelp}
      />
    </main>
  );
}

export default OperatorDashboardView;
