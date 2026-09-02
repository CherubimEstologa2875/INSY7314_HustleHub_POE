const { verifyAccessToken } = require("../utils/token");
const { validateAuthPayload } = require("../utils/validation");
const userRepository = require("../repositories/user.repository");

// The "Bearer" scheme is case-insensitive, so allow "bearer" as well
const BEARER_PATTERN = /^Bearer\s+(.+)$/i;

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const match = BEARER_PATTERN.exec(header);
  const token = match ? match[1].trim() : "";

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing or malformed Authorization header",
    });
  }

  let payload;

  try {
    // Checks the signature, the expiry and the algorithm
    payload = verifyAccessToken(token);
  } catch (error) {
    // Keep the message vague so an attacker cannot tell why it failed
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // A valid signature does not mean the claims are ones we issued
  if (!validateAuthPayload(payload)) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  // The account may have been deleted after the token was issued
  const user = userRepository.findById(payload.sub);

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  req.user = { id: payload.sub, email: payload.email, role: payload.role };

  return next();
}

module.exports = { authenticate };
