const categoryController = require('../controllers/categoryController');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const fs = require('fs');


const cloudinary = require('cloudinary').v2;



const productSchema = require('../config/joi_validation/productSchema')
const imageSchema = require('../config/joi_validation/imageSchema')


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


cloudinary.config({
    cloud_name: 'bedis10',
    api_key: '636586449714424',
    api_secret: 'OiuLiPg_SUTQR9B9KIM-uy05nMM'
});






async function addProduct(req, res) {

    const files = req.files;
    // console.log(files);
    if (!files || Object.keys(files).length === 0) {
        return res.status(400).send('No image in the request');
    }

    const categories = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];

    if (!req.body.categories) return res.status(400).send({ err: 'categories is empty' });

    try {
        const user = await db.User.findOne({ where: { id: req.body.UserId } });
        if (!user) {
            return res.status(400).json({ error: 'user not found' });
        }

        const category = await db.Category.findAll({ where: { id: { [Op.in]: categories } } });

        if (category.length === 0) {
            return res.status(400).json({ error: 'categorie not found' });
        }

        if (user) {
            const product = await db.Product.create({
                name: req.body.name,
                code: req.body.code,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                discount: req.body.discount,
                brand: req.body.brand,
                UserId: user.id
            });

            if (product) {
                if (categories.length > 0) {
                    await Promise.all(category.map(async (cat) => {
                        await db.Product_category.create({
                            CategoryId: cat.id,
                            ProductId: product.id
                        });
                    }));
                }
                const validationResult = productSchema.validate(req.body);

                if (validationResult.error) {
                    return res.status(404).send({ error: validationResult.error.details[0].message });
                }
                else {
                    await Promise.all(files.map(async (file) => {
                        await uploadFilee(file).then(async (res) => {


                            await db.Image.create({
                                name: res.original_filename,
                                alt: res.original_filename,
                                url: res.secure_url,
                                ProductId: product.id
                            });
                        })





                    }));

                    return res.status(201).json({ message: "Product created" });
                }
            } else {
                files.forEach(async (file) => {
                    // Handle file cleanup or deletion if necessary
                });
                return res.status(400).json({ error: 'Error creating product' });
            }
        } else {
            return res.status(400).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}










async function deletProduct(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'productId is empty' });

    await db.Product.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(200).json({});
            }
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}
async function getOneProduct(req, res) {


    await db.Product.findOne({
        where: { id: req.params.id },
        include: [{
            model: db.Product_category, include: [{ model: db.Category }],

            // raw: true,
            order: [['createdAt', 'DESC']]


        }, { model: db.Image }],
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({});
            }
            res.status(200).json({
                status: 'success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}
async function getAllProductDix(req, res) {

    await db.Product.findAll({
        include: [
            {
                model: db.Image
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status geted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function getAllProduct(req, res) {

    await db.Product.findAll({
        include: [
            {
                model: db.Image
            }
        ],
        order: [['createdAt', 'DESC']],

    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status geted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}
async function getLastTenProduct(req, res) {

    await db.Product.findAll({
        include: [
            {
                model: db.Image
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10

    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status geted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}


async function getAllProductByName(req, res) {
    try {
        console.log(req.query.name);
        const products = await db.Product.findAll({
            where: { name: req.query.name },
            include: [
                {
                    model: db.Image
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        if (products.length === 0) {
            return res.status(400).json([]);
        }

        res.status(200).json({
            status: 'success',
            message: 'Products retrieved successfully',
            data: products
        });
    } catch (error) {
        res.status(400).json('Error getting products: ' + error.message);
    }
}






async function getAllProductByCategory(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);

    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });


    // const categories = [3, 2]

    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs

        const products = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [{
                model: db.Product, include: [{ model: db.Image }],
                // raw: true,

            }],
            order: [['createdAt', 'DESC']]
        });


        if (!products || products.length === 0) {
            return res.status(400).json([]);
        }
        var clearData = await products.map(proudt => {

            return (proudt.Product)

        })
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter(proudt => proudt != null),
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: error.message });
    }
}












async function getAllBrandByCategory(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);
    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]
    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs
        const cat = await db.Category.findAll({
            where: { id: { [db.Sequelize.Op.in]: categoryIds } },
        });

        if (!cat) {
            return res.status(400).json({ error: 'Categories NOT FOUND' });
        }

        const brands = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [{
                model: db.Product, attributes: ['brand'],
                // raw: true,
                group: ['brand'],
            }],
        });

        if (!brands || brands.length === 0) {
            return res.status(400).json([]);
        }

        var clearData = await brands.map(proudt => {

            return (proudt.Product)

        })
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter(proudt => proudt != null),
        });
    } catch (error) {
        console.error('Error getting brands:', error);
        return res.status(400).json({ error: error.message });
    }
}





async function getAllProductByCategoryTopDix(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);
    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]
    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs
        const cat = await db.Category.findAll({
            where: { id: { [db.Sequelize.Op.in]: categoryIds } },
        });

        if (!cat) {
            return res.status(400).json({});
        }

        const p = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [{
                model: db.Product, include: [{ model: db.Image }],                 // raw: true,


            }],

            limit: 10
        });

        if (!p || p.length === 0) {
            return res.status(400).json({ error: [] });
        }

        var clearData = await p.map(proudt => {

            return (proudt.Product)

        })
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter(proudt => proudt != null),
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: error.message });
    }
}


