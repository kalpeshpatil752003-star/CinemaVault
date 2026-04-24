import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";
import { ProfileSkeleton } from "../components/Skeletons";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // If no ID is provided, assume we want to view the current user's profile
  const targetId = id || user?.id;

  useEffect(() => {
    async function loadProfile() {
      if (!targetId) return;
      try {
        setLoading(true);
        // Using the public profile endpoint
        const data = await apiClient.get(`/users/profile/${targetId}`);
        setProfileData(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [targetId]);

  if (loading) return <ProfileSkeleton />;
  if (!profileData) return <div className="error-message">Profile not found</div>;

  return (
    <div className="social-profile-container">
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img
            src={profileData.avatar || "/default-avatar.png"}
            alt={profileData.name}
            className="profile-avatar"
          />
          {profileData.isOnline && <span className="online-indicator"></span>}
        </div>
        <div className="profile-title">
          <h1>{profileData.name}</h1>
          <p className="bio">{profileData.bio || "No bio provided yet."}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <span className="stat-number">{profileData._count?.watchlist || 0}</span>
          <span className="stat-label">Watchlist</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{profileData._count?.reviews || 0}</span>
          <span className="stat-label">Reviews</span>
        </div>
      </div>

      <div className="profile-favorites">
        {profileData.favoriteDirector && (
          <div className="favorite-item">
            <h3>Favorite Director</h3>
            <p>{profileData.favoriteDirector}</p>
          </div>
        )}
        {profileData.favoriteGenres?.length > 0 && (
          <div className="favorite-item">
            <h3>Favorite Genres</h3>
            <div className="genre-tags">
              {profileData.favoriteGenres.map((g, i) => (
                <span key={i} className="genre-tag">{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
