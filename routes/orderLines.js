const express = require('express')
const route = express.Router()
const orderLineController = require('../controllers/orderLineController')

route.get('/', orderLineController.getAllOrderLinesPagination)
// route.put('/:id', orderLineController.updateOrder)

route.get('/order/:id', orderLineController.getOrderLinesByOrderId)

module.exports = route