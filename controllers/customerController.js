
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db=require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


 async function login(req,res)  {
    const user = await db.User.findOne({where:{email: req.body.email}})
    //console.log({user:user.name});
    const secret = process.env.secret||'123456azerty';
    if(!user) {
        return res.status(400).send({err:'The userModel not found'});
    }

    if(user && bcrypt.compareSync(req.body.password, user.password)) {
        
        const token = jwt.sign(
            {
                userModelId: user.id,
                userModelN:user.name
                // isAdmin: userModel.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({user: user.email , token: token}) 
    } else {
       res.status(400).send({err:'password is wrong!'});
    }

    
}


 async function register (req,res){

    const olduser = await db.Customer.findOne({where:{email: req.body.email}})
    if(olduser) {
        return res.status(400).send({err:'Email Exist'});
    }
    // const {error}=validationSchema(req.body)
    // if(error){
    //   return res.status(404).send({error:error.details[0].message});
    // }
     await db.Customer.create({
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        status: req.body.status,
        activity: req.body.activity,
        login: req.body.login,
        password: bcrypt.hashSync(req.body.password, 10),

        
    })
     .then(obj=>{
        res.json({
            status: true,
            message: "success.",
            date: obj,
          });
        } )    .catch((err) => res.status(400).json("Error creating " + err));

          
     

  
}


async function addUser(req,res){
    
    // const {error}=validationSchema(req.body)
    // if(error){
    //   return res.status(404).send({error:error.details[0].message});
    // }
  
    db.Customer.sync({force:false}).then(()=>{
        db.Customer.create({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        age:req.body.age,
        phone:req.body.phone,
      }).then((obj)=>{
        res.status(200).send(obj)
      }).catch((e)=>{
        res.status(400).json({error:e})
      })
    })
   
   
}

async function deletUser(req,res){
 
 
    await db.Customer.destroy({where:{id:req.params.id}}).then(obj=>{
      
          res.status(200).json({
            status: "success",
            message: "object delated",
            data: obj,
          
          })
        
      })
      .catch((err) => res.status(400).json("Error deleting " + err));
    }

    async function getOneUser(req,res){
      await db.Customer.findOne({where:{id:req.params.id}})
      .then((obj)=>{res.status(200).json({
        status: "success",
        
        data: obj,
      //   user:doc.payload.userN
        
      },)
    
  })
  .catch((err) => res.status(400).json("Error getting " + err));
    }

    async function getAllUser(req,res){
        // let token=req.headers.authorization
        // let doc =jwt.decode(token,({complete:true}))
        await db.Customer.findAll().then(obj=>{
       
            res.status(200).json({
              status: "success",
              message: "status delated",
              data: obj,
            //   user:doc.payload.userN
              
            },)
          
        })
        .catch((err) => res.status(400).json("Error deleting " + err));
      }

      // async function updateUser(req,res) {
      //   let id = req.params.id
      
      //      await db.User.update(req.body, { where: { id: id }}).then((obj)=>{
      //       res.status(200).send(obj)
      //     }).catch((e)=>{
      //       res.status(400).json({error:e})
      //     })
      
         
      // }

      async function updateUser(req,res){
        console.log(req.params.id);
        await db.Customer.findOne({
          where: {
              id: req.params.id
          }}).then(async(obj)=>{
            
            obj.name = req.body.name||obj.name;
        obj.email = req.body.email||obj.email;
        obj.city = req.body.city||obj.city;
        
        obj.status = req.body.status||obj.status;
        obj.activity = req.body.activity||obj.activity;
        obj.login = req.body.login||obj.login;
        obj.password = req.body.password||obj.password;
        await obj.save()
          res.status(200).send(obj)
        }).catch((e)=>{
          res.status(400).json({error:e})
        })
      }
      
      
      async function getAllStudentPagination(req, res) {
      
          const { page = 1, limit = 10 } = req.query;
          const total = await studentModel.find().count()
          date_begin = req.query.date_begin
          date_fin = req.query.date_fin
          const obj = req.query;
          // const numero= req.query.toString(14);
        
          Object.keys(obj).forEach(key => {
        
            if (key == "date_fin") {
              obj["createdAt"] = {
                $gte: new Date(date_begin),
                $lt: new Date(date_fin)
              }
            }
        
            else if (obj[key] === "" || obj[key] === null) {
              delete obj[key];
        
            }
            else if (key == "status") { }
            else {
        
              obj[key] = { $regex: obj[key], $options: 'i' }
              //  numero[key]={ $regex: numero[key], $options: 'i'}
        
        
            }
          });
        
          let data = [];
          let sort = { createdAt: -1 };
          const media = await studentModel
            .find(obj)
            .limit(limit * 1)
            .skip((page - 1) * limit).sort(sort).exec()
            .then((obj) => {
              obj.forEach(item => {
                data.push({
                  _id: item._id,
                  firstname: item.firstname,
                  lastname: item.lastname,
                  email: item.email,
                  age: item.age,
                  phone: item.phone,
                  
        
                })
        
              })
              res.status(200).json({
                status: "suceess", messages: "",
                results: {
                  TotalUserCount: total,
                  Result: "OK",
                  current: page,
                  max_per_page: limit,
                  data:
                    data
                },
        
              });
            }).catch((error) => {
        
              res.status(500).json({
                error: error
              })
            })
        }

module.exports={register,login,getAllUser,deletUser,updateUser,getOneUser}