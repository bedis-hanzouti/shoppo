

const db=require('../models');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


async function addP(req,res){
  // const file = req.file;
  // console.log(req.body.user_id);
  // if (!file) return res.status(400).send('No image in the request');

  // const fileName = file.filename;
  // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const user = await db.User.findOne({where:{id:req.body.user_id}})
  categories = req.body.category;
  
  if(user){
  
    db.Product.create({
      name:req.body.name,
      code:req.body.code,
      description:req.body.description,
      price:req.body.price,
      quantity:req.body.quantity,
      
      discount:req.body.discount,
      brand:req.body.brand,
      user_id:user.id,
     
      }).then(prod => {
          if (categories.length > 0) {
            categories.forEach(category => {
                  db.Product_category.create({
                    category_id: category.id,
                    product_id: prod.id
                  }).then().catch((e)=>res.status(400).json({error:e}));
              })
          }
          res.status(201).json(prod)
      })
    }
    else{
      res.status(400).json({error:"User not found"})

      
    }
  


}

 
async function addProduct(req,res){
  // const file = req.file;
  // console.log(req.body.user_id);
  // if (!file) return res.status(400).send('No image in the request');

  // const fileName = file.filename;
  // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
   
   const user = await db.User.findOne({where:{id:req.body.user_id}})

    if(user){
      db.Product.sync({force:false}).then(()=>{
        db.Product.create({
        name:req.body.name,
        code:req.body.code,
        description:req.body.description,
        price:req.body.price,
        quantity:req.body.quantity,
       
        discount:req.body.discount,
        brand:req.body.brand,
        user_id:req.body.user_id,
        
      }).then((obj)=>{
        res.status(200).send(obj)
      }).catch((e)=>{
        res.status(400).json({error:e})
      })
    })
    }
    else{
      res.status(400).json({error:"User not found"})

      
    }
  
  
   
   
}

async function deletProduct(req,res){
 
 
    await db.Product.destroy({where:{id:req.params.id}}).then(obj=>{
      
          res.status(200).json({
            status: "success",
            message: "object delated",
            data: obj,
          
          })
        
      })
      .catch((err) => res.status(400).json("Error deleting " + err));
    }
    async function getOneProduct(req,res){
        await db.Product.findOne({where:{id:req.params.id}})
        .then((obj)=>{res.status(200).json({
          status: "success",
          
          data: obj,
        //   user:doc.payload.userN
          
        },)
      
    })
    .catch((err) => res.status(400).json("Error getting " + err));
      }
    async function getAllProduct(req,res){
        // let token=req.headers.authorization
        // let doc =jwt.decode(token,({complete:true}))
        await db.Product.findAll().then(obj=>{
       
            res.status(200).json({
              status: "success",
              message: "status delated",
              data: obj,
            //   user:doc.payload.userN
              
            },)
          
        })
        .catch((err) => res.status(400).json("Error deleting " + err));
      }

      async function getAllProductByCategory(req,res){
        // let token=req.headers.authorization
        // let doc =jwt.decode(token,({complete:true}))
        await db.Product.findAll({
          limit: 10,
        offset: 0,
        include: {
          model:db.Category,
          as: "categories",
          where:{id:req.params.idCategory}
        }
        }).then(obj=>{
       
            res.status(200).json({
              status: "success",
              message: "status delated",
              data: obj,
            //   user:doc.payload.userN
              
            },)
          
        })
        .catch((err) => res.status(400).json("Error deleting " + err));
      }

    

     
      
      async function updateProduct(req,res){
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
          }}).then(async(obj)=>{
           //console.log({fileName});
          //  console.log({imagepath});
            obj.name = req.body.name||obj.name;
            obj.code = req.body.code||obj.code;
            obj.description = req.body.description||obj.description;
            obj.price = req.body.price||obj.price;
            obj.quantity = req.body.quantity||obj.quantity;
            obj.image = obj.image;
            obj.discount = req.body.discount||obj.discount;
            obj.brand = req.body.brand||obj.brand;
            obj.user_id = req.body.user_id||obj.user_id;
            obj.url = obj.url;
        
        await obj.save()
          res.status(200).send(obj)
        }).catch((e)=>{
          res.status(400).json({error:e})
        })
      }

      async function updateCategoryOfProduct(req,res) {
        categories = req.body.category;
    db.Product.findOne({
        where: {
            id: req.params.id
        }
    }).then(prod => {
        if (prod == null) {
            res.send("prod not found")
        }

        if (categories.length > 0) {
          categories.forEach(cat => {
            db.Product_category.create({
              category_id: cat.id,
              product_id: prod.id
                }).then(cat => res.send(cat));
            })
        }
        res.status(200).send({ res: "category added" })
    }).catch(error => console.log(error));;
      }

      async function deleteCategoryOfProduct(req,res) {
        db.Product_category.findOne({
          where: {
            category_id: req.body.category_id,
            product_id: req.body.product_id
          }
      }).then((obj)=> {
         
          if (obj == null) {
              res.send("category not found")
          } else {
            obj.destroy().then(()=> {
                  res.status(200).send({ res: "category deleted" })
              }).catch(error => console.log(error));
          }
      });
      }

       

module.exports={getAllProduct,deletProduct,updateProduct,addProduct,getOneProduct,getAllProductByCategory}