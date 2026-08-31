const { verifyAccessToken } = require("../utils/token");
const { validateAuthPayload } = require("../utils/validation");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Missing or malformed Authorization header",
    });
  }

  const token = match[1].trim();

  try {
    const payload = verifyAccessToken(token); // { sub, email, role, iat, exp }

    if (!validateAuthPayload(payload)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = { authenticate };
