const categoryController = require('../controllers/categoryController');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const fs = require('fs');


async function addProductToCategorie(categoryId, productId) {
    console.log('productId', productId);
    return await db.Category.findOne({ where: { id: categoryId } })
        .then(async (cat) => {
            if (!cat) {
                console.log('category not found!');
                return null;
            }
            return await db.Product.findOne({ where: { id: productId } }).then(async (prod) => {
                if (!prod) {
                    console.log('product not found!');
                    return null;
                }

                await db.Product_category.create({
                    CategoryId: categoryId,
                    ProductId: productId
                })
                    .then((obj) => {
                        console.log('objo', obj.toJSON());
                        return obj;
                    })
                    .catch((err) => {
                        console.log('hhhhh', err.message);
                        //   res.status(400).json(err)
                    });
            });
        })
        .catch((err) => {
            console.log('>> Error while adding Product to Category: ', err.message);
            //   res.status(400).json(err)
        });
}

// async function addProduct(req,res){
//     const user=await db.User.findOne({ where: { id: req.body.UserId } });
//    categories = req.body.categories;
//    images = req.body.images;
//    promises=[]

//    if (user) {
//        await  db.Product.create({
//            name: req.body.name,
//            code: req.body.code,
//            description: req.body.description,
//            price: req.body.price,
//            quantity: req.body.quantity,

//            discount: req.body.discount,
//            brand: req.body.brand,
//            UserId: user.id
//        })
//        if (categories.length > 0) {

//         await db.product.addCategories(categories.map(tag => tag[0]));

// }
// else {
//            res.status(400).json({ error: 'User not found' });
//        }}
//     }

//  async function addProduct(req, res) {
//     //console.log(req.body);

//         const user = await  db.User.findOne({ where: { id: req.body.UserId } });
//         categories = req.body.categories;
//         images = req.body.images;
//         let product
//         let category
//         promises = [];
//     // try {
//         if (user) {
//             const all=Promise.all([])
//           const p= await  db.Product.create({
//                 name: req.body.name,
//                 code: req.body.code,
//                 description: req.body.description,
//                 price: req.body.price,
//                 quantity: req.body.quantity,

//                 discount: req.body.discount,
//                 brand: req.body.brand,
//                 UserId: user.id

//             }
//             )

//                 // console.log(product.toJSON());
//                const c=await db.Category.findAll({raw:true})

//                  await p.addcategory(c);
//                  console.log(await p.countCategories());

//           } else {
//             res.status(400).json({ error: 'User not found' });
//         }
//         // categories.forEach((category) => {
//         //     product.addCategories({
//         //       CategoryId: category.id,
//         //       ProductId: prod.id
//         //     })
//         //     .then((obj)=>{
//         //         console.log(obj);
//         //         res.status(201).json(obj)})

//         // })

// }

// async function addProduct(req, res) {
//     var prodId = 0
//     const file = req.files;

//     if (!file) return res.status(400).send('No image in the request');


//     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
//     const categories = req.body.categories;
//     // const images = req.body.images;

//     const user = await db.User.findOne({ where: { id: req.body.UserId } });
//      const category=await db.Category.findAll({ row:true,where: {  id: {[Op.in]: req.body.categories} } })
//    // const category = await db.Category.findAll({ row: true, where: { id: req.body.categories } });

//     if (!category.length) {
//         return res.status(400).json({ error: 'CATEGORIES not found' });
//     }

//     if (user) {


//         const p = await db.Product.create({
//             name: req.body.name,
//             code: req.body.code,
//             description: req.body.description,
//             price: req.body.price,
//             quantity: req.body.quantity,

//             discount: req.body.discount,
//             brand: req.body.brand,
//             UserId: user.id

//         })

//         if(p){

//         if (categories.length > 0) {
//             console.log("categories", categories);

//             category.forEach(async (category) => {


//                 await db.Product_category.create({
//                     CategoryId: category.id,
//                     ProductId: p.id
//                 })
//             })
//         }



//         file.forEach(async(obj) => {
//          await   db.Image.create({
//                 name: obj.filename,
//                 alt: "ss",
//                 url: `${basePath}${obj.filename}`,
//                 ProductId: p.id
//             })
//                 .then((obj) => {
//                     res.status(201).json("Product creted");
//                 })


//         });


//         }
//         else{
//             file.forEach(async (obj) => {
//                 // console.log(obj);
//                  await fs.unlink(obj.path, (err) => {
//                      if (err) {
//                          console.log('error in deleting a file from uploads');
//                      } else {
//                          console.log('succesfully deleted from the uploads folder');
//                      }
//                  });
//              })
//             res.status(400).json({ error: 'error creating product' });
//         }
//     }



//     else {
//         res.status(400).json({ error: 'User not found' });
//     }

// }

