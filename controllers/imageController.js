const db = require('../models');

const Sequelize = require('sequelize');
const fs = require('fs');
const imageSchema = require('../config/joi_validation/imageSchema');

const Op = Sequelize.Op;
async function addImage(req, res) {
    // const validationResult = categorSchema.validate(req.body);
    // // console.log(validationResult);
    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });
    const file = req.files;
    console.log(file);
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `/public/uploads/`;
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if (!req.body.ProductId) return res.status(400).send({ err: 'ProductId is empty' });

    const product = await db.Product.findOne({ where: { id: req.body.ProductId } });

    if (product) {
        db.Image.sync({ force: false }).then(() => {
            file.forEach((obj) => {
                db.Image.create({
                    name: req.body.name,
                    alt: req.body.alt,
                    url: `${basePath}${obj.filename}`, // "http://localhost:3000/public/upload/image-2323232",

                    ProductId: req.body.ProductId
                })

                    .then((obj) => {
                        return res.status(200).send(obj);
                    })
                    .catch((e) => {
                        file.forEach(async (obj) => {
                            await fs.unlink(obj.path, (err) => {
                                if (err) {
                                    console.log('error in deleting a file from uploads');
                                } else {
                                    console.log('succesfully deleted from the uploads folder');
                                }
                            });
                        });

                        return res.status(400).send(e.message);
                    });
            });
        });
    } else {
        res.status(400).json({ error: 'product not found' });
    }
}

async function updateImage(req, res) {
    if (!req.params.id) return res.status(400).send({ err: 'categoryId is empty' });

    const validationResult = imageSchema.validate(req.body);
    // console.log(validationResult);
    if (validationResult.error)
        return res.status(404).send({ error: validationResult.error.details[0].message });
    const file = req.file;

    if (file) {
        const fileName = file.filename;
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const basePath = `/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
        await db.Category.findOne({
            where: {
                id: req.params.id
            }
        })
            .then(async (obj) => {
                if (obj == null) {
                    res.status(400).json({ error: 'IMAGE NOT FOUND' });
                }
                obj.alt = fileName;
                obj.name = req.body.name || obj.name;
                obj.url = `${basePath}${fileName}`;
                obj.product_id = req.body.product_id || obj.product_id;

                await obj.save();
                res.status(200).send(obj);
            })
            .catch(async (e) => {
                await fs.unlink(file.path, (err) => {
                    if (err) {
                        console.log('error in deleting a file from uploads');
                    } else {
                        console.log('succesfully deleted from the uploads folder');
                    }
                });
                res.status(400).json(e.message);
            });
    } else {
        await db.Category.findOne({
            where: {
                id: req.params.id
            }
        })
            .then(async (obj) => {
                if (obj == null) {
                    res.status(400).json({ error: 'IMAGE NOT FOUND' });
                }
                obj.name = req.body.name || obj.name;
                obj.alt = obj.alt;
                obj.url = obj.url;
                obj.product_id = req.body.product_id || obj.product_id;

                await obj.save();
                res.status(200).send(obj);
            })
            .catch(async (e) => {
                await fs.unlink(file.path, (err) => {
                    if (err) {
                        console.log('error in deleting a file from uploads');
                    } else {
                        console.log('succesfully deleted from the uploads folder');
                    }
                });
                res.status(400).json(e.message);
            });
    }
}
async function deletImage(req, res) {
    if (!req.params.id) return res.status(400).send({ err: 'imageId is empty' });

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
    if (!req.params.id) return res.status(400).send({ err: 'imageId is empty' });

    await db.Image.findOne({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'IMAGE NOT FOUND' });
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
                res.status(400).json({ error: 'NO IMAGE FOUND' });
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
    if (!req.params.id) return res.status(400).send({ err: 'imageId is empty' });

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
    await db.Image.findAndCountAll()
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'NO IMAGE FOUND' });
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
