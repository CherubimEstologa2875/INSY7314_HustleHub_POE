const { verifyAccessToken } = require("../utils/token");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Missing or malformed Authorization header",
    });
  }

  try {
    req.user = verifyAccessToken(token); // { sub, email, role, iat, exp }
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = { authenticate };
