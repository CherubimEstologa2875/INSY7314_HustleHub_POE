const express = require("express");
const { registerUser, loginUser, getCurrentUser } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/authenticate");
const { validateRegisterInput, validateLoginInput } = require("../middleware/validate-input");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();

router.post("/register", validateRegisterInput, asyncHandler(registerUser));
router.post("/login", validateLoginInput, asyncHandler(loginUser));
router.get("/me", authenticate, asyncHandler(getCurrentUser));

module.exports = router;
