const db=require('../models');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
async function addImage(req,res){
    const file = req.file;
    console.log(req.body.user_id);
    if (!file) return res.status(400).send('No image in the request');
  
    const fileName = file.filename;
    const basePath = `/public/uploads/`;
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
      
     
     const product = await db.Product.findOne({where:{id:req.body.pro}})
  
      if(product){
        db.Image.sync({force:false}).then(()=>{
          db.Image.create({
          name:req.body.name,
          alt:req.body.alt,
          url:`${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232",
       
          ProductId:req.body.pro,
          
        }).then((obj)=>{
          res.status(200).send(obj)
        }).catch((e)=>{
          res.status(400).json({error:e})
        })
      })
      }
      else{
        res.status(400).json({error:"product not found"})
  
        
      }

  }

  async function updateImage(req, res) {
    const file = req.file;
    
   // if (!file) return res.status(400).send('No image in the request');
  if(file){ var fileName = file.filename;
    var basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
      }
   
   
    await db.Image.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(async (obj) => {
          console.log("hello",obj);
          if(file)
          {
             obj.alt = fileName 
             obj.name = req.body.name || obj.name;
            obj.url = `${basePath}${fileName}` 
            obj.product_id = req.body.product_id || obj.product_id;
          }
            else{ 
                 obj.name = req.body.name || obj.name;
            obj.alt =  obj.alt;
            obj.url =  obj.url;
            obj.product_id = req.body.product_id || obj.product_id;
            }
           
            
            await obj.save();
            res.status(200).send(obj);
        })
        .catch((e) => {
            res.status(400).json({ error: e });
        });
}
  async function deletImage(req,res){
 
 
    await db.Image.destroy({where:{id:req.params.id}}).then(obj=>{
      
          res.status(200).json({
            status: "success",
            message: "object delated",
            data: obj,
          
          })
        
      })
      .catch((err) => res.status(400).json("Error deleting " + err));
    }
    async function getOneImage(req,res){
        await db.Image.findOne({where:{id:req.params.id}})
        .then((obj)=>{res.status(200).json({
          status: "success",
          
          data: obj,
        //   user:doc.payload.userN
          
        },)
      
    })
    .catch((err) => res.status(400).json("Error getting " + err));
      }


      async function getAllSoftImage(req, res) {
        // let token=req.headers.authorization
        // let doc =jwt.decode(token,({complete:true}))
        await db.Image.findAll({
            
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
            .catch((err) => res.status(400).json('Error getting ' + err));
    }

    async function RestoreOneImage(req, res) {
        await db.Image.findOne({ where: { id: req.params.id }, paranoid: false })
            .then(async (obj) => {
                // console.log(obj);
                await obj.restore();
                res.status(200).json({
                    status: 'restored success',
      
                    data: obj
                    //   user:doc.payload.userN
                });
            })
            .catch((err) => res.status(400).json('Error getting ' + err));
      
            
      }

      async function getAllImage(req,res){
        // let token=req.headers.authorization
        // let doc =jwt.decode(token,({complete:true}))
        await db.Image.findAndCountAll().then(obj=>{
       
            res.status(200).json({
              status: "success",
              message: "status delated",
              data: obj,
            //   user:doc.payload.userN
              
            },)
          
        })
        .catch((err) => res.status(400).json("Error deleting " + err));
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
    