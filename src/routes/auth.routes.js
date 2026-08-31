const express = require("express");
const { registerUser, loginUser, getCurrentUser } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/authenticate");
const { validateLoginInput, validateRegisterInput } = require("../middleware/validate-input");

const router = express.Router();

router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
