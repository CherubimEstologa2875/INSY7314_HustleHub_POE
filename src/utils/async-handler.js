// Wraps an async route handler so a rejected promise reaches the centralized error
// handler (src/middleware/error-handler.js) instead of becoming an unhandled rejection.
// Express 5 already forwards async rejections to next() automatically, but wrapping
// explicitly keeps the safety net independent of framework version and makes the intent
// visible at every route, rather than relying on an implicit behaviour a reader has to
// already know about.
function asyncHandler(handler) {
  return function wrapped(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };

// References:
// 1. Express.js. n.d. Error Handling. [Online]. Available at: https://expressjs.com/en/guide/error-handling.html [Accessed 2 September 2026].
