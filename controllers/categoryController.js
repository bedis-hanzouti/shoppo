const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const categorSchema = require('../config/joi_validation/categorySchema')
const cloudinary = require('cloudinary').v2;


async function cloudinaryImageUploadMethod(file) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, (err, res) => {
            if (err) {
                reject(new Error("Upload image error"));
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







async function addCategory(req, res) {


    const file = req.file;

    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `/public/uploads/`;

    db.Category.sync({ force: false }).then(async () => {
        const validationResult = categorSchema.validate(req.body);

        if (validationResult.error) {
            return res.status(404).send({ error: validationResult.error.details[0].message });
        }
        else {
            await uploadFilee(file).then(async (obj) => {
                // console.log(validationResult);




                await db.Category.create({
                    name: req.body.name,
                    url: obj.secure_url,
                    description: req.body.description
                })
                    .then((obj) => {
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
                    })


            })
        }
    })


}

async function deleteCategory(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'id is empty' });

    await db.Category.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}
async function getOneCategory(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'id is empty' });


    await db.Category.findOne({ where: { id: req.params.id } })
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


async function getAllCategory(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Category.findAll(paginate(req.query, req.query))
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status getted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json([]));
}

async function getAllSoftCategory(req, res) {

    await db.Category.findAll({
        where: { deletedAt: { [Op.not]: null } },
        paranoid: false,
        order: [['deletedAt', 'DESC']]
    })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status delated',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json([]));
}

const paginate = (query, schema) => {
    let page = query.page ? query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const where = {};
    delete query.page;
    delete query.limit;
    delete schema.limit;
    delete schema.page;

    Object.keys(schema).forEach((key) => {
        console.log(key);
        schema[key] && query[key] ? (where[key] = query[key]) : null;
    });
    return {
        where: where,
        offset,
        limit
    };
};

async function RestoreOneCategory(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'id is empty' });


    await db.Category.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({});
            }
            await obj.restore();
            res.status(200).json({
                status: 'restored success',

                data: obj

            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function updateCategory(req, res) {
    // const validationResult = categorSchema.validate(req.body);
    // // console.log(validationResult);
    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });
    const file = req.file;

    if (file) {
        const fileName = file.filename;
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const basePath = `/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
        if (req.params.id)

            await db.Category.findOne({
                where: {
                    id: req.params.id
                }
            })
                .then(async (obj) => {
                    if (obj == null) {
                        res.status(400).json({ error: 'CATEGORY NOT FOUND' });
                    }
                    obj.name = req.body.name || obj.name;
                    obj.description = req.body.description || obj.description;

                    obj.image = imagepath;
                    obj.url = fileName;

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
                    res.status(400).json({ error: 'CATEGORY NOT FOUND' });
                }
                obj.name = req.body.name || obj.name;
                obj.description = req.body.description || obj.description;

                obj.image = obj.image;
                obj.url = obj.url;

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

module.exports = {
    getAllCategory,
    deleteCategory,
    updateCategory,
    addCategory,
    getOneCategory,
    RestoreOneCategory,
    getAllSoftCategory
};
