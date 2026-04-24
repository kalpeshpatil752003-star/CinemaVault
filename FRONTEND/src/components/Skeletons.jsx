import React from "react";

export function MovieCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image shimmer"></div>
      <div className="skeleton-text title shimmer"></div>
      <div className="skeleton-text date shimmer"></div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-avatar shimmer"></div>
      <div className="skeleton-info">
        <div className="skeleton-text name shimmer"></div>
        <div className="skeleton-text bio shimmer"></div>
        <div className="skeleton-stats shimmer"></div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="skeleton-review">
      <div className="skeleton-text user shimmer"></div>
      <div className="skeleton-text content shimmer"></div>
      <div className="skeleton-text content shimmer"></div>
    </div>
  );
}

export function DirectorSkeleton() {
  return (
    <div className="skeleton-director">
      <div className="skeleton-avatar shimmer"></div>
      <div className="skeleton-text name shimmer"></div>
    </div>
  );
}
