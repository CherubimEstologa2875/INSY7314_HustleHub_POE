const crypto = require("crypto");

// Reached when no route matched. Returns JSON instead of Express's default HTML page,
// which would otherwise disclose the framework in its title and stack-style formatting.
function notFoundHandler(_req, res) {
  return res.status(404).json({ success: false, message: "Route not found" });
}

// Central error handler. Registered last in app.js so it catches everything: body-parser
// failures, synchronous throws in any middleware or controller, and rejected promises from
// async controllers (forwarded via src/utils/async-handler.js, and automatically by Express 5
// even where a handler isn't wrapped).
//
// Every response here is a small, fixed set of generic messages. The caller never sees a
// stack trace, a file path, a dependency's own error text, or anything else that describes
// the server's internals, because any of those can hand an attacker reconnaissance for free.
// The real error is logged server-side only, tagged with a short random id the caller can
// quote back when reporting a problem — the id identifies a log entry, it does not describe
// what went wrong.
function errorHandler(error, req, res, _next) {
  // Body-parser (express.json / express.urlencoded) reports bad input this way. These are
  // the caller's mistake, not ours, so it is safe to be a little more specific than "500".
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body is too large" });
  }
  if (error.type === "encoding.unsupported") {
    return res.status(415).json({ success: false, message: "Unsupported request body encoding" });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ success: false, message: "Malformed request body" });
  }

  // Anything else is unexpected: a bug, a dependency failure, or something we did not
  // anticipate. Log it in full for us; the caller gets nothing but an id.
  const errorId = crypto.randomUUID();
  console.error(`[${errorId}] Unhandled error on ${req.method} ${req.originalUrl}:`, error);

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    errorId,
  });
}

module.exports = { notFoundHandler, errorHandler };

// References:
// 1. Express.js. n.d. Error Handling. [Online]. Available at: https://expressjs.com/en/guide/error-handling.html [Accessed 2 September 2026].
// 2. OWASP. n.d. Improper Error Handling. [Online]. Available at: https://owasp.org/www-community/Improper_Error_Handling [Accessed 2 September 2026].
