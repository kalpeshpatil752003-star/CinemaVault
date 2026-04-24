import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getWatchlist } from "../utils/watchlist";
import Account from "./Account";
import NotificationDropdown from "./NotificationDropdown";

function Header() {
  const { isAuthenticated, token } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function syncWatchlistCount() {
      if (!token) {
        setCount(0);
        return;
      }

      try {
        const list = await getWatchlist(token);
        setCount(list.length);
      } catch (error) {
        console.error("Failed to sync watchlist count:", error);
        setCount(0);
      }
    }

    syncWatchlistCount();
    window.addEventListener("storage", syncWatchlistCount);
    window.addEventListener("watchlistUpdated", syncWatchlistCount);

    return () => {
      window.removeEventListener("storage", syncWatchlistCount);
      window.removeEventListener("watchlistUpdated", syncWatchlistCount);
    };
  }, [token]);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/cinemavault-logo-horizontal.svg" alt="CinemaVault Logo" className="logo-img" />
        </Link>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/directors">Directors</Link>
          <Link to="/watchlist">Watchlist ({count})</Link>
          <Link to="/experience">Experience</Link>
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <NotificationDropdown />
              <Account />
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/directors" onClick={() => setMobileMenuOpen(false)}>Directors</Link>
          <Link to="/watchlist" onClick={() => setMobileMenuOpen(false)}>
            Watchlist ({count})
          </Link>
          <Link to="/experience" onClick={() => setMobileMenuOpen(false)}>Experience</Link>
          {isAuthenticated ? (
            <div className="mobile-account" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <NotificationDropdown />
              <Account />
            </div>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
