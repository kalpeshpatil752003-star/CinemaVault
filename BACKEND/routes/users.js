import express from "express";
import { verifyToken, hashPassword, comparePassword } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /api/users/me - Get current user profile
// ═══════════════════════════════════════════════════════════════

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/users/me - Update user profile
// ═══════════════════════════════════════════════════════════════

router.put("/me", verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    // Check if email is already taken (if changed)
    if (email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "Email already in use",
        });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.json({
      message: "✅ Profile updated",
      user,
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/users/password - Change password
// ═══════════════════════════════════════════════════════════════

router.put("/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New passwords don't match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        password: hashedPassword,
      },
    });

    res.json({
      message: "✅ Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/users/me - Delete account (optional)
// ═══════════════════════════════════════════════════════════════

router.delete("/me", verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Password required to delete account",
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Password is incorrect",
      });
    }

    // Delete user (cascades to related data)
    await prisma.user.delete({
      where: { id: req.userId },
    });

    res.json({
      message: "✅ Account deleted",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
