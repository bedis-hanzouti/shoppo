const express = require('express')
const route = express.Router()
const configMedia = require("../config/multer");
const imageController = require('../controllers/imageController')

route.post('/', configMedia.uploadOptions.array('images', 6), imageController.addImage)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id', imageController.updateImage)
route.get('/', imageController.getAllImage)
route.get('/:id', imageController.getOneImage)
// route.get('/:idCategory',imageController.getAllProductByCategory)
route.delete('/:id', imageController.deletImage)

route.get('/soft', imageController.getAllSoftImage)

route.get('/restore/:id', imageController.RestoreOneImage)

module.exports = route