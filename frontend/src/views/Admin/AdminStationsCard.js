function StationsCard({ stations, selectedStation, onSelectStation }) {
  return (
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
            <button
              key={station.id}
              type="button"
              className={
                "table-row table-row-button" +
                (selectedStation && selectedStation.id === station.id
                  ? " table-row-selected"
                  : "")
              }
              onClick={() => onSelectStation(station)}
            >
              <span>{station.name}</span>
              <span>{station.location}</span>
              <span>{station.hourly_capacity}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StationsCard;
