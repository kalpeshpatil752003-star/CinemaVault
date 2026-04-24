import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import Filter from "bad-words";

const filter = new Filter();

// 1. Validation Middleware Builder
export const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  };
};

// 2. Anti-Spam / Rate Limiting (e.g. for messages, reviews, updates)
export const antiSpam = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs for sensitive routes
  message: { error: "Too many requests. Please slow down." }
});

// 3. Profanity Filter / Sanitization Middleware
export const sanitizeInput = (fields) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === "string") {
        // Censor profanity
        req.body[field] = filter.clean(req.body[field]);
      }
    });
    next();
  };
};

// Common validations export
export const commonValidations = {
  content: body("content").trim().notEmpty().withMessage("Content cannot be empty").isLength({ max: 2000 }).withMessage("Content is too long"),
  bio: body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be under 500 characters")
};
