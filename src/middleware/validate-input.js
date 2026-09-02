const {
  validateRegisterBody,
  validateLoginBody,
  validateProfileUpdateBody,
} = require("../utils/validation");

function validateInput(validator) {
  return (req, res, next) => {
    const result = validator(req.body);
    if (!result.ok) return res.status(400).json({ success: false, message: result.message });
    req.validatedBody = result.value;
    return next();
  };
}

module.exports = {
  validateRegisterInput: validateInput(validateRegisterBody),
  validateLoginInput: validateInput(validateLoginBody),
  validateProfileUpdateInput: validateInput(validateProfileUpdateBody),
};