async function addProduct(req, res) {
    const file = req.files;

    if (!file) return res.status(400).send('No image in the request');

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const categories = req.body.categories;

    try {
        const user = await db.User.findOne({ where: { id: req.body.UserId } });
        const category = await db.Category.findAll({ where: { id: { [Op.in]: req.body.categories } } });

        if (!category.length) {
            return res.status(400).json({ error: 'CATEGORIES not found' });
        }

        if (user) {
            const p = await db.Product.create({
                name: req.body.name,
                code: req.body.code,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                discount: req.body.discount,
                brand: req.body.brand,
                UserId: user.id
            });

            if (p) {
                if (categories.length > 0) {
                    console.log("categories", categories);

                    await Promise.all(category.map(async (category) => {
                        await db.Product_category.create({
                            CategoryId: category.id,
                            ProductId: p.id
                        });
                    }));
                }

                await Promise.all(file.map(async (obj) => {
                    await db.Image.create({
                        name: obj.filename,
                        alt: "ss",
                        url: `${basePath}${obj.filename}`,
                        ProductId: p.id
                    });
                }));

                res.status(201).json("Product created");
            } else {
                file.forEach(async (obj) => {
                    await fs.unlink(obj.path, (err) => {
                        if (err) {
                            console.log('error in deleting a file from uploads');
                        } else {
                            console.log('successfully deleted from the uploads folder');
                        }
                    });
                });
                res.status(400).json({ error: 'error creating product' });
            }
        } else {
            res.status(400).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function deletProduct(req, res) {
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
    await db.Product.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: db.Category,
                as: 'category'
            }
        ]
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

// async function getAllProductByCategory(req, res) {
//     console.log(req.body.categories)

//     await db.Product.findAndCountAll({
//         include: [
//             {
//                 model: db.Image
//             },
//             { model: db.Category, as: 'category', where: { id: { [Op.in]: req.body.categories } } }
//         ],
//         order: [['createdAt', 'DESC']]
//     })
//         .then((obj) => {
//             if (obj == null) {
//                 res.status(400).json({ error: 'PRODUCTS NOT FOUND' });
//             }
//             res.status(200).json({
//                 status: 'success',

//                 data: obj

//             });
//         })
//         .catch((err) => res.status(400).json('Error getting ' + err.message));
// }



async function getAllProductByCategory(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);

    // const categories = [3, 2]

    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs

        const products = await db.Product.findAll({
            include: [
                {
                    model: db.Image,
                },
                {
                    model: db.Category,
                    as: 'category',
                    where: { id: { [db.Sequelize.Op.in]: categoryIds } }, // Use the categoryIds array in the where clause
                },
            ],
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






// async function getAllBrandByCategory(req, res) {

//     const categories = await db.Category.findAll({ where: { id: { [Op.in]: req.body.categories } } })
//     if (!categories) {
//         res.status(400).json({ error: 'Categories NOT FOUND' });
//     }
//     await db.Product.findAll({
//         attributes: ['brand'],
//         raw: true,
//         group: ['brand'],
//         include: [
//             {
//                 model: db.Category,
//                 as: 'category',
//                 where: { id: { [Op.in]: req.body.categories } },
//                 attributes: ['name']
//             }
//         ],
//         order: [['createdAt', 'DESC']],

//     })
//         .then((obj) => {
//             if (obj == null) {
//                 res.status(400).json({ error: 'BRANDS NOT FOUND' });
//             }
//             res.status(200).json({
//                 status: 'success',

//                 data: obj
//                 //   user:doc.payload.userN
//             });
//         })
//         .catch((err) => res.status(400).json('Error getting ' + err.message));
// }

async function getAllBrandByCategory(req, res) {
    const { categories } = req.params;
    console.log("categories", categories);

    // const categories = [3, 2]
    try {
        const categoryIds = categories.split(","); // Convert categories string to an array of category IDs
        const cat = await db.Category.findAll({
            where: { id: { [db.Sequelize.Op.in]: categoryIds } },
        });

        if (!cat) {
            return res.status(400).json({ error: 'Categories NOT FOUND' });
        }

        const brands = await db.Product.findAll({
            attributes: ['brand'],
            raw: true,
            group: ['brand'],
            include: [
                {
                    model: db.Category,
                    as: 'category',
                    where: { id: { [db.Sequelize.Op.in]: categoryIds } },
                    attributes: ['name'],
                },
            ],
            order: [['createdAt', 'DESC']],
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
        return res.status(400).json({ error: 'Error getting brands' });
    }
}


async function getAllProductByCategoryTopDix(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Product.findAndCountAll({
        include: [
            {
                model: db.Image
            },
            { model: db.Category, as: 'category', where: { id: req.params.id } }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'PRODUCTS NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function updateProduct(req, res) {
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
    getAllBrandByCategory
};

// .then(async(prod) => {
//     var p=prod
//     var cat
//     if (categories.length > 0) {
//    await      categories.forEach((category) => {
//             db.Product_category.create({
//                 CategoryId: category.id,
//                 ProductId: prod.id
//             })
//                 .then((obj) => {
//                     cat=obj
//                    })
//                 .catch((e) => res.status(400).json({ error: e }));
//         });
//     }
// })
// .then((obj) => {
//      console.log(obj);
//      res.status(201).json({ message: 'product created ', data:{ p} })
// })  .catch((e) => res.status(400).json({ error: e }))
