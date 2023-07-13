const Joi = require('joi');

const imageSchema = Joi.object({

    ProductId: Joi.number().integer().required(),
});

module.exports = imageSchema;
