import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    updates: true,
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  const isLoginValid = useMemo(
    () => EMAIL_RE.test(loginForm.email) && loginForm.password.trim().length >= 6,
    [loginForm.email, loginForm.password]
  );

  const isRegisterValid = useMemo(
    () =>
      registerForm.name.trim().length >= 2 &&
      EMAIL_RE.test(registerForm.email) &&
      registerForm.password.length >= 6 &&
      registerForm.password === registerForm.confirmPassword,
    [registerForm]
  );

  function handleLoginChange(event) {
    const { name, value, type, checked } = event.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setLoginErrors(prev => ({ ...prev, [name]: "" }));
  }

  function handleRegisterChange(event) {
    const { name, value, type, checked } = event.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setRegisterErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validateLogin() {
    const nextErrors = {};

    if (!EMAIL_RE.test(loginForm.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (loginForm.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setLoginErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateRegister() {
    const nextErrors = {};

    if (registerForm.name.trim().length < 2) {
      nextErrors.name = "Tell us what we should call you.";
    }
    if (!EMAIL_RE.test(registerForm.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (registerForm.password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setRegisterErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!validateLogin()) return;

    setIsLoginSubmitting(true);

    try {
      const response = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      });

      login(response.user, response.token);
      setIsLoginSubmitting(false);
      setIsLoginSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (error) {
      setLoginErrors({ general: error.message || "Invalid email or password." });
      setIsLoginSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    if (!validateRegister()) return;

    setIsRegisterSubmitting(true);

    try {
      const response = await registerUser({
        name: registerForm.name.trim(),
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      });

      login(response.user, response.token);
      setIsRegisterSubmitting(false);
      setIsRegisterSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setRegisterErrors({ general: error.message || "Failed to create account." });
      setIsRegisterSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--landing">
      <div className="auth-orb auth-orb--one" />
      <div className="auth-orb auth-orb--two" />

      <section className="auth-shell">
        <div className="auth-hero">
          <p className="auth-kicker">CinemaVault Access</p>
          <h1>
            Welcome to your <span>private</span> screening room.
          </h1>
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

        <div className="auth-card auth-card--landing">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "auth-tab--active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${activeTab === "register" ? "auth-tab--active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Create Account
            </button>
          </div>

          {activeTab === "login" && (
            <div className="auth-tab-content">
              <div className="auth-card-header">
                <div className="auth-mark" aria-hidden="true">
                  <span className="auth-mark__tile auth-mark__tile--one" />
                  <span className="auth-mark__tile auth-mark__tile--two" />
                  <span className="auth-mark__tile auth-mark__tile--three" />
                </div>
                <h2>Welcome back</h2>
                <p>Sign in and continue your next great movie hunt.</p>
              </div>

              <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                {loginErrors.general && (
                  <div className="auth-error" role="alert">{loginErrors.general}</div>
                )}
                <label className="auth-field">
                  <span className="auth-label">Email</span>
                  <input
                    className={`auth-input ${loginErrors.email ? "auth-input--error" : ""}`}
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {loginErrors.email && <span className="auth-error">{loginErrors.email}</span>}
                </label>

                <label className="auth-field">
                  <span className="auth-label">Password</span>
                  <div className="auth-password-wrap">
                    <input
                      className={`auth-input ${loginErrors.password ? "auth-input--error" : ""}`}
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      className="auth-toggle"
                      type="button"
                      onClick={() => setShowLoginPassword(prev => !prev)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <span className="auth-error">{loginErrors.password}</span>
                  )}
                </label>

                <div className="auth-row">
                  <label className="auth-check">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={loginForm.remember}
                      onChange={handleLoginChange}
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isLoginSubmitting || !isLoginValid}
                >
                  <span>{isLoginSubmitting ? "Signing In..." : "Sign In"}</span>
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

              {isLoginSuccess && (
                <div className="auth-success" role="status">
                  <strong>Welcome back.</strong>
                  <span>We&apos;re opening the vault for you now.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "register" && (
            <div className="auth-tab-content">
              <div className="auth-card-header">
                <div className="auth-mark" aria-hidden="true">
                  <span className="auth-mark__tile auth-mark__tile--one" />
                  <span className="auth-mark__tile auth-mark__tile--two" />
                  <span className="auth-mark__tile auth-mark__tile--three" />
                </div>
                <h2>Create account</h2>
                <p>Start building your own cinematic control room.</p>
              </div>

              <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
                {registerErrors.general && (
                  <div className="auth-error" role="alert">{registerErrors.general}</div>
                )}
                <label className="auth-field">
                  <span className="auth-label">Display name</span>
                  <input
                    className={`auth-input ${registerErrors.name ? "auth-input--error" : ""}`}
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  {registerErrors.name && <span className="auth-error">{registerErrors.name}</span>}
                </label>

                <label className="auth-field">
                  <span className="auth-label">Email</span>
                  <input
                    className={`auth-input ${registerErrors.email ? "auth-input--error" : ""}`}
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {registerErrors.email && <span className="auth-error">{registerErrors.email}</span>}
                </label>

                <label className="auth-field">
                  <span className="auth-label">Password</span>
                  <div className="auth-password-wrap">
                    <input
                      className={`auth-input ${registerErrors.password ? "auth-input--error" : ""}`}
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                    />
                    <button
                      className="auth-toggle"
                      type="button"
                      onClick={() => setShowRegisterPassword(prev => !prev)}
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <span className="auth-error">{registerErrors.password}</span>
                  )}
                </label>

                <label className="auth-field">
                  <span className="auth-label">Confirm password</span>
                  <div className="auth-password-wrap">
                    <input
                      className={`auth-input ${registerErrors.confirmPassword ? "auth-input--error" : ""}`}
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                    <button
                      className="auth-toggle"
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(prev => !prev)}
                      aria-label={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <span className="auth-error">{registerErrors.confirmPassword}</span>
                  )}
                </label>

                <div className="auth-row">
                  <label className="auth-check">
                    <input
                      type="checkbox"
                      name="updates"
                      checked={registerForm.updates}
                      onChange={handleRegisterChange}
                    />
                    <span>Send me new release updates</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isRegisterSubmitting || !isRegisterValid}
                >
                  <span>{isRegisterSubmitting ? "Creating Account..." : "Create Account"}</span>
                </button>
              </form>

              {isRegisterSuccess && (
                <div className="auth-success" role="status">
                  <strong>Account ready.</strong>
                  <span>Redirecting you to sign in.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Landing;
