const categoryController = require('../controllers/categoryController');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;

const productSchema = require('../config/joi_validation/productSchema');
const imageSchema = require('../config/joi_validation/imageSchema');

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

    const newPath = await cloudinaryImageUploadMethod(path);
    urls.push(newPath);
    return newPath;
}

cloudinary.config({
    cloud_name: 'bedis10',
    api_key: '636586449714424',
    api_secret: 'OiuLiPg_SUTQR9B9KIM-uy05nMM'
});

async function addProduct(req, res) {
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
        return res.status(400).send('No image in the request');
    }

    const categories = Array.isArray(req.body.categories)
        ? req.body.categories
        : [req.body.categories];

    if (!categories || categories.length === 0) {
        return res.status(400).json({ error: 'Categories are empty' });
    }

    try {
        const user = await db.User.findOne({ where: { id: req.body.UserId } });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const foundCategories = await db.Category.findAll({
            where: { id: { [Op.in]: categories } }
        });

        if (foundCategories.length !== categories.length) {
            return res.status(400).json({ error: 'One or more categories not found' });
        }

        const product = await db.Product.create({
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            discount: req.body.discount,
            brand: req.body.brand,
            prix_discount: req.body.prix_discount,
            UserId: user.id
        });

        if (!product) {
            return res.status(400).json({ error: 'Error creating product' });
        }

        await Promise.all(
            foundCategories.map(async (cat) => {
                await db.Product_category.create({
                    CategoryId: cat.id,
                    ProductId: product.id
                });
            })
        );
        var i = 0;
        for (const file of files) {
            try {
                i++;
                const uploadedFile = await new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const fileData = await uploadFilee(file);
                            resolve(fileData);
                        } catch (error) {
                            reject(error);
                        }
                        fs.unlinkSync(file.path);
                    }, 1000); // Change the timeout value as needed
                    // fs.unlinkSync(file.path);
                });

                await db.Image.create({
                    name: uploadedFile.original_filename,
                    alt: uploadedFile.original_filename,
                    order: i,
                    url: uploadedFile.secure_url,

                    ProductId: product.id
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                // Handle file upload error
            }
        }
        // await fs.emptyDir('public/uploads')
        return res.status(201).json({ message: 'Product created' });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function deletProduct0(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'productId is empty' });

    await db.Image.destroy({ where: { ProductId: req.params.id } });

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

async function deletProduct(req, res) {
    const productId = req.params.id;

    try {
        const orderLineWithProduct = await db.OrderLine.findOne({
            where: { ProductId: productId }
        });

        if (orderLineWithProduct) {
            return res.status(400).json({ error: 'Product exists in orders, cannot delete' });
        }
        const product = await db.Product.findOne({ where: { id: productId } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete associated images
        await db.Image.destroy({ where: { ProductId: productId } });

        // Delete associations from Product_category table
        await db.Product_category.destroy({ where: { ProductId: productId } });

        // Delete the product
        await product.destroy();

        return res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: error.message });
    }
}

// async function getOneProduct(req, res) {
//     try {
//         const product = await db.Product.findOne({
//             where: { id: req.params.id },
//             include: [
//                 {
//                     model: db.Product_category,
//                     // attributes: [], // Exclude all attributes from the join table
//                     include: [
//                         { model: db.Category, attributes: ['id', 'name', 'description', 'url', 'createdAt', 'updatedAt', 'deletedAt'] }
//                     ]
//                 }
//             ],
//         });

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         const categories = product.Product_categories.map(pc => pc.Category);

//         res.status(200).json({
//             status: 'success',
//             data: categories
//         });
//     } catch (error) {
//         console.error('Error getting category for product:', error);
//         return res.status(500).json({ error: error.message });
//     }
// }

