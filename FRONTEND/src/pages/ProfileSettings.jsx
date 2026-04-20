import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateSavedUserByEmail } from "../utils/userStorage";
import { updateUserProfile, changeUserPassword } from "../api/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileSettings() {
  const { user, token, updateUser } = useAuth();
  const [values, setValues] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      setValues(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  function validateForm() {
    const newErrors = {};

    if (!values.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!values.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_RE.test(values.email)) {
      newErrors.email = "Invalid email format";
    }

    if (values.newPassword || values.confirmPassword) {
      if (values.newPassword !== values.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
      if (values.newPassword?.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (!values.currentPassword?.trim()) {
        newErrors.currentPassword = "Current password required to change password";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setStatus("");
    setStatusMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setStatus("");
    setStatusMessage("");

    try {
      let updatedUser = null;

      if (token) {
        const profileResponse = await updateUserProfile(token, {
          name: values.name,
          email: values.email,
        });
        updatedUser = profileResponse.user;

        if (values.newPassword) {
          await changeUserPassword(token, {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          });
        }
      } else {
        updatedUser = updateSavedUserByEmail(user.email, {
          name: values.name,
          email: values.email,
          ...(values.newPassword && { password: values.newPassword }),
        });
      }

      if (updatedUser) {
        updateUser(updatedUser);
        setValues(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setStatus("success");
        setStatusMessage("");
        setEditMode(false);
        setTimeout(() => {
          setStatus("");
          setStatusMessage("");
        }, 3000);
      } else {
        throw new Error("Unable to save profile changes.");
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage(err.message || "Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ps-root">
      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <div className="ps-header-content">
            <h1 className="ps-title">Profile Settings</h1>
            <p className="ps-subtitle">Manage your account information and security</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="ps-grid">
          {/* Profile Card */}
          <div className="ps-card ps-profile-card">
            <div className="ps-card-header">
              <h2 className="ps-card-title"> Personal Information</h2>
              <button
                className={`ps-edit-toggle ${editMode ? "ps-edit-toggle--active" : ""}`}
                onClick={() => setEditMode(!editMode)}
                type="button"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>

            {!editMode ? (
              <div className="ps-profile-display">
                <div className="ps-profile-item">
                  <span className="ps-label">Name</span>
                  <p className="ps-value">{values.name || "Not set"}</p>
                </div>
                <div className="ps-profile-item">
                  <span className="ps-label">Email</span>
                  <p className="ps-value">{values.email || "Not set"}</p>
                </div>
                <div className="ps-profile-item">
                  <span className="ps-label">Account Status</span>
                  <p className="ps-value ps-status-active">✓ Active</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="ps-form">
                {/* Name Field */}
                <div className="ps-form-group">
                  <label htmlFor="name" className="ps-form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    className={`ps-form-input ${errors.name ? "ps-form-input--error" : ""}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <span className="ps-form-error">{errors.name}</span>}
                </div>

                {/* Email Field */}
                <div className="ps-form-group">
                  <label htmlFor="email" className="ps-form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    className={`ps-form-input ${errors.email ? "ps-form-input--error" : ""}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="ps-form-error">{errors.email}</span>}
                  <p className="ps-form-hint">We'll use this to log you in</p>
                </div>

                {/* Password Section */}
                <div className="ps-form-divider">
                  <h3 className="ps-form-subtitle"> Change Password (Optional)</h3>
                </div>

                {/* Current Password */}
                <div className="ps-form-group">
                  <label htmlFor="currentPassword" className="ps-form-label">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={values.currentPassword}
                    onChange={handleChange}
                    className={`ps-form-input ${errors.currentPassword ? "ps-form-input--error" : ""}`}
                    placeholder="Enter current password"
                  />
                  {errors.currentPassword && (
                    <span className="ps-form-error">{errors.currentPassword}</span>
                  )}
                </div>

                {/* New Password */}
                <div className="ps-form-group">
                  <label htmlFor="newPassword" className="ps-form-label">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={values.newPassword}
                    onChange={handleChange}
                    className={`ps-form-input ${errors.newPassword ? "ps-form-input--error" : ""}`}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  {errors.newPassword && (
                    <span className="ps-form-error">{errors.newPassword}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="ps-form-group">
                  <label htmlFor="confirmPassword" className="ps-form-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    className={`ps-form-input ${errors.confirmPassword ? "ps-form-input--error" : ""}`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <span className="ps-form-error">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Status Messages */}
                {status === "success" && (
                  <div className="ps-status ps-status--success">
                    ✓ Profile updated successfully!
                  </div>
                )}
                {status === "error" && (
                  <div className="ps-status ps-status--error">
                    ✕ {statusMessage || "Error updating profile. Please try again."}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`ps-submit-btn ${loading ? "ps-submit-btn--loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="ps-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Security Info Card */}
          <div className="ps-card ps-info-card">
            <h2 className="ps-card-title"> Security Tips</h2>
            <div className="ps-tips-list">
              <div className="ps-tip">
                <span className="ps-tip-icon">✓</span>
                <p>Use a strong password with numbers and special characters</p>
              </div>
              <div className="ps-tip">
                <span className="ps-tip-icon">✓</span>
                <p>Never share your password with anyone</p>
              </div>
              <div className="ps-tip">
                <span className="ps-tip-icon">✓</span>
                <p>Change your password regularly for better security</p>
              </div>
              <div className="ps-tip">
                <span className="ps-tip-icon">✓</span>
                <p>Keep your email address up to date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileSettings;