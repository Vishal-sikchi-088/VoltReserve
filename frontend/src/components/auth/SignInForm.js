import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="login-input password-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin123!"
            required
          />
          <button
            type="button"
            className="password-toggle-button"
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      {error && <div className="login-error">{error}</div>}
      {successUser && (
        <div className="login-success">
          Signed in as {successUser.name} ({successUser.role})
        </div>
      )}
      <button className="login-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default SignInForm;