async function getOneProduct(req, res) {
    await db.Product.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: db.Product_category,
                include: [{ model: db.Category }],

                // raw: true,
                order: [['createdAt', 'DESC']]
            },
            { model: db.Image }
        ]
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
async function getOneProductWithoutQuantity(req, res) {
    await db.Product.findOne({
        attributes: { exclude: ['quantity'] },

        where: { id: req.params.id },
        include: [
            {
                model: db.Product_category,
                include: [{ model: db.Category }],

                // raw: true,
                order: [['createdAt', 'DESC']]
            },
            { model: db.Image }
        ]
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
    try {
        const products = await db.Product.findAll({
            include: [
                {
                    model: db.Image
                },
                {
                    model: db.Product_category,
                    include: [db.Category] // Include the Category model through the join table
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (products.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'No products found',
                data: []
            });
        }

        const formattedProducts = products.map((product) => {
            return {
                id: product.id,
                name: product.name,
                code: product.code,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                discount: product.discount,
                prix_discount: product.prix_discount,
                brand: product.brand,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                deletedAt: product.deletedAt,
                Images: product.Images,
                category: product.Product_categories.map((pc) => pc.Category)
            };
        });

        res.status(200).json({
            status: 'success',
            message: 'Products retrieved',
            data: formattedProducts
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function getAllProductWithoutQuantity(req, res) {
    try {
        const products = await db.Product.findAll({
            include: [
                {
                    model: db.Image
                },
                {
                    model: db.Product_category,
                    include: [db.Category] // Include the Category model through the join table
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (products.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'No products found',
                data: []
            });
        }

        const formattedProducts = products.map((product) => {
            return {
                id: product.id,
                name: product.name,
                code: product.code,
                description: product.description,
                price: product.price,
                discount: product.discount,
                brand: product.brand,
                prix_discount: product.prix_discount,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                deletedAt: product.deletedAt,
                Images: product.Images,
                category: product.Product_categories.map((pc) => pc.Category)
            };
        });

        res.status(200).json({
            status: 'success',
            message: 'Products retrieved',
            data: formattedProducts
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(500).json({ error: error.message });
    }
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
async function getLastTenProductWithoutQuantity(req, res) {
    await db.Product.findAll({
        attributes: { exclude: ['quantity'] },
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
        const products = await db.Product.findAll({
            where: { name: req.query.name },

            include: [
                {
                    model: db.Image
                }
            ],
            order: [['createdAt', 'DESC']]
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

async function getAllProductByNameWithoutQuantity(req, res) {
    try {
        const products = await db.Product.findAll({
            where: { name: req.query.name },
            attributes: { exclude: ['quantity'] },

            include: [
                {
                    model: db.Image
                }
            ],
            order: [['createdAt', 'DESC']]
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
    console.log('categories', categories);

    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]

    try {
        const categoryIds = categories.split(','); // Convert categories string to an array of category IDs

        const products = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [
                {
                    model: db.Product,
                    include: [{ model: db.Image }]
                    // raw: true,
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!products || products.length === 0) {
            return res.status(400).json([]);
        }
        var clearData = await products.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function getAllProductByCategoryWithoutQuantity(req, res) {
    const { categories } = req.params;
    console.log('categories', categories);

    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]

    try {
        const categoryIds = categories.split(','); // Convert categories string to an array of category IDs

        const products = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [
                {
                    model: db.Product,
                    attributes: { exclude: ['quantity'] },
                    include: [{ model: db.Image }]
                    // raw: true,
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!products || products.length === 0) {
            return res.status(400).json([]);
        }
        var clearData = await products.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function getAllBrandByCategory(req, res) {
    const { categories } = req.params;
    console.log('categories', categories);
    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]
    try {
        const categoryIds = categories.split(','); // Convert categories string to an array of category IDs
        const cat = await db.Category.findAll({
            where: { id: { [db.Sequelize.Op.in]: categoryIds } }
        });

        if (!cat) {
            return res.status(400).json({ error: 'Categories NOT FOUND' });
        }

        const brands = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [
                {
                    model: db.Product,
                    attributes: ['brand'],
                    // raw: true,
                    group: ['brand']
                }
            ]
        });

        if (!brands || brands.length === 0) {
            return res.status(400).json([]);
        }

        var clearData = await brands.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
        });
    } catch (error) {
        console.error('Error getting brands:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function getAllProductByCategoryTopDix(req, res) {
    const { categories } = req.params;
    console.log('categories', categories);
    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]
    try {
        const categoryIds = categories.split(','); // Convert categories string to an array of category IDs
        const cat = await db.Category.findAll({
            where: { id: { [db.Sequelize.Op.in]: categoryIds } }
        });

        if (!cat) {
            return res.status(400).json({});
        }

        const p = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [
                {
                    model: db.Product,
                    include: [{ model: db.Image }] // raw: true,
                }
            ],

            limit: 10
        });

        if (!p || p.length === 0) {
            return res.status(400).json({ error: [] });
        }

        var clearData = await p.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function getAllProductByCategoryTopDixWithoutQuantity(req, res) {
    const { categories } = req.params;
    console.log('categories', categories);
    // if (!categories) return res.status(400).send({ err: 'categoriesId is empty' });

    // const categories = [3, 2]
    try {
        const categoryIds = categories.split(','); // Convert categories string to an array of category IDs
        const cat = await db.Category.findAll({
            where: { id: { [db.Sequelize.Op.in]: categoryIds } }
        });

        if (!cat) {
            return res.status(400).json({});
        }

        const p = await db.Product_category.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },
            where: { CategoryId: { [db.Sequelize.Op.in]: categoryIds } },
            include: [
                {
                    model: db.Product,
                    attributes: { exclude: ['quantity'] },
                    include: [{ model: db.Image }] // raw: true,
                }
            ],

            limit: 10
        });

        if (!p || p.length === 0) {
            return res.status(400).json({ error: [] });
        }

        var clearData = await p.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
        });
    } catch (error) {
        console.error('Error getting products:', error);
        return res.status(400).json({ error: error.message });
    }
}

async function updateProduct(req, res) {
    const productId = req.params.id; // Assuming the product ID is part of the URL
    const files = req.files;

    console.log(productId);

    try {
        const product = await db.Product.findOne({ where: { id: productId } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (req.body.UserId) {
            const user = await db.User.findOne({ where: { id: req.body.UserId } });

            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }
        }

        await product.update({
            name: req.body.name || product.name,
            code: req.body.code || product.code,
            description: req.body.description || product.description,
            price: req.body.price || product.price,
            quantity: req.body.quantity || product.quantity,
            discount: req.body.discount || product.discount,
            brand: req.body.brand || product.brand,
            prix_discount: req.body.prix_discount || product.prix_discount,
            UserId: product.UserId
        });

        if (files) {
            // Create new images for the existing product
            var i = 0;
            for (const file of files) {
                try {
                    i++;
                    const uploadedFile = await new Promise((resolve, reject) => {
                        setTimeout(async () => {
                            try {
                                const fileData = await uploadFilee(file); // Assuming you have the uploadFilee function
                                resolve(fileData);
                            } catch (error) {
                                reject(error);
                            }
                            fs.unlinkSync(file.path);
                        }, 1000); // Change the timeout value as needed
                    });

                    // Create new images for the existing product
                    await db.Image.create({
                        name: uploadedFile.original_filename,
                        alt: uploadedFile.original_filename,
                        order: i,
                        url: uploadedFile.secure_url,
                        ProductId: product.id
                    });
                } catch (error) {
                    console.error('Error uploading file:', error);
                    // Handle file upload error
                }
            }
        }

        return res.status(200).json({ message: 'Product updated' });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: error.message });
    }
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

        const productIds = topSellingProductIds.map((product) => product.ProductId);

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
        });
        var clearData = await topSellingProduct.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
        });
    } catch (error) {
        console.error('Error retrieving top-selling products:', error);
        throw error;
    }
}

async function getTopSellingProductsWithoutQuantity(req, res) {
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

        const productIds = topSellingProductIds.map((product) => product.ProductId);

        const topSellingProduct = await db.Product.findAll({
            attributes: { exclude: ['CategoryId', 'ProductId', 'id'] },

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
        });
        var clearData = await topSellingProduct.map((proudt) => {
            return proudt.Product;
        });
        return res.status(200).json({
            status: 'success',
            data: await clearData.filter((proudt) => proudt != null)
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
    getLastTenProduct,
    getAllProductWithoutQuantity,
    getLastTenProductWithoutQuantity,
    getAllProductByNameWithoutQuantity,
    getAllProductByCategoryWithoutQuantity,
    getTopSellingProductsWithoutQuantity,
    getAllProductByCategoryTopDixWithoutQuantity,
    getOneProductWithoutQuantity
};
