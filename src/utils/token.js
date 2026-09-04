const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_EXPIRES_IN = "1h" } = process.env;

// Only allow HS256 so a token cannot tell us which algorithm to trust
const JWT_ALGORITHM = "HS256";

if (!JWT_SECRET) {
  // Fail fast: an app that silently falls back to a default secret is an app that can be impersonated.
  throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

function signAccessToken(user) {
  // Keep the payload minimal because JWT payloads are readable by token holders; never put
  // passwords or password hashes in a token (npm, n.d.-b).
  const payload = { sub: user.id, email: user.email, role: user.role };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
  });
}

function verifyAccessToken(token) {
  // Restrict verification to the algorithm selected by the application, not one supplied by
  // an untrusted token header (npm, n.d.-b).
  return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
}

module.exports = { signAccessToken, verifyAccessToken };

// Reference: npm. n.d.-b. jsonwebtoken. [Online]. Available at:
// https://www.npmjs.com/package/jsonwebtoken [Accessed 4 September 2026].
