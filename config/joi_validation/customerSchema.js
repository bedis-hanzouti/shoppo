const Joi = require('joi');

const customerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    city: Joi.string().allow(null).optional(),
    status: Joi.string().allow(null).optional(),
    activity: Joi.string().allow(null).optional(),
    password: Joi.string().required(),
    login: Joi.string().required(),
});

module.exports = customerSchema;
