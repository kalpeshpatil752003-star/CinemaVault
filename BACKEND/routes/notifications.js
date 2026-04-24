import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION ROUTES (Protected)
// ═══════════════════════════════════════════════════════════════

// GET /api/notifications
// Get all notifications for the authenticated user
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50 // Limit to recent 50
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
// Mark a specific notification as read
router.put("/:id/read", verifyToken, async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:id
// Delete a notification
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
// Mark all notifications as read
router.put("/read-all", verifyToken, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

export default router;
