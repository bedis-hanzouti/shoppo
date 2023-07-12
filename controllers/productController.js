const categoryController = require('../controllers/categoryController');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const fs = require('fs');


const productSchema = require('../config/joi_validation/productSchema')






async function addProduct(req, res) {
    // const validationResult = productSchema.validate(req.body);

    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
        return res.status(400).send('No image in the request');
    }

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const categories = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];

    if (!req.body.categories) return res.status(400).send({ err: 'categories is empty' });


    try {
        const user = await db.User.findOne({ where: { id: req.body.UserId } });
        const category = await db.Category.findAll({ where: { id: { [Op.in]: categories } } });

        if (category.length === 0) {
            return res.status(400).json({ error: 'CATEGORIES not found' });
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

                await Promise.all(files.map(async (file) => {
                    await db.Image.create({
                        name: file.filename,
                        alt: "ss",
                        url: `${basePath}${file.filename}`,
                        ProductId: product.id
                    });
                }));

                return res.status(201).json({ message: "Product created" });
            } else {
                files.forEach(async (file) => {
                    await fs.unlink(file.path, (err) => {
                        if (err) {
                            console.log('error in deleting a file from uploads');
                        } else {
                            console.log('successfully deleted from the uploads folder');
                        }
                    });
                });
                return res.status(400).json({ error: 'Error creating product' });
            }
        } else {
            return res.status(400).json({ error: 'User not found' });
        }
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ error: error });
    }
}




async function deletProduct(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'productId is empty' });

    await db.Product.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'PRODUCT NOT FOUND' });
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
    if (!req.params.id) return res.status(400).send({ err: 'productId is empty' });

    await db.Product_category.findOne({
        where: { ProductId: req.params.id },
        include: [{
            model: db.Product, include: [{ model: db.Image, attributes: ['url'] }],
            raw: true,
            order: [['createdAt', 'DESC']]


        }],
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'PRODUCT NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}
async function getAllProduct(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Product.findAndCountAll({
        include: [
            {
                model: db.Image
            }
        ],
        order: [['createdAt', 'DESC']]
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'PRODUCTS NOT FOUND' });
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





async function getAllProductByCategory(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);

    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });


    // const categories = [3, 2]

    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs

        const products = await db.Product_category.findAll({

            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [{
                model: db.Product, include: [{ model: db.Image, attributes: ['url'] }],
                raw: true,

            }],
            order: [['createdAt', 'DESC']]
        });

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'No products found for the specified categories' });
        }

        return res.status(200).json({
            status: 'success',
            data: products,
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: 'Error getting products' });
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

            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [{
                model: db.Product, attributes: ['brand'],
                raw: true,
                group: ['brand'],
            }],
        });

        if (!brands || brands.length === 0) {
            return res.status(400).json({ error: 'BRANDS NOT FOUND' });
        }

        return res.status(200).json({
            status: 'success',
            data: brands,
        });
    } catch (error) {
        console.error('Error getting brands:', error);
        return res.status(400).json({ error: error });
    }
}




async function getAllProductByCategoryTopDix(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);

    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });


    // const categories = [3, 2]

    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs

        const products = await db.Product_category.findAll({

            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [{
                model: db.Product,
                raw: true,

            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'No products found for the specified categories' });
        }

        return res.status(200).json({
            status: 'success',
            data: products,
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: 'Error getting products' });
    }
}

async function updateProduct(req, res) {
    if (!req.params.id) return res.status(400).send({ err: 'productId is empty' });

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
                res.status(400).json({ error: 'PRODUCT NOT FOUND' });
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
            .catch((error) => console.log(error.message));
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
                .catch((error) => console.log(error.message));
        }
    });
}

async function getTopSellingProducts() {
    try {
        const topSellingProducts = await db.OrderLine.findAll({
            attributes: ['ProductId', [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'totalQuantity']],
            group: ['ProductId'],
            order: [[db.Sequelize.literal('totalQuantity'), 'DESC']],
            limit: 10
        });

        const productIds = topSellingProducts.map(product => product.ProductId);
        if (productIds)
            return await db.Product.findAll({
                where: {
                    id: productIds
                }
            });

        // return products;
    } catch (error) {
        console.error('Error retrieving top-selling products:', error);
        throw error;
    }
}

module.exports = {
    getAllProduct,
    deletProduct,
    updateProduct,
    addProduct,
    getOneProduct,
    getAllProductByCategory,
    updateCategoryOfProduct,
    deleteCategoryOfProduct,
    getAllProductByCategoryTopDix,
    getAllBrandByCategory,
    getTopSellingProducts
};

