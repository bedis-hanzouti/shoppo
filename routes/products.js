

const express = require('express')
const route = express.Router()
const multer = require('multer');
const configMedia = require('../config/multer')
const { isAdmin } = require('../helpers/jwt');



const productController = require('../controllers/productController')

route.post('/', isAdmin, configMedia.uploadOptions.array('images', 6), productController.addProduct)
// route.post('/', configMedia.uploadOptions.array('images', 5), productController.addProduct)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id', isAdmin, configMedia.uploadOptions.array('images', 6), productController.updateProduct)
route.put('/update/:id', isAdmin, productController.updateCategoryOfProduct)

route.get('/topselling', productController.getTopSellingProducts)
route.get('/frontOffice/topselling', productController.getTopSellingProductsWithoutQuantity)
route.get('/topten', productController.getLastTenProduct)
route.get('/frontOffice/topten', productController.getLastTenProductWithoutQuantity)

route.get('/', productController.getAllProduct)
route.get('/frontOffice', productController.getAllProductWithoutQuantity)
route.get('/name', productController.getAllProductByName)
route.get('/frontOffice/name', productController.getAllProductByNameWithoutQuantity)

route.get('/:id', productController.getOneProduct)
route.get('/frontOffice/:id', productController.getOneProductWithoutQuantity)
route.get('/topdix/category/:categories', productController.getAllProductByCategoryTopDix)
route.get('/frontOffice/topdix/category/:categories', productController.getAllProductByCategoryTopDixWithoutQuantity)
route.get('/brand/:categories', productController.getAllBrandByCategory)
route.get('/category/:categories', productController.getAllProductByCategory)
route.get('/frontOffice/category/:categories', productController.getAllProductByCategoryWithoutQuantity)
route.delete('/:id', isAdmin, productController.deletProduct)

module.exports = route


