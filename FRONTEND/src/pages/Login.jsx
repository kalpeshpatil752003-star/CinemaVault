import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = useMemo(
    () => EMAIL_RE.test(form.email) && form.password.trim().length >= 6,
    [form.email, form.password]
  );

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};

    if (!EMAIL_RE.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      login(response.user, response.token);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (error) {
      setErrors({ general: error.message || "Invalid email or password." });
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <main className="auth-page auth-page--login" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading" style={{ textAlign: "center" }}>
          <div className="spinner"></div>
          <h2 style={{ marginTop: "1rem" }}>Signing in...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page--login">
      <div className="auth-orb auth-orb--one" />
      <div className="auth-orb auth-orb--two" />

      <section className="auth-shell">
        <div className="auth-hero">
          <p className="auth-kicker">CinemaVault Access</p>
          <h1>Sign in to unlock your private screening room.</h1>
          <p className="auth-copy">
            Track your watchlist, jump back into cinematic worlds, and keep your
            favorites synced in one neon-lit vault.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-pill">Watchlist memory</div>
            <div className="auth-feature-pill">Director deep dives</div>
            <div className="auth-feature-pill">Experience mode access</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-mark" aria-hidden="true">
              <span className="auth-mark__tile auth-mark__tile--one" />
              <span className="auth-mark__tile auth-mark__tile--two" />
              <span className="auth-mark__tile auth-mark__tile--three" />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in and continue your next great movie hunt.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="auth-error" role="alert">{errors.general}</div>
            )}
            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input
                className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <div className="auth-password-wrap">
                <input
                  className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  className="auth-toggle"
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span className="auth-error">{errors.password}</span>
              )}
            </label>

            <div className="auth-row">
              <label className="auth-check">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <span>Keep me signed in</span>
              </label>
              <Link to="/register" className="auth-inline-link">
                Need an account?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting || !isValid}
            >
              <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-socials">
            <button type="button" className="auth-social auth-social--google">
              <span>Google</span>
            </button>
            <button type="button" className="auth-social auth-social--facebook">
              <span>Facebook</span>
            </button>
          </div>

          <p className="auth-switch">
            New to CinemaVault? <Link to="/register">Create account</Link>
          </p>

          {isSuccess && (
            <div className="auth-success" role="status">
              <strong>Welcome back.</strong>
              <span>We&apos;re opening the vault for you now.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Login;
