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

  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        success: false,
        message: "Malformed JSON body",
      });
    }

    if (err && (err.type === "entity.too.large" || err.status === 413)) {
      return res.status(413).json({
        success: false,
        message: "Request body is too large",
      });
    }

    return next(err);
  });

  return app;
}

module.exports = { createApp };
