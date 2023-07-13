const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    url: Joi.string().optional(),
    // image: Joi.string().required(),
});

module.exports = categorySchema;
