const bcrypt = require("bcrypt");

// 12 salt rounds quadruples the security of the commonly cited 10 salt rounds
const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, storedHash) {
  return bcrypt.compare(plainPassword, storedHash);
}

module.exports = { hashPassword, verifyPassword };

// References:
// 1. npm. 2025. node.bcrypt.js. [Online]. Available at: https://www.npmjs.com/package/bcrypt. [Accessed 24 August 2026]
