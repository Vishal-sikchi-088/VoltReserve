function UsersCard({
  hasUsers,
  filteredUsers,
  userRoleFilter,
  userForm,
  isEditingUser,
  showUserPassword,
  userError,
  userSuccess,
  onUserRoleFilterChange,
  onUserFormChange,
  onToggleUserPassword,
  onUserSubmit,
  onEditUser,
  onDeleteUser,
  onResetUserForm
}) {
  return (
    <div className="grid-card">
      <h2 className="section-title">Users</h2>
      <div className="user-tabs">
        <button
          type="button"
          className={
            "user-tab" + (userRoleFilter === "ALL" ? " user-tab-active" : "")
          }
          onClick={() => onUserRoleFilterChange("ALL")}
        >
          All
        </button>
        <button
          type="button"
          className={
            "user-tab" + (userRoleFilter === "ADMIN" ? " user-tab-active" : "")
          }
          onClick={() => onUserRoleFilterChange("ADMIN")}
        >
          Admin
        </button>
        <button
          type="button"
          className={
            "user-tab" +
            (userRoleFilter === "MANAGER" ? " user-tab-active" : "")
          }
          onClick={() => onUserRoleFilterChange("MANAGER")}
        >
          Manager
        </button>
        <button
          type="button"
          className={
            "user-tab" +
            (userRoleFilter === "OPERATOR" ? " user-tab-active" : "")
          }
          onClick={() => onUserRoleFilterChange("OPERATOR")}
        >
          Operator
        </button>
      </div>
      <form className="login-form" onSubmit={onUserSubmit}>
        <label className="login-label">
          <span>Name</span>
          <input
            type="text"
            className="login-input"
            value={userForm.name}
            onChange={(event) =>
              onUserFormChange("name", event.target.value)
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
              onUserFormChange("email", event.target.value)
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
              onUserFormChange("role", event.target.value)
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
                  onUserFormChange("password", event.target.value)
                }
                placeholder="Initial password"
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={onToggleUserPassword}
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
              onClick={onResetUserForm}
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
                  onClick={() => onEditUser(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="chip-button"
                  onClick={() => onDeleteUser(item)}
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersCard;
