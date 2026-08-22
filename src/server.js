const { createApp } = require("./app");

function startServer() {
  const app = createApp();
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3000);

  app.listen(port, host, () => {
    console.log(`HustleHub+ server running at http://${host}:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
