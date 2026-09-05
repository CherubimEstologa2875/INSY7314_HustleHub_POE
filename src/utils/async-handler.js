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
// Reference: Express.js. n.d.-b. Error handling. [Online]. Available at:
// https://expressjs.com/en/guide/error-handling.html [Accessed 4 September 2026].
