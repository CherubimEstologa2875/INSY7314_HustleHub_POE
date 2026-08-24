const crypto = require("crypto");

// Store in memory for Part 1. Swapping to a DB later means changing ONLY this file
const users = new Map();

function normaliseEmail(email) {
  return String(email).trim().toLowerCase();
}

function findByEmail(email) {
  return users.get(normaliseEmail(email)) || null;
}

function create({ fullName, email, passwordHash, role }) {
  const user = {
    id: crypto.randomUUID(),
    fullName,
    email: normaliseEmail(email),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };

  users.set(user.email, user);

  return user;
}

// Return everything that ISN'T 'passwordHash'
function toPublic(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

module.exports = { findByEmail, create, toPublic };
