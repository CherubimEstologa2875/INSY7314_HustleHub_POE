const { verifyAccessToken } = require("../utils/token");
const { validateAuthPayload } = require("../utils/validation");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/.exec(header);
  const token = match && match[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing or malformed Authorization header",
    });
  }

  const token = match[1].trim();

  try {
    const payload = verifyAccessToken(token);
    if (!validateAuthPayload(payload)) throw new Error("Invalid token payload");
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = { authenticate };
