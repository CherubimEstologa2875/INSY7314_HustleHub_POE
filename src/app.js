const express = require("express");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));

  // Public routes. These must stay open or nobody could ever get a token.
  app.use("/api/auth", authRoutes);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "HustleHub+ Express server is running",
    });
  });

  // Protected routes. The JWT is checked again on every request.
  app.use("/api/profile", profileRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Unknown paths get JSON instead of Express's default HTML page
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use((error, _req, res, _next) => {
    if (error.type === "entity.too.large") {
      return res.status(413).json({ success: false, message: "Request body is too large" });
    }
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({ success: false, message: "Malformed request body" });
    }

    // Log the detail for us, send the caller something generic
    console.error("Unhandled error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  });

  return app;
}

module.exports = { createApp };
