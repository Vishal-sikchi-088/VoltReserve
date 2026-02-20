function Header({ currentUser, health, appStatus, onSignOut }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="brand-mark" />
        <div className="brand-text-group">
          <span className="brand-title">VoltReserve</span>
          <span className="brand-subtitle">Battery Swap Booking Console</span>
        </div>
      </div>
      <div className="app-header-right">
        {currentUser && (
          <button
            type="button"
            className="nav-pill nav-pill-secondary"
            onClick={onSignOut}
          >
            Sign out
          </button>
        )}
        <div className="app-status-pill">
          <span className="app-status-dot" data-status={health.status} />
          <span className="app-status-text">{appStatus}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;

