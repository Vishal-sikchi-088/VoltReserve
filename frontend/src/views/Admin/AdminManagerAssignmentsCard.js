function ManagerAssignmentsCard({
  stations,
  managers,
  assignments,
  assignForm,
  assignError,
  assignSuccess,
  onAssignFormChange,
  onAssignSubmit,
  onUnassign
}) {
  return (
    <div className="grid-card">
      <h2 className="section-title">Manager assignments</h2>
      <form className="login-form" onSubmit={onAssignSubmit}>
        <label className="login-label">
          <span>Station</span>
          <select
            className="login-input"
            value={assignForm.stationId}
            onChange={(event) =>
              onAssignFormChange("stationId", event.target.value)
            }
          >
            <option value="">Select station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </label>
        <label className="login-label">
          <span>Manager</span>
          <select
            className="login-input"
            value={assignForm.managerId}
            onChange={(event) =>
              onAssignFormChange("managerId", event.target.value)
            }
          >
            <option value="">Select manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.email})
              </option>
            ))}
          </select>
        </label>
        {assignError && <div className="login-error">{assignError}</div>}
        {assignSuccess && (
          <div className="login-success">{assignSuccess}</div>
        )}
        <button className="login-button" type="submit">
          Assign manager
        </button>
      </form>
      {assignments.length === 0 && (
        <p className="section-body">No manager assignments defined yet.</p>
      )}
      {assignments.length > 0 && (
        <div className="table">
          <div className="table-header">
            <span>Station</span>
            <span>Manager</span>
            <span />
          </div>
          {assignments.map((item) => (
            <div
              key={`${item.station_id}-${item.manager_id}`}
              className="table-row bookings-row"
            >
              <span>{item.station_name}</span>
              <span>
                {item.manager_name} ({item.manager_email})
              </span>
              <span className="table-actions">
                <button
                  type="button"
                  className="chip-button"
                  onClick={() => onUnassign(item.station_id, item.manager_id)}
                >
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManagerAssignmentsCard;
