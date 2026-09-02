const crypto = require("crypto");

// Store in memory for Part 1. Swapping to a DB later means changing ONLY this file
const users = new Map();

function normaliseEmail(email) {
  return String(email).trim().toLowerCase();
}

function findByEmail(email) {
  return users.get(normaliseEmail(email)) || null;
}

// Used by the authenticate middleware to check the user still exists
function findById(id) {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
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

// Only these fields can be updated, so a request body cannot change the role
const UPDATABLE_FIELDS = ["fullName"];

function update(id, changes) {
  const user = findById(id);
  if (!user) return null;

  for (const field of UPDATABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(changes, field)) {
      user[field] = changes[field];
    }
  }

  user.updatedAt = new Date().toISOString();

  return user;
}

// Return everything that ISN'T 'passwordHash'
function toPublic(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

module.exports = { findByEmail, findById, create, update, toPublic };
