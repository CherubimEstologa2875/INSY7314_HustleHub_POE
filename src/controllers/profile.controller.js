const userRepository = require("../repositories/user.repository");

function getProfile(req, res) {
  // req.user was set by the authenticate middleware
  const user = userRepository.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    data: { user: userRepository.toPublic(user) },
  });
}

function updateProfile(req, res) {
  const { fullName } = req.validatedBody || {};

  // The id comes from the token, not the request, so users can only edit themselves
  const user = userRepository.update(req.user.id, { fullName });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated",
    data: { user: userRepository.toPublic(user) },
  });
}

module.exports = { getProfile, updateProfile };
