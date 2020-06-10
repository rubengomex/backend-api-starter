const Joi = require('@hapi/joi')

// ^                         Start anchor
// (?=.*[A-Z].*[A-Z])        Ensure string has two uppercase letters.
// (?=.*[!@#$&*])            Ensure string has one special case letter.
// (?=.*[0-9].*[0-9])        Ensure string has two digits.
// (?=.*[a-z].*[a-z].*[a-z]) Ensure string has three lowercase letters.
// .{8}                      Ensure string is at least of length 8.
// $                         End anchor.

exports.signupValidationSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  // password: Joi.string().regex(/^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/)
  password: Joi.string().min(8)
})
