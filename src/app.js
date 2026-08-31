const express = require("express");
const authRoutes = require("./routes/auth.routes");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));

  app.use("/api/auth", authRoutes);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "HustleHub+ Express server is running",
    });
  });

  app.use((error, _req, res, next) => {
    if (error.type === "entity.too.large") {
      return res.status(413).json({ success: false, message: "Request body is too large" });
    }
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({ success: false, message: "Malformed request body" });
    }
    return next(error);
  });

  return app;
}

module.exports = { createApp };
