const express = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/authenticate");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(getDashboard));

module.exports = router;
