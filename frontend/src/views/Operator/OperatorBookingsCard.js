import { useState } from "react";

function renderStatusIcon(status) {
  const normalized = status || "";
  const baseClass = "status-pill";
  let variantClass = "";
  if (normalized === "CONFIRMED") {
    variantClass = " status-pill-confirmed";
  } else if (normalized === "COMPLETED") {
    variantClass = " status-pill-completed";
  } else if (normalized === "NO_SHOW") {
    variantClass = " status-pill-no-show";
  } else if (normalized === "CANCELLED") {
    variantClass = " status-pill-cancelled";
  }
  const label =
    normalized === "CONFIRMED"
      ? "Confirmed"
      : normalized === "COMPLETED"
        ? "Completed"
        : normalized === "NO_SHOW"
          ? "No-show"
          : normalized === "CANCELLED"
            ? "Cancelled"
            : normalized;
  return (
    <span
      className={baseClass + variantClass}
      title={label}
      aria-label={label}
    />
  );
}

function formatBookingDateTime(date) {
  return date.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function OperatorBookingsCard({
  upcoming,
  history,
  onCancelBooking,
  onRescheduleBooking
}) {
  const [openActionsBookingId, setOpenActionsBookingId] = useState(null);
  const hasNoBookings = upcoming.length === 0 && history.length === 0;

  return (
    <div className="grid-card">
      <h2 className="section-title">Your bookings</h2>
      {hasNoBookings && (
        <p className="section-body">No bookings yet.</p>
      )}
      {upcoming.length > 0 && (
        <>
          <h3 className="section-subtitle">Upcoming</h3>
          <div className="status-legend">
            <span className="status-legend-label">Status</span>
            <span className="status-legend-item">
              <span className="status-pill status-pill-confirmed" />
              <span className="status-legend-text">Confirmed</span>
            </span>
            <span className="status-legend-item">
              <span className="status-pill status-pill-completed" />
              <span className="status-legend-text">Completed</span>
            </span>
            <span className="status-legend-item">
              <span className="status-pill status-pill-no-show" />
              <span className="status-legend-text">No-show</span>
            </span>
            <span className="status-legend-item">
              <span className="status-pill status-pill-cancelled" />
              <span className="status-legend-text">Cancelled</span>
            </span>
          </div>
          <div className="table">
            <div className="table-header table-header-4">
              <span>Station</span>
              <span>Start</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {upcoming.map((booking) => {
              const start = new Date(booking.slot_start_utc);
              const label = formatBookingDateTime(start);
              const now = new Date();
              const diffMs = start.getTime() - now.getTime();
              const diffHours = diffMs / (1000 * 60 * 60);
              const canCancel =
                booking.status === "CONFIRMED" && diffHours >= 1;
              const stationLabel = booking.station_name || booking.station_id;
              return (
                <div
                  key={booking.id}
                  className="table-row bookings-row table-row-4"
                >
                  <span>{stationLabel}</span>
                  <span>{label}</span>
                  <span>{renderStatusIcon(booking.status)}</span>
                  <span className="table-actions">
                    {canCancel && (
                      <div className="booking-actions">
                        <button
                          type="button"
                          className={
                            "booking-actions-trigger" +
                            (openActionsBookingId === booking.id
                              ? " booking-actions-trigger-active"
                              : "")
                          }
                          onClick={() =>
                            setOpenActionsBookingId(
                              openActionsBookingId === booking.id
                                ? null
                                : booking.id
                            )
                          }
                          aria-label="Show booking actions"
                        >
                          ⋯
                        </button>
                        {openActionsBookingId === booking.id && (
                          <div className="booking-actions-menu">
                            <button
                              type="button"
                              className="chip-button"
                              onClick={() => onCancelBooking(booking)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="chip-button"
                              onClick={() => onRescheduleBooking(booking)}
                            >
                              Reschedule
                            </button>
                          </div>
                        )}
                      </div>
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
              const label = formatBookingDateTime(start);
              const stationLabel = booking.station_name || booking.station_id;
              return (
                <div key={booking.id} className="table-row">
                  <span>{stationLabel}</span>
                  <span>{label}</span>
                  <span>{renderStatusIcon(booking.status)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default OperatorBookingsCard;
