const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profile.controller");
const { authenticate } = require("../middleware/authenticate");
const { validateProfileUpdateInput } = require("../middleware/validate-input");

const router = express.Router();

// Every route below needs a valid JWT
router.use(authenticate);

router.get("/", getProfile);
router.patch("/", validateProfileUpdateInput, updateProfile);

module.exports = router;
