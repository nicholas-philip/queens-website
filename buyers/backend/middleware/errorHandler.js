// =====================================================
// middleware/errorHandler.js
// Centralized error reporting for the Store API.
// =====================================================

const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${req.method}] ${req.originalUrl} →`, err.message);

  let status  = err.statusCode || 500;
  let message = err.message    || "An unexpected error occurred.";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    status = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map(val => val.message).join(" | ");
    status = 400;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = `Invalid ID format: "${err.value}"`;
    status = 400;
  }

  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;