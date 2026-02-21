function OperatorSlotsCard({
  selectedStationId,
  slots,
  bookingError,
  bookingSuccess,
  bookingToReschedule,
  onBookSlot
}) {
  const groupedSlots = [];

  if (slots && slots.length > 0) {
    const byDate = new Map();
    slots.forEach((slot) => {
      const start = new Date(slot.startUtc);
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, "0");
      const day = String(start.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;
      const label = start.toLocaleDateString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      let group = byDate.get(key);
      if (!group) {
        group = { key, label, items: [] };
        byDate.set(key, group);
        groupedSlots.push(group);
      }
      group.items.push(slot);
    });
  }

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
              ).toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
              })}
              . Choose a new slot above to confirm.
            </p>
          )}
          {groupedSlots.map((group) => (
            <div key={group.key} className="slots-day-group">
              <div className="slots-day-label">{group.label}</div>
              <div className="slots-grid">
                {group.items.map((slot) => {
                  const start = new Date(slot.startUtc);
                  const label = start.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
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
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default OperatorSlotsCard;
