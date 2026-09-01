const express = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.get("/", authenticate, getDashboard);

module.exports = router;
