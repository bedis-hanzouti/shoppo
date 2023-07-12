const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    city: Joi.string().required(),
    status: Joi.string().required(),
    activity: Joi.string().required(),
    password: Joi.string().required(),
    login: Joi.string().required(),
});

module.exports = userSchema;