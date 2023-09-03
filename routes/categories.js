const express = require('express')
const route = express.Router()
const configMedia = require("../config/multer");
const multer = require('multer');
const upload = multer()
const { isAdmin } = require('../helpers/jwt');


const categoryController = require('../controllers/categoryController')

route.post('/', isAdmin, configMedia.uploadOptions.single('images'), categoryController.addCategory)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id', isAdmin, configMedia.uploadOptions.single('image'), categoryController.updateCategory)
route.get('/', categoryController.getAllCategory)
route.get('/:id', categoryController.getOneCategory)
// route.get('/:idCategory',categoryController.getAllProductByCategory)
route.delete('/:id', isAdmin, categoryController.deleteCategory)

module.exports = route