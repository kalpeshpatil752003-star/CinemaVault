import express from "express";
import { verifyToken } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /api/preferences - Get user preferences
// ═══════════════════════════════════════════════════════════════

router.get("/", verifyToken, async (req, res) => {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.userId },
    });

    if (!preferences) {
      return res.status(404).json({ error: "Preferences not found" });
    }

    res.json(preferences);
  } catch (err) {
    console.error("Get preferences error:", err);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/preferences - Update preferences
// ═══════════════════════════════════════════════════════════════

router.put("/", verifyToken, async (req, res) => {
  try {
    const { theme, watchlistSort } = req.body;

    // Validation
    const validThemes = ["default", "neon", "classic"];
    const validSorts = ["newest", "oldest"];

    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({
        error: "Invalid theme",
        validThemes,
      });
    }

    if (watchlistSort && !validSorts.includes(watchlistSort)) {
      return res.status(400).json({
        error: "Invalid sort order",
        validSorts,
      });
    }

    // Update preferences
    const preferences = await prisma.userPreferences.update({
      where: { userId: req.userId },
      data: {
        ...(theme && { theme }),
        ...(watchlistSort && { watchlistSort }),
      },
    });

    res.json({
      message: "✅ Preferences updated",
      preferences,
    });
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/preferences/reset - Reset to defaults
// ═══════════════════════════════════════════════════════════════

router.post("/reset", verifyToken, async (req, res) => {
  try {
    const preferences = await prisma.userPreferences.update({
      where: { userId: req.userId },
      data: {
        theme: "default",
        watchlistSort: "newest",
      },
    });

    res.json({
      message: "✅ Preferences reset to defaults",
      preferences,
    });
  } catch (err) {
    console.error("Reset preferences error:", err);
    res.status(500).json({ error: "Failed to reset preferences" });
  }
});

export default router;
