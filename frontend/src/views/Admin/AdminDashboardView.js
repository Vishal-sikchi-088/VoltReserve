import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminHeroSection from "./AdminHeroSection";
import StationsCard from "./AdminStationsCard";
import UsersCard from "./AdminUsersCard";
import ManagerAssignmentsCard from "./AdminManagerAssignmentsCard";
import StationMetricsModal from "./AdminStationMetricsModal";
import HelpModal from "./HelpModal";

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
  const [userToDelete, setUserToDelete] = useState(null);
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
  const [assignmentToRemove, setAssignmentToRemove] = useState(null);

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

  function handleRequestDeleteUser(userToDelete) {
    setUserError(null);
    setUserSuccess(null);
    setUserToDelete(userToDelete);
  }

  function handleCancelDeleteUser() {
    setUserToDelete(null);
  }

  async function handleConfirmDeleteUser() {
    if (!userToDelete) {
      return;
    }
    setUserError(null);
    setUserSuccess(null);
    try {
      await api.delete(`/api/admin/users/${userToDelete.id}`);
      setUsers((previous) =>
        previous.filter((item) => item.id !== userToDelete.id)
      );
      setManagers((previous) =>
        previous.filter((item) => item.id !== userToDelete.id)
      );
      setUserSuccess("User deleted successfully.");
    } catch (err) {
      setUserError(err.message || "Could not delete user.");
    } finally {
      setUserToDelete(null);
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

  function handleRequestUnassign(stationId, managerId) {
    setAssignError(null);
    setAssignSuccess(null);
    const found = assignments.find(
      (item) =>
        item.station_id === stationId && item.manager_id === managerId
    );
    if (found) {
      setAssignmentToRemove(found);
      return;
    }
    setAssignmentToRemove({
      station_id: stationId,
      manager_id: managerId
    });
  }

  function handleCancelUnassign() {
    setAssignmentToRemove(null);
  }

  async function handleConfirmUnassign() {
    if (!assignmentToRemove) {
      return;
    }
    setAssignError(null);
    setAssignSuccess(null);
    try {
      const stationId = assignmentToRemove.station_id;
      const managerId = assignmentToRemove.manager_id;
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
    } finally {
      setAssignmentToRemove(null);
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

  function handleUserRoleFilterChange(nextRole) {
    setUserRoleFilter(nextRole);
  }

  function handleToggleUserPassword() {
    setShowUserPassword((previous) => !previous);
  }

  const hasUsers = users.length > 0;
  const filteredUsers =
    userRoleFilter === "ALL"
      ? users
      : users.filter((item) => item.role === userRoleFilter);

  return (
    <main className="app-main">
      <AdminHeroSection
        user={user}
        form={form}
        error={error}
        successMessage={successMessage}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onOpenHelp={handleOpenHelp}
      />

      <section className="grid-panel">
        <StationsCard
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={handleOpenStationStats}
        />
        <UsersCard
          hasUsers={hasUsers}
          filteredUsers={filteredUsers}
          userRoleFilter={userRoleFilter}
          userForm={userForm}
          isEditingUser={isEditingUser}
          showUserPassword={showUserPassword}
          userError={userError}
          userSuccess={userSuccess}
          onUserRoleFilterChange={handleUserRoleFilterChange}
          onUserFormChange={handleUserFormChange}
          onToggleUserPassword={handleToggleUserPassword}
          onUserSubmit={handleUserSubmit}
          onEditUser={handleEditUser}
          onDeleteUser={handleRequestDeleteUser}
          onResetUserForm={resetUserForm}
        />
        <ManagerAssignmentsCard
          stations={stations}
          managers={managers}
          assignments={assignments}
          assignForm={assignForm}
          assignError={assignError}
          assignSuccess={assignSuccess}
          onAssignFormChange={handleAssignFormChange}
          onAssignSubmit={handleAssignSubmit}
          onUnassign={handleRequestUnassign}
        />
      </section>

      <StationMetricsModal
        selectedStation={selectedStation}
        stationStatsLoading={stationStatsLoading}
        stationStatsError={stationStatsError}
        stationStats={stationStats}
        onClose={handleCloseStationStats}
      />
      <HelpModal
        open={showHelp}
        loading={helpLoading}
        error={helpError}
        content={helpContent}
        headerLabel="Help"
        headerTitle="Admin panel guide"
        onClose={handleCloseHelp}
      />
      {userToDelete && (
        <div className="station-modal-backdrop">
          <div className="station-modal">
            <div className="station-modal-header">
              <div>
                <div className="metric-label">Confirm delete</div>
                <div className="station-modal-title">
                  Delete user {userToDelete.name}?
                </div>
                <div className="station-modal-subtitle">
                  This will permanently remove the user and their access.
                </div>
              </div>
            </div>
            <p className="section-body">
              Are you sure you want to delete {userToDelete.name} (
              {userToDelete.email})?
            </p>
            <div className="table-actions">
              <button
                type="button"
                className="chip-button"
                onClick={handleCancelDeleteUser}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-close-button"
                onClick={handleConfirmDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {assignmentToRemove && (
        <div className="station-modal-backdrop">
          <div className="station-modal">
            <div className="station-modal-header">
              <div>
                <div className="metric-label">Confirm unassign</div>
                <div className="station-modal-title">
                  Remove manager from {assignmentToRemove.station_name}?
                </div>
                <div className="station-modal-subtitle">
                  This will remove the manager assignment from this station.
                </div>
              </div>
            </div>
            <p className="section-body">
              Are you sure you want to remove {assignmentToRemove.manager_name} (
              {assignmentToRemove.manager_email}) from{" "}
              {assignmentToRemove.station_name}?
            </p>
            <div className="table-actions">
              <button
                type="button"
                className="chip-button"
                onClick={handleCancelUnassign}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-close-button"
                onClick={handleConfirmUnassign}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboardView;
