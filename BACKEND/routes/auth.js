import express from "express";
import jwt from "jsonwebtoken";
import { generateToken, hashPassword, comparePassword } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/register - Create new user
// ═══════════════════════════════════════════════════════════════

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "email", "password"],
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords don't match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered",
        suggestion: "Try logging in instead",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        theme: "default",
        watchlistSort: "newest",
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: "✅ Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      error: "Registration failed",
      message: err.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/login - Authenticate user
// ═══════════════════════════════════════════════════════════════

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      message: "✅ Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Login failed",
      message: err.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/verify - Verify token (for app startup)
// ═══════════════════════════════════════════════════════════════

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401).json({
      valid: false,
      error: "Invalid token",
    });
  }
});

export default router;
