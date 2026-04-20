import jwt from "jsonwebtoken";

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE: Verify JWT Token
// ═══════════════════════════════════════════════════════════════

export const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message: "Please login to continue",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
      message: "Please login again",
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Generate JWT Token
// ═══════════════════════════════════════════════════════════════

export const generateToken = (userId, email) => {
  return jwt.sign(
    {
      userId,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Hash Password
// ═══════════════════════════════════════════════════════════════

import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Compare Password
// ═══════════════════════════════════════════════════════════════

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};