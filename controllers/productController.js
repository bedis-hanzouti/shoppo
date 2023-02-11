const db = require('../models');
const categoryController = require('../controllers/categoryController');


const Sequelize = require('sequelize');
const Op = Sequelize.Op;




   async function addProductToCategorie(categoryId, productId) {
    console.log("productId",productId);
      return  await db.Category.findOne({where:{id:categoryId}}) 
    .then(async(cat) => {
      if (!cat) {
        console.log("category not found!");
        return null;
      }
        return await  db.Product.findOne({where:{id:productId}}).then(async(prod) => {
        if (!prod) {
          console.log("product not found!");
          return null;
        }

          await db.Product_category.create({
            CategoryId: categoryId,
           ProductId: productId
        }).then((obj)=>{
            console.log("objo",obj);
            return obj 
        }).catch((err) => {
            console.log("hhhhh", err);
          //   res.status(400).json(err)
      
      });
      });
    })
    .catch((err) => {
      console.log(">> Error while adding Product to Category: ", err);
    //   res.status(400).json(err)

});
}








async function addProduct(req, res) {
    //console.log(req.body);
   try {    const user=await db.User.findOne({ where: { id: req.body.UserId } });
   categories = req.body.categories;
   images = req.body.images;
   promises=[]

   if (user) {
       await  db.Product.create({
           name: req.body.name,
           code: req.body.code,
           description: req.body.description,
           price: req.body.price,
           quantity: req.body.quantity,

           discount: req.body.discount,
           brand: req.body.brand,
           UserId: user.id
       }).then(async(product) => {
       // console.log("product",product);
           if (categories.length > 0) {

               await categories.forEach( async(obj) => {
               // console.log("objet",obj);
                   promises.push(addProductToCategorie(obj.id,product.id))
               })}
             // console.log("promises",obj);
             await  Promise.all(promises)
               .then((elem) => {
                console.log("eleeemmmmmmmmmm",elem);
                   res.status(200).json(elem)
               }).catch((err)=>{
                   res.status(400).json(err)
               })
               


       }).catch((errr)=>{
        res.status(400).json(errr)
       })
       

       
          
                            
           

         
     
         
   } 
   else {
       res.status(400).json({ error: 'User not found' });
   }}
   catch(e){
    res.status(400).json({ error: e });
   }
 
}


async function deletProduct(req, res) {
    await db.Product.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err));
}
async function getOneProduct(req, res) {
    await db.Product.findOne({ where: { id: req.params.id } })
        .then((obj) => {
            res.status(200).json({
                status: 'success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err));
}
async function getAllProduct(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Product.findAll({include: { model: db.Product_category}})
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status delated',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err));
}

async function getAllProductByCategory(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Product.findAll({
        limit: 10,
        offset: 0,
        include: {
            model: db.Category,
            as: 'categories',
            where: { id: req.params.idCategory }
        }
    })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status delated',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err));
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
            //console.log({fileName});
            //  console.log({imagepath});
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
            res.status(400).json({ error: e });
        });
}

async function updateCategoryOfProduct(req, res) {
    categories = req.body.category;
    // console.log(req.body.category);
    if (categories.length > 0) {
        db.Product_category.destroy({ where: { ProductId: req.params.id } })

            .then(async(prod) => {
              var categoriesProduct=[]
              
               await  categories.forEach((category) => {
                console.log(category);
                  categoriesProduct.push(
                    db.Product_category.create({
                        CategoryId: category.id,
                        ProductId: prod.id
                    }))
                  
                })
                res.status(200).send({ res: 'category updated',data:categoriesProduct });
            })
            .catch((error) => console.log(error));
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
                .catch((error) => console.log(error));
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
    deleteCategoryOfProduct
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