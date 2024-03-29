const express = require('express')
const route = express.Router()
const orderController = require('../controllers/orderController')

route.post('/', orderController.addNewOrder)
route.put('/:id', orderController.updateOrder)
// route.get('/',userController.getAllUser)
route.get('/', orderController.getAllOrdersPagination)
route.get('/soft', orderController.getAllSoftOrders)
route.get('/:id', orderController.getOneOrder)
// route.get('/:id', orderController.getOneOrderWithProduct)
route.delete('/:id', orderController.deleteOrder)
route.get('/restore/:id', orderController.RestoreOneOrder)
route.get('/customer/:id', orderController.getOrderByCustomer)

module.exports = route