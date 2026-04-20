import express from "express";
import { verifyToken } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /api/history - Get user's watch history
// ═══════════════════════════════════════════════════════════════

router.get("/", verifyToken, async (req, res) => {
  try {
    const history = await prisma.watchHistory.findMany({
      where: { userId: req.userId },
      orderBy: { lastWatched: "desc" },
      take: 50, // Limit to 50 most recent
    });

    res.json({
      count: history.length,
      items: history,
    });
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Failed to fetch watch history" });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/history - Add/update watch history
// ═══════════════════════════════════════════════════════════════

router.post("/", verifyToken, async (req, res) => {
  try {
    const { tmdbMovieId, title, posterPath, releaseDate, mediaType } = req.body;

    if (!tmdbMovieId || !title) {
      return res.status(400).json({
        error: "Movie ID and title required",
      });
    }

    // Check if already in history
    const existing = await prisma.watchHistory.findUnique({
      where: {
        userId_tmdbMovieId: {
          userId: req.userId,
          tmdbMovieId,
        },
      },
    });

    let item;

    if (existing) {
      // Update existing entry
      item = await prisma.watchHistory.update({
        where: {
          userId_tmdbMovieId: {
            userId: req.userId,
            tmdbMovieId,
          },
        },
        data: {
          lastWatched: new Date(),
          watchCount: { increment: 1 },
        },
      });
    } else {
      // Create new entry
      item = await prisma.watchHistory.create({
        data: {
          userId: req.userId,
          tmdbMovieId,
          title,
          posterPath,
          releaseDate,
          mediaType: mediaType || "Movie",
          watchCount: 1,
        },
      });
    }

    res.json({
      message: "✅ Added to watch history",
      item,
    });
  } catch (err) {
    console.error("Add history error:", err);
    res.status(500).json({ error: "Failed to add to watch history" });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/history/:tmdbMovieId - Remove from history
// ═══════════════════════════════════════════════════════════════

router.delete("/:tmdbMovieId", verifyToken, async (req, res) => {
  try {
    const { tmdbMovieId } = req.params;

    const item = await prisma.watchHistory.delete({
      where: {
        userId_tmdbMovieId: {
          userId: req.userId,
          tmdbMovieId: parseInt(tmdbMovieId),
        },
      },
    });

    res.json({
      message: "✅ Removed from watch history",
      item,
    });
  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({ error: "Failed to remove from history" });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/history - Clear all watch history
// ═══════════════════════════════════════════════════════════════

router.delete("/", verifyToken, async (req, res) => {
  try {
    const result = await prisma.watchHistory.deleteMany({
      where: { userId: req.userId },
    });

    res.json({
      message: "✅ Watch history cleared",
      deleted: result.count,
    });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ error: "Failed to clear watch history" });
  }
});

export default router;
