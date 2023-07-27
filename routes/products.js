

const express = require('express')
const route = express.Router()
const multer = require('multer');
const configMedia = require('../config/multer')


const productController = require('../controllers/productController')

route.post('/', configMedia.uploadOptions.array('images', 5), productController.addProduct)
// route.post('/', configMedia.uploadOptions.array('images', 5), productController.addProduct)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id', configMedia.uploadOptions.array('images', 5), productController.updateProduct)
route.put('/update/:id', productController.updateCategoryOfProduct)
route.get('/topselling', productController.getTopSellingProducts)

route.get('/', productController.getAllProduct)
route.get('/name', productController.getAllProductByName)

route.get('/:id', productController.getOneProduct)
route.get('/topdix/category/:categories', productController.getAllProductByCategoryTopDix)
route.get('/brand/:categories', productController.getAllBrandByCategory)
route.get('/category/:categories', productController.getAllProductByCategory)
route.delete('/:id', productController.deletProduct)

module.exports = route


