import express from "express";
import { verifyToken } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /api/watchlist - Get user's watchlist
// ═══════════════════════════════════════════════════════════════

router.get("/", verifyToken, async (req, res) => {
  try {
    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: req.userId },
      orderBy: { addedAt: "desc" },
    });

    res.json({
      count: watchlist.length,
      items: watchlist,
    });
  } catch (err) {
    console.error("Get watchlist error:", err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/watchlist - Add movie to watchlist
// ═══════════════════════════════════════════════════════════════

router.post("/", verifyToken, async (req, res) => {
  try {
    const { tmdbMovieId, title, posterPath, releaseDate, voteAverage, overview } = req.body;

    if (!tmdbMovieId || !title) {
      return res.status(400).json({
        error: "Movie ID and title required",
      });
    }

    // Check if already in watchlist
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbMovieId: {
          userId: req.userId,
          tmdbMovieId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Movie already in watchlist",
      });
    }

    // Add to watchlist
    const item = await prisma.watchlistItem.create({
      data: {
        userId: req.userId,
        tmdbMovieId,
        title,
        posterPath,
        releaseDate,
        voteAverage,
        overview,
      },
    });

    res.status(201).json({
      message: "✅ Added to watchlist",
      item,
    });
  } catch (err) {
    console.error("Add watchlist error:", err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/watchlist/:tmdbMovieId - Remove from watchlist
// ═══════════════════════════════════════════════════════════════

router.delete("/", verifyToken, async (req, res) => {
  try {
    const result = await prisma.watchlistItem.deleteMany({
      where: { userId: req.userId },
    });

    res.json({
      message: "Watchlist cleared",
      deletedCount: result.count,
    });
  } catch (err) {
    console.error("Clear watchlist error:", err);
    res.status(500).json({ error: "Failed to clear watchlist" });
  }
});

router.delete("/:tmdbMovieId", verifyToken, async (req, res) => {
  try {
    const { tmdbMovieId } = req.params;

    const item = await prisma.watchlistItem.delete({
      where: {
        userId_tmdbMovieId: {
          userId: req.userId,
          tmdbMovieId: parseInt(tmdbMovieId),
        },
      },
    });

    res.json({
      message: "✅ Removed from watchlist",
      item,
    });
  } catch (err) {
    console.error("Delete watchlist error:", err);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/watchlist/check/:tmdbMovieId - Check if in watchlist
// ═══════════════════════════════════════════════════════════════

router.get("/check/:tmdbMovieId", verifyToken, async (req, res) => {
  try {
    const { tmdbMovieId } = req.params;

    const item = await prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbMovieId: {
          userId: req.userId,
          tmdbMovieId: parseInt(tmdbMovieId),
        },
      },
    });

    res.json({
      inWatchlist: !!item,
      item: item || null,
    });
  } catch (err) {
    console.error("Check watchlist error:", err);
    res.status(500).json({ error: "Failed to check watchlist" });
  }
});

export default router;
