const bcrypt = require("bcrypt");

// Bcrypt is an adaptive password hash; its work factor makes password guessing more costly.
// The async API avoids blocking the Express event loop during hashing (npm, n.d.-a).
const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, storedHash) {
  return bcrypt.compare(plainPassword, storedHash);
}

module.exports = { hashPassword, verifyPassword };

// Reference: npm. n.d.-a. bcrypt. [Online]. Available at:
// https://www.npmjs.com/package/bcrypt [Accessed 4 September 2026].
