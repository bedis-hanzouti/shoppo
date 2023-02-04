const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const{Sequelize}=require('sequelize')
const db=require('./models')

const logger=require('morgan')
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
// app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
// app.use(errorHandler);

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
// const ordersRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/user`, usersRoutes);
// app.use(`${api}/orders`, ordersRoutes);



 db.sequelize.sync({ alter: true }).then(()=>{
  app.listen(3000,()=>console.log("server running in port 3000"))
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});
