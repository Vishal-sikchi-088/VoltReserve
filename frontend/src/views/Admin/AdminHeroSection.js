function AdminHeroSection({
  user,
  form,
  error,
  successMessage,
  onChange,
  onSubmit,
  onOpenHelp
}) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <div className="hero-title-row">
          <h1 className="hero-title">Admin console.</h1>
          <button
            type="button"
            className="admin-help-button"
            onClick={onOpenHelp}
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
        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-label">
            <span>Station name</span>
            <input
              type="text"
              className="login-input"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="City Logistics Hub"
            />
          </label>
          <label className="login-label">
            <span>Location</span>
            <input
              type="text"
              className="login-input"
              value={form.location}
              onChange={(event) => onChange("location", event.target.value)}
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
                onChange("hourly_capacity", event.target.value)
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
  );
}

export default AdminHeroSection;
