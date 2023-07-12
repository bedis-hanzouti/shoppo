const Joi = require('joi');

const imageSchema = Joi.object({
    alt: Joi.string().required(),
    url: Joi.string().required(),
    name: Joi.string().required(),
});

module.exports = imageSchema;
