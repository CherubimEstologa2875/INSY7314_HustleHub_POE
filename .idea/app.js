const express = require("express");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));

  // Public routes. These must stay open or nobody could ever get a token.
  app.use("/api/auth", authRoutes);

  // Protected routes. The JWT is checked again on every request.
  app.use("/api/profile", profileRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Unknown paths get JSON instead of Express's default HTML page
  app.use(notFoundHandler);

  // Must be registered last, and take four arguments, or Express will not treat it as
  // an error handler. Catches body-parser failures above and anything a route or its
  // middleware throws or rejects with (including async controllers, via asyncHandler).
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
