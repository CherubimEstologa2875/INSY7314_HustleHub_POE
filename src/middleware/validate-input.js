const { validateLoginBody, validateRegisterBody } = require("../utils/validation");

function sendValidationError(res, result) {
  return res.status(result.status || 400).json({
    success: false,
    message: result.message || "Invalid request",
  });
}

function validateRegisterInput(req, res, next) {
  const result = validateRegisterBody(req.body);

  if (!result.ok) {
    return sendValidationError(res, result);
  }

  req.validatedBody = result.value;
  return next();
}

function validateLoginInput(req, res, next) {
  const result = validateLoginBody(req.body);

  if (!result.ok) {
    return sendValidationError(res, result);
  }

  req.validatedBody = result.value;
  return next();
}

module.exports = { validateLoginInput, validateRegisterInput };
