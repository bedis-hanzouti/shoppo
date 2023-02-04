const express=require('express')
const route=express.Router()
const configMedia = require("../config/multer");
const categoryController=require('../controllers/categoryController')

route.post('/',configMedia.uploadOptions.single('image'),categoryController.addCategory)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id',configMedia.uploadOptions.single('image'),categoryController.updateCategory)
route.get('/',categoryController.getAllCategory)
route.get('/:id',categoryController.getOneCategory)
// route.get('/:idCategory',categoryController.getAllProductByCategory)
route.delete('/:id',categoryController.deleteCategory)

module.exports=route