const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_EXPIRES_IN = "1h" } = process.env;

if (!JWT_SECRET) {
  // Fail fast: an app that silently falls back to a default secret is an app that can be impersonated.
  throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

function signAccessToken(user) {
  // Keep the payload minimal: id + role are enough to authorize requests.
  const payload = { sub: user.id, email: user.email, role: user.role };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyAccessToken(token) {
  // Throws (TokenExpiredError / JsonWebTokenError) on anything invalid — callers decide the HTTP response.
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };

// References:
// 1. npm. 2025. jsonwebtoken. [Online]. Available at: https://www.npmjs.com/package/jsonwebtoken [Accessed 25 August 2026].
