const userRepository = require("../repositories/user.repository");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signAccessToken } = require("../utils/token");

async function registerUser(req, res) {
  const { fullName, email, password, role } = req.body || {};

  // HTTP 400: Bad Request
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "fullName, email, password and role are required",
    });
  }

  // HTTP 409: Conflict
  if (userRepository.findByEmail(email)) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  const passwordHash = await hashPassword(password);
  const user = userRepository.create({ fullName, email, passwordHash, role });

  // HTTP 201: Created
  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { user: userRepository.toPublic(user) },
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body || {};

  // HTTP 400: Bad Request
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = userRepository.findByEmail(email);

  // HTTP 401: Unauthorized
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const accessToken = signAccessToken(user);

  // HTTP 200: OK
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: userRepository.toPublic(user), accessToken },
  });
}

function getCurrentUser(req, res) {
  // req.user was set by the authenticate middleware
  return res.status(200).json({ success: true, data: { user: req.user } });
}

module.exports = { registerUser, loginUser, getCurrentUser };

// References:
// 1. Express.js. n.d. Response. [Online]. Available at: https://expressjs.com/en/5x/api/response/ [Accessed 24 August 2026].
