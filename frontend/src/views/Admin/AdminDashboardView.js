import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminDashboardView() {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: "",
    hourly_capacity: ""
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userForm, setUserForm] = useState({
    id: null,
    name: "",
    email: "",
    role: "OPERATOR",
    password: ""
  });
  const [userError, setUserError] = useState(null);
  const [userSuccess, setUserSuccess] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [assignForm, setAssignForm] = useState({
    stationId: "",
    managerId: ""
  });
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(null);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationStats, setStationStats] = useState(null);
  const [stationStatsError, setStationStatsError] = useState(null);
  const [stationStatsLoading, setStationStatsLoading] = useState(false);
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

  useEffect(() => {
    api
      .get("/api/admin/stations")
      .then((data) => {
        setStations(data.stations || []);
      })
      .catch(() => {
        setStations([]);
      });
  }, []);

  useEffect(() => {
    api
      .get("/api/admin/users")
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch(() => {
        setUsers([]);
      });
    api
      .get("/api/admin/managers")
      .then((data) => {
        setManagers(data.managers || []);
      })
      .catch(() => {
        setManagers([]);
      });
    api
      .get("/api/admin/stations/assignments")
      .then((data) => {
        setAssignments(data.assignments || []);
      })
      .catch(() => {
        setAssignments([]);
      });
  }, []);

  function handleChange(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const name = form.name.trim();
    const location = form.location.trim();
    const parsedCapacity = parseFloat(form.hourly_capacity);

    if (!name || !location || Number.isNaN(parsedCapacity)) {
      setError("Name, location, and numeric hourly capacity are required.");
      return;
    }

    try {
      const result = await api.post("/api/admin/stations", {
        name,
        location,
        hourly_capacity: parsedCapacity
      });
      const station = result.station;
      setStations((previous) => [...previous, station]);
      setForm({
        name: "",
        location: "",
        hourly_capacity: ""
      });
      setSuccessMessage("Station created successfully.");
    } catch (err) {
      setError(err.message || "Could not create station.");
    }
  }

  function handleUserFormChange(field, value) {
    setUserForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function resetUserForm() {
    setUserForm({
      id: null,
      name: "",
      email: "",
      role: "OPERATOR",
      password: ""
    });
    setIsEditingUser(false);
    setShowUserPassword(false);
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    const name = userForm.name.trim();
    const email = userForm.email.trim();
    const role = userForm.role;
    const password = userForm.password;

    if (!name || !email || !role || (!isEditingUser && !password)) {
      setUserError(
        "Name, email, role and password (for new users) are required."
      );
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+(com|org|net|edu|gov|co\.in|in)$/;
    if (!emailPattern.test(email)) {
      setUserError("Please enter a valid email address.");
      return;
    }

    if (!isEditingUser) {
      const hasMinLength = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[^A-Za-z0-9]/.test(password);
      if (!(hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol)) {
        setUserError(
          "Password must be at least 8 characters with upper, lower, number and symbol."
        );
        return;
      }
    }

    try {
      if (isEditingUser && userForm.id) {
        const result = await api.put(`/api/admin/users/${userForm.id}`, {
          name,
          email,
          role
        });
        const updated = result.user;
        setUsers((previous) =>
          previous.map((item) => (item.id === updated.id ? updated : item))
        );
        setManagers((previous) => {
          const remaining = previous.filter((item) => item.id !== updated.id);
          if (updated.role === "MANAGER") {
            return [...remaining, updated];
          }
          return remaining;
        });
        setUserSuccess("User updated successfully.");
      } else {
        const result = await api.post("/api/admin/users", {
          name,
          email,
          role,
          password
        });
        const created = result.user;
        setUsers((previous) => [created, ...previous]);
         if (created.role === "MANAGER") {
           setManagers((previous) => [...previous, created]);
         }
        setUserSuccess("User created successfully.");
      }
      resetUserForm();
    } catch (err) {
      setUserError(err.message || "Could not save user.");
    }
  }

  function handleEditUser(userToEdit) {
    setIsEditingUser(true);
    setUserForm({
      id: userToEdit.id,
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      password: ""
    });
    setUserError(null);
    setUserSuccess(null);
  }

  async function handleDeleteUser(userToDelete) {
    setUserError(null);
    setUserSuccess(null);
    try {
      await api.delete(`/api/admin/users/${userToDelete.id}`);
      setUsers((previous) =>
        previous.filter((item) => item.id !== userToDelete.id)
      );
      setUserSuccess("User deleted successfully.");
    } catch (err) {
      setUserError(err.message || "Could not delete user.");
    }
  }

  function handleAssignFormChange(field, value) {
    setAssignForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleAssignSubmit(event) {
    event.preventDefault();
    setAssignError(null);
    setAssignSuccess(null);

    const stationId = Number.parseInt(assignForm.stationId, 10);
    const managerId = Number.parseInt(assignForm.managerId, 10);

    if (Number.isNaN(stationId) || Number.isNaN(managerId)) {
      setAssignError("Station and manager must be selected.");
      return;
    }

    try {
      await api.post("/api/admin/stations/assign-manager", {
        stationId,
        managerId
      });
      setAssignSuccess("Manager assigned to station.");
      setAssignForm({
        stationId: "",
        managerId: ""
      });
      const data = await api.get("/api/admin/stations/assignments");
      setAssignments(data.assignments || []);
    } catch (err) {
      setAssignError(err.message || "Could not assign manager.");
    }
  }

  function handleCloseStationStats() {
    setSelectedStation(null);
    setStationStats(null);
    setStationStatsError(null);
    setStationStatsLoading(false);
  }

  async function handleOpenStationStats(station) {
    setSelectedStation(station);
    setStationStats(null);
    setStationStatsError(null);
    setStationStatsLoading(true);
    try {
      const data = await api.get(`/api/admin/stations/${station.id}/stats`);
      setStationStats(data);
    } catch (err) {
      setStationStatsError(err.message || "Could not load station metrics.");
    } finally {
      setStationStatsLoading(false);
    }
  }

  async function handleUnassign(stationId, managerId) {
    setAssignError(null);
    setAssignSuccess(null);
    try {
      await api.delete(
        `/api/admin/stations/${stationId}/managers/${managerId}`
      );
      setAssignments((previous) =>
        previous.filter(
          (item) =>
            !(
              item.station_id === stationId && item.manager_id === managerId
            )
        )
      );
      setAssignSuccess("Manager unassigned from station.");
    } catch (err) {
      setAssignError(err.message || "Could not unassign manager.");
    }
  }

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
      const response = await fetch("/admin-panel-guide.md");
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

  const hasUsers = users.length > 0;
  const filteredUsers =
    userRoleFilter === "ALL"
      ? users
      : users.filter((item) => item.role === userRoleFilter);

  return (
    <main className="app-main">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-title-row">
            <h1 className="hero-title">Admin console.</h1>
            <button
              type="button"
              className="admin-help-button"
              onClick={handleOpenHelp}
              aria-label="Admin help guide"
            >
              ?
            </button>
          </div>
          <p className="hero-body">
            Define swap stations and their hourly capacity, then assign managers and
            operators to run day to day operations.
          </p>
          {user && (
            <p className="section-body">
              Signed in as {user.name} ({user.role})
            </p>
          )}
          {!user && (
            <p className="section-body">
              You are not signed in. Use the Sign in screen and log in as an admin to
              manage stations.
            </p>
          )}
        </div>
        <div className="hero-metric-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">
              <span>Station name</span>
              <input
                type="text"
                className="login-input"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="City Logistics Hub"
              />
            </label>
            <label className="login-label">
              <span>Location</span>
              <input
                type="text"
                className="login-input"
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
                placeholder="East Warehouse District"
              />
            </label>
            <label className="login-label">
              <span>Hourly capacity</span>
              <input
                type="number"
                step="0.1"
                min="0"
                className="login-input"
                value={form.hourly_capacity}
                onChange={(event) =>
                  handleChange("hourly_capacity", event.target.value)
                }
                placeholder="2.5"
              />
            </label>
            {error && <div className="login-error">{error}</div>}
            {successMessage && (
              <div className="login-success">{successMessage}</div>
            )}
            <button className="login-button" type="submit">
              Create station
            </button>
          </form>
        </div>
      </section>

      <section className="grid-panel">
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
                  onClick={() => handleOpenStationStats(station)}
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
          <h2 className="section-title">Users</h2>
          <div className="user-tabs">
            <button
              type="button"
              className={
                "user-tab" + (userRoleFilter === "ALL" ? " user-tab-active" : "")
              }
              onClick={() => setUserRoleFilter("ALL")}
            >
              All
            </button>
            <button
              type="button"
              className={
                "user-tab" + (userRoleFilter === "ADMIN" ? " user-tab-active" : "")
              }
              onClick={() => setUserRoleFilter("ADMIN")}
            >
              Admin
            </button>
            <button
              type="button"
              className={
                "user-tab" +
                (userRoleFilter === "MANAGER" ? " user-tab-active" : "")
              }
              onClick={() => setUserRoleFilter("MANAGER")}
            >
              Manager
            </button>
            <button
              type="button"
              className={
                "user-tab" +
                (userRoleFilter === "OPERATOR" ? " user-tab-active" : "")
              }
              onClick={() => setUserRoleFilter("OPERATOR")}
            >
              Operator
            </button>
          </div>
          <form className="login-form" onSubmit={handleUserSubmit}>
            <label className="login-label">
              <span>Name</span>
              <input
                type="text"
                className="login-input"
                value={userForm.name}
                onChange={(event) =>
                  handleUserFormChange("name", event.target.value)
                }
                placeholder="Full name"
              />
            </label>
            <label className="login-label">
              <span>Email</span>
              <input
                type="email"
                className="login-input"
                value={userForm.email}
                onChange={(event) =>
                  handleUserFormChange("email", event.target.value)
                }
                placeholder="user@voltreserve.local"
              />
            </label>
            <label className="login-label">
              <span>Role</span>
              <select
                className="login-input"
                value={userForm.role}
                onChange={(event) =>
                  handleUserFormChange("role", event.target.value)
                }
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="OPERATOR">Operator</option>
              </select>
            </label>
            {!isEditingUser && (
              <label className="login-label">
                <span>Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showUserPassword ? "text" : "password"}
                    className="login-input password-input"
                    value={userForm.password}
                    onChange={(event) =>
                      handleUserFormChange("password", event.target.value)
                    }
                    placeholder="Initial password"
                  />
                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() =>
                      setShowUserPassword((previous) => !previous)
                    }
                  >
                    {showUserPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            )}
            {userError && <div className="login-error">{userError}</div>}
            {userSuccess && <div className="login-success">{userSuccess}</div>}
            <div className="login-actions">
              <button className="login-button" type="submit">
                {isEditingUser ? "Update user" : "Create user"}
              </button>
              {isEditingUser && (
                <button
                  type="button"
                  className="login-button login-button-secondary"
                  onClick={resetUserForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {!hasUsers && <p className="section-body">No users found.</p>}
          {hasUsers && filteredUsers.length === 0 && (
            <p className="section-body">No users for this role.</p>
          )}
          {filteredUsers.length > 0 && (
            <div className="table">
              <div className="table-header table-header-4">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span />
              </div>
              {filteredUsers.map((item) => (
                <div
                  key={item.id}
                  className="table-row bookings-row table-row-4"
                >
                  <span>{item.name}</span>
                  <span>{item.email}</span>
                  <span>{item.role}</span>
                  <span className="table-actions">
                    <button
                      type="button"
                      className="chip-button"
                      onClick={() => handleEditUser(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="chip-button"
                      onClick={() => handleDeleteUser(item)}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid-card">
          <h2 className="section-title">Manager assignments</h2>
          <form className="login-form" onSubmit={handleAssignSubmit}>
            <label className="login-label">
              <span>Station</span>
              <select
                className="login-input"
                value={assignForm.stationId}
                onChange={(event) =>
                  handleAssignFormChange("stationId", event.target.value)
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
                  handleAssignFormChange("managerId", event.target.value)
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
                      onClick={() =>
                        handleUnassign(item.station_id, item.manager_id)
                      }
                    >
                      Remove
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedStation && (
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
                onClick={handleCloseStationStats}
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
                        const label = date.toLocaleString();
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
      )}
      {showHelp && (
        <div className="station-modal-backdrop">
          <div className="station-modal help-modal">
            <div className="station-modal-header">
              <div>
                <div className="metric-label">Help</div>
                <div className="station-modal-title">Admin panel guide</div>
              </div>
              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseHelp}
              >
                Close
              </button>
            </div>
            {helpLoading && (
              <p className="section-body">Loading guide…</p>
            )}
            {helpError && <p className="section-body">{helpError}</p>}
            {!helpLoading && !helpError && helpContent && (
              <div className="help-markdown">
                {helpContent.split("\n").map((line, index) => {
                  const key = `help-line-${index}`;
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={key}>{line.replace(/^### /, "")}</h3>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={key}>{line.replace(/^## /, "")}</h2>
                    );
                  }
                  if (line.startsWith("!-")) {
                    return null;
                  }
                  const imageMatch = line.match(/^!\[(.*)\]\((.*)\)/);
                  if (imageMatch) {
                    const alt = imageMatch[1] || "";
                    let src = imageMatch[2] || "";
                    if (
                      src &&
                      !src.startsWith("/")
                    ) {
                      src = `/${src}`;
                    }
                    return (
                      <div key={key} className="help-image-wrapper">
                        <img
                          src={src}
                          alt={alt}
                          className="help-image"
                        />
                      </div>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <p key={key}>• {line.slice(2)}</p>
                    );
                  }
                  if (line.startsWith("> ")) {
                    return (
                      <p key={key} className="help-quote">
                        {line.slice(2)}
                      </p>
                    );
                  }
                  if (line.trim() === "") {
                    return <br key={key} />;
                  }
                  return <p key={key}>{line}</p>;
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboardView;
