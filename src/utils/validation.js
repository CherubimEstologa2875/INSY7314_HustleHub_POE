const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FULL_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,99}$/u;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_ROLES = new Set(["user"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function isString(value) {
  return typeof value === "string";
}

function isAllowedRole(role) {
  return isString(role) && ALLOWED_ROLES.has(role.trim().toLowerCase());
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  return isString(email) && email.length <= 254 && EMAIL_REGEX.test(email.trim());
}

function isValidFullName(fullName) {
  if (!isString(fullName)) {
    return false;
  }

  const trimmed = fullName.trim().replace(/\s+/g, " ");

  return trimmed.length >= 2 && trimmed.length <= 100 && FULL_NAME_REGEX.test(trimmed);
}

function normalizeFullName(fullName) {
  return fullName.trim().replace(/\s+/g, " ");
}

function isValidPassword(password) {
  if (!isString(password)) {
    return false;
  }

  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return false;
  }

  if (/\s/.test(password)) {
    return false;
  }

  return /[A-Za-z]/.test(password) && /\d/.test(password);
}

function normalizeRole(role) {
  return role.trim().toLowerCase();
}

function isValidUuid(value) {
  return isString(value) && UUID_REGEX.test(value);
}

function validateRegisterBody(body) {
  if (!isPlainObject(body)) {
    return { ok: false, status: 400, message: "Request body must be a JSON object" };
  }

  const allowedKeys = ["fullName", "email", "password", "role"];
  const unexpectedKeys = Object.keys(body).filter((key) => !allowedKeys.includes(key));

  if (unexpectedKeys.length > 0) {
    return { ok: false, status: 400, message: "Unexpected fields are not allowed" };
  }

  const { fullName, email, password, role } = body;

  if (!isValidFullName(fullName)) {
    return {
      ok: false,
      status: 400,
      message: "fullName must be 2-100 characters and contain only letters, spaces, hyphens, apostrophes or periods",
    };
  }

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "email must be a valid email address" };
  }

  if (!isValidPassword(password)) {
    return {
      ok: false,
      status: 400,
      message: "password must be 8-128 characters, contain letters and numbers, and include no spaces",
    };
  }

  if (!isAllowedRole(role)) {
    return { ok: false, status: 400, message: "role must be user" };
  }

  return {
    ok: true,
    value: {
      fullName: normalizeFullName(fullName),
      email: normalizeEmail(email),
      password,
      role: normalizeRole(role),
    },
  };
}

function validateLoginBody(body) {
  if (!isPlainObject(body)) {
    return { ok: false, status: 400, message: "Request body must be a JSON object" };
  }

  const allowedKeys = ["email", "password"];
  const unexpectedKeys = Object.keys(body).filter((key) => !allowedKeys.includes(key));

  if (unexpectedKeys.length > 0) {
    return { ok: false, status: 400, message: "Unexpected fields are not allowed" };
  }

  const { email, password } = body;

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "email must be a valid email address" };
  }

  if (!isString(password) || password.length === 0 || /\s/.test(password)) {
    return { ok: false, status: 400, message: "password is required" };
  }

  return {
    ok: true,
    value: {
      email: normalizeEmail(email),
      password,
    },
  };
}

function validateAuthPayload(payload) {
  if (!isPlainObject(payload)) {
    return false;
  }

  return isValidUuid(payload.sub) && isValidEmail(payload.email) && isAllowedRole(payload.role);
}

module.exports = {
  normalizeEmail,
  validateAuthPayload,
  validateLoginBody,
  validateRegisterBody,
};
