// =====================================================
// middleware/errorHandler.js
// LAST middleware in server.js — catches every error.
// Always returns { success: false, message: "..." }
// =====================================================

const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${req.method}] ${req.originalUrl} →`, err.message);

  let status  = err.statusCode || 500;
  let message = err.message    || "An unexpected error occurred.";

  if (err.code === 11000) {                               // MongoDB duplicate key
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    message = `A record with this ${field} already exists.`;
    status  = 400;
  }
  if (err.name === "ValidationError") {                   // Mongoose validation
    message = Object.values(err.errors).map(e => e.message).join(" | ");
    status  = 400;
  }
  if (err.name === "CastError") {                         // Invalid ObjectId
    message = `Invalid ID: "${err.value}"`;
    status  = 400;
  }
  if (err.name === "TokenExpiredError") {                 // JWT expired
    message = "Session expired. Please log in again.";
    status  = 401;
  }
  if (err.name === "JsonWebTokenError") {                 // JWT invalid
    message = "Invalid token. Please log in again.";
    status  = 401;
  }

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;