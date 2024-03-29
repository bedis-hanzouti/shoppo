const express = require('express')
const route = express.Router()
const customerController = require('../controllers/customerController')
const authMiddleware = require('../helpers/middleware/userMiddleware')

route.post('/register', customerController.register)
route.post('/login', customerController.login)
route.post('/forgetpassword', customerController.forgetPassword)
route.post('/resetpassword/:userId/:token', customerController.resetPassword)
route.put('/:id', customerController.updateUser)
route.put('/:id/adresse', customerController.updateUserAdresse)
// route.get('/',userController.getAllUser) updateUserAdresse
route.get('/one', authMiddleware, customerController.getOneUser)

route.get('/', customerController.getAllStudentPagination)
route.get('/soft', customerController.getAllSoftUser)
route.delete('/:id', customerController.deletUser)
route.get('/restore/:id', customerController.RestoreOneUser)

module.exports = route