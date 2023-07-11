

const express = require('express')
const route = express.Router()
const configMedia = require("../config/multer");
const productController = require('../controllers/productController')

route.post('/', configMedia.uploadOptions.array('images', 5), productController.addProduct)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id', configMedia.uploadOptions.single('images', 5), productController.updateProduct)
route.put('/update/:id', productController.updateCategoryOfProduct)
route.get('/', productController.getAllProduct)
route.get('/:id', productController.getOneProduct)
route.get('/topdix/category/:id', productController.getAllProductByCategoryTopDix)
route.get('/brand/:categories', productController.getAllBrandByCategory)
route.get('/category/:categories', productController.getAllProductByCategory)
route.get('/topszlling', productController.getTopSellingProducts)
route.delete('/:id', productController.deletProduct)

module.exports = route


