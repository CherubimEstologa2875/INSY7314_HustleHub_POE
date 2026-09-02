const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,99}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,128}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function checkFields(body, allowed) {
  if (!isPlainObject(body)) return "Request body must be a JSON object";
  const unexpected = Object.keys(body).filter((field) => !allowed.includes(field));
  return unexpected.length ? `Unexpected field: ${unexpected[0]}` : null;
}

function validateRegisterBody(body) {
  const fieldError = checkFields(body, ["fullName", "email", "password", "role"]);
  if (fieldError) return { ok: false, message: fieldError };

  const fullName = typeof body.fullName === "string" ? body.fullName.trim().replace(/\s+/g, " ") : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";

  if (!NAME_PATTERN.test(fullName)) return { ok: false, message: "fullName is invalid" };
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return { ok: false, message: "email is invalid" };
  if (typeof password !== "string" || !PASSWORD_PATTERN.test(password)) {
    return { ok: false, message: "password must be 8-128 characters with letters and numbers and no whitespace" };
  }
  if (role !== "user") return { ok: false, message: "role is invalid" };

  return { ok: true, value: { fullName, email, password, role } };
}

function validateLoginBody(body) {
  const fieldError = checkFields(body, ["email", "password"]);
  if (fieldError) return { ok: false, message: fieldError };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return { ok: false, message: "email is invalid" };
  if (typeof body.password !== "string" || !body.password || /\s/.test(body.password)) {
    return { ok: false, message: "password is invalid" };
  }
  return { ok: true, value: { email, password: body.password } };
}

function validateAuthPayload(payload) {
  return isPlainObject(payload) && UUID_PATTERN.test(payload.sub) &&
    typeof payload.email === "string" && EMAIL_PATTERN.test(payload.email) && payload.role === "user";
}

// Only fullName may be changed through the profile route
function validateProfileUpdateBody(body) {
  const fieldError = checkFields(body, ["fullName"]);
  if (fieldError) return { ok: false, message: fieldError };

  const fullName = typeof body.fullName === "string" ? body.fullName.trim().replace(/\s+/g, " ") : "";
  if (!NAME_PATTERN.test(fullName)) return { ok: false, message: "fullName is invalid" };

  return { ok: true, value: { fullName } };
}

module.exports = { validateRegisterBody, validateLoginBody, validateProfileUpdateBody, validateAuthPayload };
