function OperatorHeroSection({ user, onOpenHelp }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <div className="hero-title-row">
          <h1 className="hero-title">Operator console.</h1>
          <button
            type="button"
            className="admin-help-button"
            onClick={onOpenHelp}
            aria-label="Operator help guide"
          >
            ?
          </button>
        </div>
        <p className="hero-body">
          View available swap stations and, in later iterations, drill into rolling
          slot availability to create bookings.
        </p>
        {user && (
          <p className="section-body">
            Signed in as {user.name} ({user.role})
          </p>
        )}
        {!user && (
          <p className="section-body">
            You are not signed in. Use the Sign in screen and log in as an operator
            to see compatible stations.
          </p>
        )}
      </div>
    </section>
  );
}

export default OperatorHeroSection;

