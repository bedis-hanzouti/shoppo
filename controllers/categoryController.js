

const db=require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;



 
async function addCategory(req,res){
  const file = req.file;
  console.log(req.body.user_id);
  if (!file) return res.status(400).send('No image in the request');

  const fileName = file.filename;
  const basePath = `/public/uploads/`;
    
   

   
      db.Category.sync({force:false}).then(()=>{
        db.Category.create({
        name:req.body.name,
        
        description:req.body.description,
       
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
       
        url:fileName
      }).then((obj)=>{
        res.status(200).send(obj)
      }).catch((e)=>{
        res.status(400).json({error:e})
      })
    })
    
    
  
  
   
   
}

async function deleteCategory(req,res){
 
 
    await db.Category.destroy({where:{id:req.params.id}}).then(obj=>{
      
          res.status(200).json({
            status: "success",
            message: "object delated",
            data: obj,
          
          })
        
      })
      .catch((err) => res.status(400).json("Error deleting " + err));
    }
    async function getOneCategory(req,res){
        await db.Category.findOne({where:{id:req.params.id}})
        .then((obj)=>{res.status(200).json({
          status: "success",
          
          data: obj,
        //   user:doc.payload.userN
          
        },)
      
    })
    .catch((err) => res.status(400).json("Error getting " + err));
      }
    // async function getAllCategory(req,res){
    //     // let token=req.headers.authorization
    //     // let doc =jwt.decode(token,({complete:true}))
    //     await db.Category.find().then(obj=>{
       
    //         res.status(200).json({
    //           status: "success",
    //           message: "status delated",
    //           data: obj,
    //         //   user:doc.payload.userN
              
    //         },)
          
    //     })
    //     .catch((err) => res.status(400).json("Error deleting " + err));
    //   }

      async function getAllCategory(req, res) {
        // let token=req.headers.authorization
       // let doc =jwt.decode(token,({complete:true}))
       
      const limit = req.query.size ? +req.query.size : 10;
     const offset = req.query.page ? req.query.page * limit : 0;
       await db.Category.findAndCountAll(paginate(req.query,req.query))
           .then((obj) => {
              
               res.status(200).json({
                   status: 'success',
                   message: 'status getted',
                   data: obj
                   //   user:doc.payload.userN
               });
           })
           .catch((err) => res.status(400).json('Error deleting ' + err));
   }


      async function getAllSoftCategory(req, res) {
        // let token=req.headers.authorization
        // let doc =jwt.decode(token,({complete:true}))
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
            .catch((err) => res.status(400).json('Error deleting ' + err));
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
          console.log(key)
        schema[key] && query[key] ? (where[key] = query[key]) : null;
      });
      return {
        where: where,
        offset,
        limit,
      };
    };

    

    async function RestoreOneCategory(req, res) {
      await db.Category.findOne({ where: { id: req.params.id }, paranoid: false })
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

     
      
      async function updateCategory(req,res){
        const file = req.file;
        let imagepath;
        console.log(file);
        if (file) {
            const fileName = file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagepath = `${basePath}${fileName}`;
        } 
        await db.Category.findOne({
          where: {
              id: req.params.id
          }}).then(async(obj)=>{
           //console.log({fileName});
          //  console.log({imagepath});
            obj.name = req.body.name||obj.name;
            obj.description = req.body.description||obj.description;
           
            obj.image = obj.image;
           
          
            obj.url = obj.url;
        
        await obj.save()
          res.status(200).send(obj)
        }).catch((e)=>{
          res.status(400).json({error:e})
        })
      }

       

module.exports={getAllCategory,deleteCategory,updateCategory,addCategory,getOneCategory,RestoreOneCategory,getAllSoftCategory}