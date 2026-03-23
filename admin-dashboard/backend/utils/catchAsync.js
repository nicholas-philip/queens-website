// =====================================================
// utils/catchAsync.js
//
// Wraps async route handlers so you don't need
// try/catch in every controller.
//
// Usage:
//   const catchAsync = require("../utils/catchAsync");
//   const myHandler = catchAsync(async (req, res, next) => {
//     // any thrown error is forwarded to Express error handler
//   });
// =====================================================

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
