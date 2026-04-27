import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import prisma from "./lib/prisma.js";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import watchlistRoutes from "./routes/watchlist.js";
import reviewRoutes from "./routes/reviews.js";
import preferencesRoutes from "./routes/preferences.js";
import historyRoutes from "./routes/history.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

// ═══════════════════════════════════════════════════════════════
// ENV VALIDATION
// ═══════════════════════════════════════════════════════════════

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
if (!process.env.PORT) throw new Error("PORT is required");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").trim();

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request logging middleware
app.use(morgan("dev"));

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK"
  });
});

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationRoutes);

// ═══════════════════════════════════════════════════════════════
// 404 HANDLER
// ═══════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`\n🎬 CinemaVault Backend`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Frontend: ${FRONTEND_URL}`);
  console.log(`📊 Database: PostgreSQL\n`);
});

// ═══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
