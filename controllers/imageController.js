const db = require('../models');

const Sequelize = require('sequelize');
const fs = require('fs');
const imageSchema = require('../config/joi_validation/imageSchema');
const cloudinary = require('cloudinary').v2;


const Op = Sequelize.Op;

async function cloudinaryImageUploadMethod(file) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, (err, res) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(res);
            }
        });
    });
}




async function uploadFilee(req) {

    const urls = [];


    const { path } = req;


    const newPath = await cloudinaryImageUploadMethod(path)
    urls.push(newPath);
    return newPath
}

async function addImage(req, res) {
    const files = req.files;

    if (!files) {
        return res.status(400).json({ error: 'No image in the request' });
    }

    if (!req.body.ProductId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const product = await db.Product.findOne({ where: { id: req.body.ProductId } });

        if (product) {
            let orderCounter = 0;
            let image;
            for (const file of files) {
                try {
                    orderCounter++;
                    const uploadedFile = await uploadFilee(file);

                    image = await db.Image.create({
                        name: uploadedFile.original_filename,
                        alt: req.body.alt,
                        order: orderCounter,
                        url: uploadedFile.secure_url,
                        ProductId: product.id
                    });

                    await fs.unlinkSync(file.path);
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }

            return res.status(201).json(image);
        } else {
            return res.status(400).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error adding images:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function updateImage(req, res) {
    try {
        const image = await db.Image.findOne({ where: { id: req.params.id } });

        if (image) {

            await image.update({
                alt: req.body.alt || image.alt,
                order: req.body.order || image.order,
            });

            return res.status(200).json(image);
        } else {
            return res.status(400).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Error updating image:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function deletImage(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'imageId is empty' });

    await db.Image.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'IMAGE NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}
async function getOneImage(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'imageId is empty' });

    await db.Image.findOne({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({});
            }
            res.status(200).json({
                status: 'success',

                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function getAllSoftImage(req, res) {
    await db.Image.findAll({
        where: { deletedAt: { [Op.not]: null } },
        paranoid: false,
        order: [['deletedAt', 'DESC']]
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function RestoreOneImage(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'imageId is empty' });

    await db.Image.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'IMAGE NOT FOUND' });
            }
            await obj.restore();
            res.status(200).json({
                status: 'restored success',

                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function getAllImage(req, res) {
    await db.Image.findAll()
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',

                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error  ' + err.message));
}

module.exports = {
    getOneImage,
    deletImage,
    updateImage,
    addImage,
    getAllSoftImage,
    RestoreOneImage,
    getAllImage
};