async function updateProduct(req, res) {


    // const validationResult = producySchema.validate(req.body);
    // // console.log(validationResult);
    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });
    const file = req.file;
    let imagepath;
    console.log(file);
    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    }
    await db.Product.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(async (obj) => {
            if (obj == null) {
                res.status(200).json({});
            }
            obj.name = req.body.name || obj.name;
            obj.code = req.body.code || obj.code;
            obj.description = req.body.description || obj.description;
            obj.price = req.body.price || obj.price;
            obj.quantity = req.body.quantity || obj.quantity;
            obj.image = obj.image;
            obj.discount = req.body.discount || obj.discount;
            obj.brand = req.body.brand || obj.brand;
            obj.user_id = req.body.user_id || obj.user_id;
            obj.url = obj.url;

            await obj.save();
            res.status(200).send(obj);
        })
        .catch((e) => {
            res.status(400).json({ error: e.message });
        });
}

async function updateCategoryOfProduct(req, res) {
    categories = req.body.category;
    // console.log(req.body.category);
    if (!req.params.id) return res.status(400).send({ err: 'productId is empty' });

    if (categories.length > 0) {
        db.Product_category.destroy({ where: { ProductId: req.params.id } })

            .then(async (prod) => {
                var categoriesProduct = [];

                await categories.forEach((category) => {
                    console.log(category);
                    categoriesProduct.push(
                        db.Product_category.create({
                            CategoryId: category.id,
                            ProductId: prod.id
                        })
                    );
                });
                res.status(200).send({ res: 'category updated', data: categoriesProduct });
            })
            .catch((err) => res.status(400).json('Error getting ' + err.message));

    }
}

async function deleteCategoryOfProduct(req, res) {
    if (!req.body.category_id) return res.status(400).send({ err: 'categoryId is empty' });
    if (!req.body.product_id) return res.status(400).send({ err: 'productId is empty' });


    db.Product_category.findOne({
        where: {
            category_id: req.body.category_id,
            product_id: req.body.product_id
        }
    }).then((obj) => {
        if (obj == null) {
            res.send('category not found');
        } else {
            obj.destroy()
                .then(() => {
                    res.status(200).send({ res: 'category deleted' });
                })
                .catch((err) => res.status(400).json('Error getting ' + err.message));

        }
    });
}

// async function getTopSellingProducts() {
//     console.log("***********************************");
//     console.log("hello");
//     console.log("***********************************");

//     try {

//         const topSellingProducts = await db.OrderLine.findAll({
//             attributes: ['ProductId', [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'total']],
//             group: ['ProductId'],
//             order: [[db.Sequelize.literal('total'), 'DESC']],
//             limit: 10,
//             include: [
//                 {
//                     model: db.Product,
//                     include: [
//                         {
//                             model: db.Image
//                         }
//                     ]
//                 }
//             ]
//         });

//         return topSellingProducts.map(product => product.Product);
//     } catch (error) {
//         console.error('Error retrieving top-selling products:', error);
//         throw error;
//     }
// }
async function getTopSellingProducts(req, res) {

    try {
        const topSellingProductIds = await db.OrderLine.findAll({
            attributes: [
                'ProductId',
                [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'total']
            ],
            group: ['ProductId'],
            order: [[db.Sequelize.literal('total'), 'DESC']],
            limit: 10
        });

        const productIds = topSellingProductIds.map(product => product.ProductId);


        const topSellingProduct = await db.Product.findAll({
            where: {
                id: {
                    [Op.in]: productIds
                }
            },
            include: [
                {
                    model: db.Image
                }
            ]
        })
        var clearData = await topSellingProduct.map(proudt => {

            return (proudt.Product)

        })
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter(proudt => proudt != null),
        });


    } catch (error) {
        console.error('Error retrieving top-selling products:', error);
        throw error;
    }
}





module.exports = {
    getAllProduct,
    getAllProductByName,
    deletProduct,
    updateProduct,
    addProduct,
    getOneProduct,
    getAllProductByCategory,
    updateCategoryOfProduct,
    deleteCategoryOfProduct,
    getAllProductByCategoryTopDix,
    getAllBrandByCategory,
    getTopSellingProducts,
    getLastTenProduct

};





