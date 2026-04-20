import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    updates: true,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      EMAIL_RE.test(form.email) &&
      form.password.length >= 6 &&
      form.password === form.confirmPassword,
    [form]
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

    if (form.name.trim().length < 2) {
      nextErrors.name = "Tell us what we should call you.";
    }
    if (!EMAIL_RE.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await registerUser({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      login(response.user, response.token);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setErrors({ general: error.message || "Failed to create account." });
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <div className="auth-orb auth-orb--one" />
      <div className="auth-orb auth-orb--two" />

      <section className="auth-shell">
        <div className="auth-hero">
          <p className="auth-kicker">Join CinemaVault</p>
          <h1>Build your personal archive of films, worlds, and obsessions.</h1>
          <p className="auth-copy">
            Create an account to save watchlists, return to curated director journeys,
            and explore cinema through a richer, more personal lens.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-pill">Save favorites instantly</div>
            <div className="auth-feature-pill">Track discoveries</div>
            <div className="auth-feature-pill">Curated experiences</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-mark" aria-hidden="true">
              <span className="auth-mark__tile auth-mark__tile--one" />
              <span className="auth-mark__tile auth-mark__tile--two" />
              <span className="auth-mark__tile auth-mark__tile--three" />
            </div>
            <h2>Create account</h2>
            <p>Start building your own cinematic control room.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="auth-error" role="alert">{errors.general}</div>
            )}
            <label className="auth-field">
              <span className="auth-label">Display name</span>
              <input
                className={`auth-input ${errors.name ? "auth-input--error" : ""}`}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
              />
              {errors.name && <span className="auth-error">{errors.name}</span>}
            </label>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            <label className="auth-field">
              <span className="auth-label">Confirm password</span>
              <div className="auth-password-wrap">
                <input
                  className={`auth-input ${errors.confirmPassword ? "auth-input--error" : ""}`}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button
                  className="auth-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="auth-error">{errors.confirmPassword}</span>
              )}
            </label>

            <div className="auth-row">
              <label className="auth-check">
                <input
                  type="checkbox"
                  name="updates"
                  checked={form.updates}
                  onChange={handleChange}
                />
                <span>Send me new release updates</span>
              </label>
              <Link to="/login" className="auth-inline-link">
                Already a member?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting || !isValid}
            >
              <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          {isSuccess && (
            <div className="auth-success" role="status">
              <strong>Account ready.</strong>
              <span>Redirecting you to sign in.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Register;
