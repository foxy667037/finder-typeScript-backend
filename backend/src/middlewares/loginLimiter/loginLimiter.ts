import rateLimit, { Options } from "express-rate-limit";

// Define the rate limiter options
const loginLimiterOptions: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

// Create the rate limiter middleware
const loginLimiter = rateLimit(loginLimiterOptions);

export default loginLimiter;