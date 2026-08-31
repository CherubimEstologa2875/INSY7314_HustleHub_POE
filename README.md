# HustleHub+ Backend

HustleHub+ is a Node.js and Express REST API starter for a platform where users can create an account, sign in, and access their authenticated profile. The current implementation focuses on authentication: users can register, receive a JSON Web Token (JWT) after login, and use it to call `GET /api/auth/me`.

## Intended Users

The system is intended for registered HustleHub+ users and the client application that interacts with the API. Users can register and log in through public endpoints, while protected endpoints are available only to authenticated users. Registration currently permits only the `user` role so clients cannot self-assign elevated privileges.

## Running the Backend

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Create a `.env` file using `.env.example` and set a strong, private `JWT_SECRET`.

```text
GET  http://127.0.0.1:3000/api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me       (Authorization: Bearer <token>)
```

## Backend Structure

```text
src/
  server.js                       Starts the application and loads environment variables
  app.js                          Configures Express, parsers, routes, and error handling
  routes/auth.routes.js           Maps authentication URLs to middleware and controllers
  controllers/auth.controller.js Registration, login, and current-user handlers
  middleware/validate-input.js   Validates request bodies before controllers run
  middleware/authenticate.js      Verifies Bearer JWTs for protected routes
  utils/validation.js             Validation rules for request data and JWT claims
  utils/password.js               bcrypt password hashing and verification
  utils/token.js                  JWT signing and verification
  repositories/user.repository.js In-memory user storage and public-user mapping
```

The repository is in memory for this starter, so data is lost when the process stops. A production implementation should replace it with a database repository while preserving these controller and security boundaries.

## Security Decisions

### Password hashing

Passwords are never stored or returned in plain text. `bcrypt` hashes each password with 12 salt rounds during registration, and login uses `bcrypt.compare` against the stored hash. `toPublic` removes the password hash from API responses. `JWT_SECRET` is read from the environment and the application fails fast if it is missing instead of using a predictable fallback.

### Token-based authentication

After successful login, the API signs a short-lived JWT containing only the user ID (`sub`), email, and role. Protected routes require a `Bearer` token in the `Authorization` header. Middleware verifies the signature and expiration, validates the expected claims, and exposes only a minimal user object to handlers. Invalid, expired, missing, or malformed tokens receive HTTP 401 responses.

### Input validation

Authentication input is validated before it reaches a controller. The API requires JSON objects, rejects unexpected fields, normalizes emails, restricts names to safe characters and bounded lengths, and requires passwords to be 8-128 characters containing letters and numbers without whitespace. Roles are allow-listed to `user`. JWT claims are validated after cryptographic verification. JSON and URL-encoded bodies are limited to 10 KB, while malformed or oversized bodies are rejected. These controls reduce malformed data, type confusion, injection opportunities, and endpoint abuse.

### HTTPS

HTTPS is essential outside local development. TLS encrypts passwords, JWTs, and other request data in transit and helps prevent interception or modification. Production deployments should use HTTPS directly or through a trusted TLS-terminating reverse proxy, redirect HTTP to HTTPS, and mark any future authentication cookies `Secure` and `HttpOnly`. The local example uses HTTP because it is bound to `127.0.0.1`; it is not a secure production configuration. Certificates and private keys must never be committed or exposed.

## Verification

Test valid registration and login, plus missing fields, unexpected fields, invalid formats, weak passwords, oversized bodies, malformed JSON, and invalid or expired JWTs. Install dependencies with `npm install` before starting the server.
