require("dotenv").config();

const fs = require("fs");
const https = require("https");
const path = require("path");
const { createApp } = require("./app");

const CERTS_DIR = path.join(__dirname, "..", "certs");

// Paths can be overridden per environment, so a real deployment can point at its own certificate
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || path.join(CERTS_DIR, "localhost-key.pem");
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || path.join(CERTS_DIR, "localhost-cert.pem");

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

function startServer() {
  const app = createApp();
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3443);
  const credentials = loadCredentials();

  // Express is unchanged; TLS wraps it, so every route is now served over HTTPS
  https.createServer(credentials, app).listen(port, host, () => {
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
// 1. Node.js. n.d. HTTPS. [Online]. Available at: https://nodejs.org/api/https.html [Accessed 1 September 2026].
