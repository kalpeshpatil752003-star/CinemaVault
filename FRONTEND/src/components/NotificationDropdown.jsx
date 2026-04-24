import React, { useState, useEffect, useRef } from "react";
import apiClient from "../api/client";
import { Link } from "react-router-dom";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    // Close on click outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
      <style>{`
        .notif-btn {
          background: transparent;
          border: none;
          color: #a0a0a0;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          transition: color 0.2s;
        }
        .notif-btn:hover, .notif-btn.active {
          color: #00d2ff;
        }
        .notif-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ff3366;
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-menu {
          position: absolute;
          top: calc(100% + 15px);
          right: -50px;
          width: 320px;
          background: rgba(15, 15, 20, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .notif-header h4 {
          margin: 0;
          font-size: 1rem;
          color: #fff;
        }
        .notif-mark-all {
          background: none;
          border: none;
          color: #00d2ff;
          font-size: 0.8rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .notif-mark-all:hover {
          opacity: 0.8;
        }
        .notif-list {
          max-height: 350px;
          overflow-y: auto;
        }
        .notif-list::-webkit-scrollbar {
          width: 6px;
        }
        .notif-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .notif-empty {
          padding: 32px 16px;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }
        .notif-item {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: background 0.2s;
        }
        .notif-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .notif-item.unread {
          background: rgba(0, 210, 255, 0.05);
          border-left: 3px solid #00d2ff;
        }
        .notif-item p {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #ddd;
          line-height: 1.4;
          text-align: left;
        }
        .notif-item .timestamp {
          font-size: 0.75rem;
          color: #666;
          display: block;
          text-align: left;
        }
      `}</style>

      <button 
        className={`notif-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-menu">
          <div className="notif-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="notif-mark-all">
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No new notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.isRead ? "read" : "unread"}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <p>{n.content}</p>
                  <span className="timestamp">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
