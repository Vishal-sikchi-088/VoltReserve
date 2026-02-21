function formatMetricsDateTime(date) {
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

function StationMetricsModal({
  selectedStation,
  stationStatsLoading,
  stationStatsError,
  stationStats,
  onClose
}) {
  if (!selectedStation) {
    return null;
  }

  return (
    <div className="station-modal-backdrop">
      <div className="station-modal">
        <div className="station-modal-header">
          <div>
            <div className="metric-label">Station</div>
            <div className="station-modal-title">{selectedStation.name}</div>
            <div className="station-modal-subtitle">
              {selectedStation.location} • Capacity {selectedStation.hourly_capacity}
              /hour
            </div>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {stationStatsLoading && (
          <p className="section-body">Loading station metrics…</p>
        )}
        {stationStatsError && (
          <p className="section-body">{stationStatsError}</p>
        )}
        {!stationStatsLoading && !stationStatsError && stationStats && (
          <>
            <div className="station-metrics-row">
              <div className="station-metric-card">
                <div className="metric-label">Bookings (last 7 days)</div>
                <div className="station-metric-value">
                  {stationStats.weekly ? stationStats.weekly.total : stationStats.total}
                </div>
              </div>
              <div className="station-metric-card">
                <div className="metric-label">Bookings (last 30 days)</div>
                <div className="station-metric-value">
                  {stationStats.monthly ? stationStats.monthly.total : "—"}
                </div>
              </div>
              <div className="station-metric-card">
                <div className="metric-label">No-shows (last 7 days)</div>
                <div className="station-metric-value">
                  {stationStats.weekly && stationStats.weekly.byStatus
                    ? stationStats.weekly.byStatus.NO_SHOW || 0
                    : (stationStats.byStatus && stationStats.byStatus.NO_SHOW) || 0}
                </div>
              </div>
              <div className="station-metric-card">
                <div className="metric-label">Completion rate (7 days)</div>
                <div className="station-metric-value">
                  {stationStats.weekly
                    ? Math.round((stationStats.weekly.completionRate || 0) * 100)
                    : Math.round(
                        (1 - (stationStats.noShowRate || 0)) * 100
                      )}
                  %
                </div>
              </div>
            </div>
            <div className="station-metrics-row">
              <div className="station-metric-card">
                <div className="metric-label">Utilization (7 days)</div>
                <div className="station-metric-value">
                  {stationStats.weekly
                    ? Math.round(
                        (stationStats.weekly.utilizationPercent || 0) * 100
                      )
                    : 0}
                  %
                </div>
              </div>
              <div className="station-metric-card">
                <div className="metric-label">
                  Cancellations (last 7 days)
                </div>
                <div className="station-metric-value">
                  {stationStats.weekly && stationStats.weekly.cancellations
                    ? stationStats.weekly.cancellations
                    : 0}
                </div>
              </div>
              <div className="station-metric-card">
                <div className="metric-label">
                  Cancellations (last 30 days)
                </div>
                <div className="station-metric-value">
                  {stationStats.monthly && stationStats.monthly.cancellations
                    ? stationStats.monthly.cancellations
                    : 0}
                </div>
              </div>
            </div>
            <div className="station-modal-section">
              <div className="metric-label">
                Daily booking counts (last 7 days)
              </div>
              {stationStats.daily && stationStats.daily.length === 0 && (
                <p className="section-body">
                  No bookings in the last 7 days.
                </p>
              )}
              {stationStats.daily && stationStats.daily.length > 0 && (
                <div className="table">
                  <div className="table-header">
                    <span>Date</span>
                    <span>Total</span>
                    <span>No-shows</span>
                  </div>
                  {stationStats.daily.map((item) => (
                    <div key={item.date} className="table-row">
                      <span>{item.date}</span>
                      <span>{item.total}</span>
                      <span>{item.noShow}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="station-modal-section">
              <div className="metric-label">
                Last 7 days booking summary
              </div>
              {stationStats.recent && stationStats.recent.length === 0 && (
                <p className="section-body">
                  No bookings in the last 7 days.
                </p>
              )}
              {stationStats.recent && stationStats.recent.length > 0 && (
                <div className="table">
                  <div className="table-header">
                    <span>Start time</span>
                    <span>Operator</span>
                    <span>Status</span>
                  </div>
                  {stationStats.recent.slice(0, 10).map((item) => {
                    const date = new Date(item.slot_start_utc);
                    const label = formatMetricsDateTime(date);
                    return (
                      <div key={item.id} className="table-row">
                        <span>{label}</span>
                        <span>{item.operator_name}</span>
                        <span>{item.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StationMetricsModal;
