import express from "express";
import { z } from "zod";
import { verifyToken, hashPassword, comparePassword } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
  email: z.string().email("Email must be valid")
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"]
});

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
        avatar: true,
        bio: true,
        favoriteGenres: true,
        favoriteDirector: true,
        _count: {
          select: {
            watchlist: true,
            reviews: true
          }
        }
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
// GET /api/users/profile/:id - Get public user profile
// ═══════════════════════════════════════════════════════════════

router.get("/profile/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        favoriteGenres: true,
        favoriteDirector: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        _count: {
          select: {
            watchlist: true,
            reviews: true
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get public profile error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/users/me - Update user profile
// ═══════════════════════════════════════════════════════════════

router.put("/me", verifyToken, async (req, res) => {
  try {
    const { name, email, avatar, bio, favoriteGenres, favoriteDirector } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    // Check if email is already taken (if changed)
    // `req.user` might not exist in original code, usually it's fetched or req.userId is used.
    // The previous code had `req.user.email` but in verifyToken maybe it only sets req.userId? Let's check original logic.
    // In original: `if (email !== req.user.email) {` -> Let's keep it as is, or fetch user first.
    // It's safer to fetch the user if we don't have req.user populated.
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId }});
    
    if (currentUser && email !== currentUser.email) {
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
        avatar,
        bio,
        favoriteGenres,
        favoriteDirector
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        favoriteGenres: true,
        favoriteDirector: true,
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
