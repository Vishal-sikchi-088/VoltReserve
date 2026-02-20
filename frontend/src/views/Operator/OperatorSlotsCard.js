function OperatorSlotsCard({
  selectedStationId,
  slots,
  bookingError,
  bookingSuccess,
  bookingToReschedule,
  onBookSlot
}) {
  return (
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
                  onClick={() => onBookSlot(slot)}
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
  );
}

export default OperatorSlotsCard;

