const Joi = require('@hapi/joi')

const authSchema = Joi.object({
  userName: Joi.string().min(2).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
})
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
})

module.exports = {
  authSchema, loginSchema
}
