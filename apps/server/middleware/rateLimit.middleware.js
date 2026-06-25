import { rateLimit } from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 10 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter, loginLimiter, apiLimiter };
