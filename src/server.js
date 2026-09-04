require("dotenv").config();

const fs = require("fs");
const https = require("https");
const path = require("path");
const { createApp } = require("./app");

const CERTS_DIR = path.join(__dirname, "..", "certs");

// Paths can be overridden per environment, so a real deployment can point at its own certificate
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || path.join(CERTS_DIR, "localhost-key.pem");
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || path.join(CERTS_DIR, "localhost-cert.pem");

// Set once startServer() has an instance, so the crash handlers below can close it
// instead of dropping in-flight connections with a bare process.exit().
let httpsServer;

function loadCredentials() {
  try {
    return {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };
  } catch (error) {
    // Fail fast. Falling back to plain HTTP would silently send passwords and tokens in the clear.
    throw new Error(
      "Could not read the SSL key or certificate. Run the certificate command in the README first."
    );
  }
}

// Give in-flight requests a few seconds to finish, then exit regardless, so one slow
// or stuck connection cannot keep a crashed process alive indefinitely.
function shutdown(exitCode) {
  if (!httpsServer) {
    process.exit(exitCode);
    return;
  }

  httpsServer.close(() => process.exit(exitCode));
  setTimeout(() => process.exit(exitCode), 3000).unref();
}

// app.js's error handler catches everything that happens inside an Express request.
// These two are the safety net for everything outside that: a promise nobody attached
// a .catch() to, a callback that threw, a bug in a background timer. Node's own default
// for an unhandled rejection is to crash the process anyway; logging first (server-side
// only, never sent to any client) turns an untraceable crash into one we can investigate,
// and exiting deliberately avoids continuing to serve requests from a process whose
// state may now be inconsistent, which is riskier than a clean restart.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  shutdown(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown(1);
});

function startServer() {
  const app = createApp();
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3443);
  const credentials = loadCredentials();

  // TLS wraps Express so passwords and bearer tokens are encrypted in transit
  // (Node.js, n.d.; The Independent Institute of Education, 2026).
  httpsServer = https.createServer(credentials, app).listen(port, host, () => {
    console.log(`HustleHub+ server running at https://${host}:${port}`);
  });
}

if (require.main === module) {
  try {
    startServer();
  } catch (error) {
    // Print the reason only, not a stack trace with local file paths
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { startServer };

// References:
// Node.js. n.d. HTTPS. [Online]. Available at: https://nodejs.org/api/https.html
// [Accessed 4 September 2026].
// Node.js. n.d. Process. [Online]. Available at:
// https://nodejs.org/api/process.html#event-uncaughtexception [Accessed 4 September 2026].
