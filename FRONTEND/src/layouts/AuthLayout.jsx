import React from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <Link to="/" className="brand-logo">
          🎬 CinemaVault
        </Link>
      </header>
      <main className="auth-content">
        <Outlet />
      </main>
    </div>
  );
}
