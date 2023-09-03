const express = require('express')
const route = express.Router()
const configMedia = require("../config/multer");
const imageController = require('../controllers/imageController')
const { isAdmin } = require('../helpers/jwt');


route.post('/', configMedia.uploadOptions.array('images', 6), imageController.addImage)
// route.post('/',configMedia.uploadOptions.array('image',5),productController.addProduct)

route.put('/:id', isAdmin, imageController.updateImage)
route.get('/', imageController.getAllImage)
route.get('/:id', imageController.getOneImage)
// route.get('/:idCategory',imageController.getAllProductByCategory)
route.delete('/:id', isAdmin, imageController.deletImage)

route.get('/soft', imageController.getAllSoftImage)

route.get('/restore/:id', isAdmin, imageController.RestoreOneImage)

module.exports = route