import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await api.post("/api/auth/login", {
        email,
        password
      });
      setSuccessUser(result.user);

      const role = result.user && result.user.role;
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "MANAGER") {
        navigate("/manager");
      } else if (role === "OPERATOR") {
        navigate("/operator");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Login failed");
      setSuccessUser(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-main">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1 className="hero-title">Sign in to VoltReserve.</h1>
          <p className="hero-body">
            Use the seeded admin account for the first login, then create managers and
            operators from the admin console.
          </p>
        </div>
        <div className="hero-metric-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">
              <span>Email</span>
              <input
                type="email"
                className="login-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@voltreserve.local"
                required
              />
            </label>
            <label className="login-label">
              <span>Password</span>
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin123!"
                required
              />
            </label>
            {error && <div className="login-error">{error}</div>}
            {successUser && (
              <div className="login-success">
                Signed in as {successUser.name} ({successUser.role})
              </div>
            )}
            <button
              className="login-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginView;
