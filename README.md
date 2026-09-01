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
Public
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login

Protected - require "Authorization: Bearer <token>"
GET    /api/auth/me
GET    /api/profile
PATCH  /api/profile
GET    /api/dashboard
```

Base URL during local development is `http://127.0.0.1:3000`. Every protected route
returns `401` without a valid token, so each one can be demonstrated twice in Postman:
once with the token from `POST /api/auth/login` and once without.

## Backend Structure

```text
src/
  server.js                       Starts the application and loads environment variables
  app.js                          Configures Express, parsers, routes, and error handling
  routes/auth.routes.js           Maps authentication URLs to middleware and controllers
  routes/profile.routes.js        Protected profile routes (whole router requires a JWT)
  routes/dashboard.routes.js      Protected placeholder financial summary
  controllers/auth.controller.js  Registration, login, and current-user handlers
  controllers/profile.controller.js Reads and updates the authenticated user
  controllers/dashboard.controller.js Placeholder income and estimated tax figures
  middleware/validate-input.js    Validates request bodies before controllers run
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

After successful login the API signs a short-lived JWT containing only the user ID (`sub`), email, and role. No password, hash, or other sensitive value is placed in the token, because a JWT payload is merely base64-encoded and can be read by anyone holding the token.

Login is the only place a token is issued. Every route beyond login and registration is protected by the `authenticate` middleware, and the token is re-validated **on every request** rather than trusted once at login. Because the API is stateless, the token is the only thing identifying the caller, so each request must prove itself independently. The middleware performs four checks in order:

1. **Header shape** - the `Authorization` header must carry a `Bearer` credential. The scheme is matched case-insensitively, as RFC 7235 requires.
2. **Signature and expiry** - `jwt.verify` rejects any token that was not signed with our secret or whose `exp` has passed.
3. **Algorithm pinning** - verification is restricted to `HS256`. Without this, the library would honour the algorithm named in the token's own header, which allows the well-known `alg: none` and RS256-to-HS256 confusion attacks in which an attacker forges a token the server accepts. This is verified by test: a hand-crafted `alg: none` token is rejected with 401.
4. **Claim and subject validation** - a cryptographically valid token can still carry claims the API never issues, so the payload shape is checked, and the account named by `sub` must still exist. A token for a deleted account is refused even while it remains within its validity window.

Failures return a deliberately generic `401 Invalid or expired token`. The API does not distinguish an expired token from a forged one, because telling an attacker which of the two failed hands them free reconnaissance. Identity is always read from the verified token (`req.user`) and never from the request body or query string, so a caller cannot act on another user's behalf by supplying a different ID.

### Input validation

Authentication input is validated before it reaches a controller. The API requires JSON objects, rejects unexpected fields, normalizes emails, restricts names to safe characters and bounded lengths, and requires passwords to be 8-128 characters containing letters and numbers without whitespace. Roles are allow-listed to `user`. JWT claims are validated after cryptographic verification. JSON and URL-encoded bodies are limited to 10 KB, while malformed or oversized bodies are rejected. These controls reduce malformed data, type confusion, injection opportunities, and endpoint abuse.

### HTTPS

HTTPS is essential outside local development. TLS encrypts passwords, JWTs, and other request data in transit and helps prevent interception or modification. Production deployments should use HTTPS directly or through a trusted TLS-terminating reverse proxy, redirect HTTP to HTTPS, and mark any future authentication cookies `Secure` and `HttpOnly`. The local example uses HTTP because it is bound to `127.0.0.1`; it is not a secure production configuration. Certificates and private keys must never be committed or exposed.

### Error handling

Error responses are controlled and never expose internal detail. Unknown paths return a JSON
`404` instead of Express's default HTML page, and any unhandled error is logged server-side and
returned to the caller as a generic `500 An unexpected error occurred`. Allowing an error to reach
Express's built-in handler would return a full stack trace containing absolute file paths, which the
brief prohibits. `x-powered-by` is disabled so the framework is not advertised in responses.

## Verification

Test valid registration and login, plus missing fields, unexpected fields, invalid formats, weak passwords, oversized bodies, malformed JSON, and invalid or expired JWTs. Install dependencies with `npm install` before starting the server.

The protected routes have been verified against a running server for the following cases:

| Case | Expected |
| --- | --- |
| Protected route with a valid token | `200` |
| Protected route with no `Authorization` header | `401` |
| Protected route with a `Basic` scheme instead of `Bearer` | `401` |
| Token signed with the wrong secret | `401` |
| Hand-crafted `alg: none` token | `401` |
| Token that has passed its expiry | `401` |
| `PATCH /api/profile` attempting to set `role` | `400` unexpected field |
| Unknown path | `404` JSON, no stack trace |
