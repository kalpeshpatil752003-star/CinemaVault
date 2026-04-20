import express from "express";
import { verifyToken } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /api/reviews/movie/:tmdbMovieId - Get reviews for a movie
// ═══════════════════════════════════════════════════════════════

router.get("/movie/:tmdbMovieId", async (req, res) => {
  try {
    const { tmdbMovieId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { tmdbMovieId: parseInt(tmdbMovieId) },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/reviews/user - Get current user's reviews
// ═══════════════════════════════════════════════════════════════

router.get("/", verifyToken, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    console.error("Get user reviews error:", err);
    res.status(500).json({ error: "Failed to fetch your reviews" });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/reviews - Create a review
// ═══════════════════════════════════════════════════════════════

router.post("/", verifyToken, async (req, res) => {
  try {
    const { tmdbMovieId, movieTitle, author, content, rating } = req.body;

    if (!tmdbMovieId || !movieTitle || !author || !content) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["tmdbMovieId", "movieTitle", "author", "content"],
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.userId,
        tmdbMovieId,
        movieTitle,
        author,
        content,
        rating: rating || 5,
      },
    });

    res.status(201).json({
      message: "✅ Review posted",
      review,
    });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/reviews/:id - Update a review
// ═══════════════════════════════════════════════════════════════

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating, author } = req.body;

    // Check ownership
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== req.userId) {
      return res.status(403).json({
        error: "You can only edit your own reviews",
      });
    }

    // Update review
    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(rating && { rating }),
        ...(author && { author }),
      },
    });

    res.json({
      message: "✅ Review updated",
      review: updated,
    });
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/reviews/:id - Delete a review
// ═══════════════════════════════════════════════════════════════

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== req.userId) {
      return res.status(403).json({
        error: "You can only delete your own reviews",
      });
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    });

    res.json({
      message: "✅ Review deleted",
    });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
