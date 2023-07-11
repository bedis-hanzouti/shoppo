const Joi = require('joi');

const productSchema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
    discount: Joi.number().integer().default(0),
    brand: Joi.string().required(),
});

module.exports = productSchema;
