import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Account from "./components/Account";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Directors from "./pages/Directors";
import DirectorProfile from "./pages/DirectorProfile";
import Watchlist from "./pages/Watchlist";
import Experience from "./pages/Experience";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import ProfileSettings from "./pages/ProfileSettings";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import WatchHistory from "./pages/WatchHistory";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          ) : (
            <Landing />
          )
        }
      >
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieDetail />} />
        <Route path="show/:id" element={<MovieDetail />} />
        <Route path="directors" element={<Directors />} />
        <Route path="director/:id" element={<DirectorProfile />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="experience" element={<Experience />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="preferences" element={<Preferences />} />
        <Route path="history" element={<WatchHistory />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
