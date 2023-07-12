
const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')

route.post('/register', userController.register)
route.post('/login', userController.login)
route.post('/forgetpassword', userController.forgetPassword)
route.post('/resetpassword/:userId/:token', userController.resetPassword)
route.put('/:id', userController.updateUser)
// route.get('/',userController.getAllUser)
route.get('/', userController.getAllStudentPagination)
route.get('/soft', userController.getAllSoftUser)
route.get('/:id', userController.getOneUser)
route.delete('/:id', userController.deletUser)
route.get('/restore/:id', userController.RestoreOneUser)

module.exports = route


