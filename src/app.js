const express = require("express");
const authRoutes = require("./routes/auth.routes");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/api/auth", authRoutes);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "HustleHub+ Express server is running",
    });
  });

  return app;
}

module.exports = { createApp };
