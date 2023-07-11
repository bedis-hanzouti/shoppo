const Joi = require('joi');

const orderSchema = Joi.object({
    pending: Joi.string().required(),
    canceled: Joi.string().allow('').optional(),
    delivered: Joi.string().allow('').optional(),
    expedied: Joi.string().allow('').optional(),
    total: Joi.number().integer().required(),
    total_discount: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
    discount: Joi.number().integer().default(0),
});

module.exports = orderSchema;
