import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Account() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <div className="account-menu">
      <button
        className="account-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Account menu"
      >
        <span className="account-name">{user?.name || user?.email}</span>
        <span className="account-icon">▼</span>
      </button>

      {dropdownOpen && (
        <div className="account-dropdown">
          <div className="account-info">
            <p className="account-email">{user?.email}</p>
            <p className="account-member">Member since {new Date().getFullYear()}</p>
          </div>
          <div className="account-actions">
            <button
              className="account-action"
              onClick={() => {
                navigate("/profile");
                setDropdownOpen(false);
              }}
            >
              Profile Settings
            </button>
            <button
              className="account-action"
              onClick={() => {
                navigate("/preferences");
                setDropdownOpen(false);
              }}
            >
              Preferences
            </button>
            <hr />
            <button className="account-action logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;