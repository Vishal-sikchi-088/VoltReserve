import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState("OPERATOR");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState("forward");
  const animationTimeoutRef = useRef(null);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await api.post("/api/auth/login", {
        email,
        password,
        selectedRole: activeRole
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

  function getRoleMeta(role) {
    if (role === "ADMIN") {
      return {
        label: "Admin",
        header: "Sign in as Admin",
        description:
          "Full access to configure stations, users, and monitor system-wide performance.",
        icon: "🛡"
      };
    }
    if (role === "MANAGER") {
      return {
        label: "Manager",
        header: "Sign in as Manager",
        description:
          "Station-level view to monitor bookings, mark completions, and track recent stats.",
        icon: "📊"
      };
    }
    return {
      label: "Operator",
      header: "Sign in as Operator",
      description:
        "Create and manage your own bookings across assigned stations and time windows.",
      icon: "🚚"
    };
  }

  function handleSelectRole(role) {
    if (role === activeRole || isAnimating) {
      return;
    }

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const order = ["ADMIN", "MANAGER", "OPERATOR"];
    const currentIndex = order.indexOf(activeRole);
    const nextIndex = order.indexOf(role);
    const direction = nextIndex > currentIndex ? "forward" : "backward";

    setActiveRole(role);
    setAnimationDirection(direction);
    setIsAnimating(true);
    setEmail('')
    setPassword('')
    setError('')

    animationTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 400);
  }

  const activeMeta = getRoleMeta(activeRole);

  return (
    <div className="role-signin-root">
      <div className="role-toggle-row">
        {["ADMIN", "MANAGER", "OPERATOR"].map((role) => {
          const meta = getRoleMeta(role);
          const isActive = role === activeRole;
          const baseClass = "role-toggle-card";
          const roleClass =
            role === "ADMIN"
              ? "role-toggle-admin"
              : role === "MANAGER"
                ? "role-toggle-manager"
                : "role-toggle-operator";
          const activeClass = isActive ? " role-toggle-active" : "";
          return (
            <button
              key={role}
              type="button"
              className={baseClass + " " + roleClass + activeClass}
              onClick={() => handleSelectRole(role)}
            >
              <div className="role-toggle-icon">{meta.icon}</div>
              <div className="role-toggle-text">
                <div className="role-toggle-label">{meta.label}</div>
                <div className="role-toggle-caption">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="role-header">
        <div
          className={
            "role-header-pill" +
            (activeRole === "ADMIN"
              ? " role-header-admin"
              : activeRole === "MANAGER"
                ? " role-header-manager"
                : " role-header-operator")
          }
        >
          <span className="role-header-icon">{activeMeta.icon}</span>
          <span className="role-header-text">{activeMeta.header}</span>
        </div>
      </div>
      <div className="role-form-wrapper">
        <form
          className={
            "login-form role-form-static" +
            (activeRole === "ADMIN"
              ? " role-form-admin"
              : activeRole === "MANAGER"
                ? " role-form-manager"
                : " role-form-operator") +
            (isAnimating
              ? animationDirection === "forward"
                ? " role-form-swap-forward"
                : " role-form-swap-backward"
              : "")
          }
          onSubmit={handleSubmit}
        >
          <label className="login-label">
            <span>Email</span>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@voltreserve.local"
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
                placeholder="Enter your password"
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
          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignInForm;
