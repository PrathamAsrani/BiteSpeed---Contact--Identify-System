const Joi = require("joi")

const identifyRequestSchema = Joi.object({
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.alternatives().try(Joi.string().pattern(/^\d+$/), Joi.number()).optional().allow(null),
}).or("email", "phoneNumber")

const validateIdentifyRequest = (data) => {
  return identifyRequestSchema.validate(data)
}

module.exports = {
  validateIdentifyRequest,
}
