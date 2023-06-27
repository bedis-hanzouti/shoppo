const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Sequelize } = require('sequelize')
const fs = require('fs')
const db = require('./models')
var path = require('path');
const figlet = require('figlet');
// db.sequelize = sequelize;
db.Sequelize = Sequelize;

const logger = require('morgan')
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors());
const stream = fs.createWriteStream(path.join(__dirname, 'logger.log'), { flags: "a" })
app.use(logger('combined', { stream: process.env.NODE_ENV === "production" ? stream : "" }));

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
const imagesRoutes = require("./routes/image");
// const ordersRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/category`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/user`, usersRoutes);
app.use(`${api}/image`, imagesRoutes);
// app.use(`${api}/orders`, ordersRoutes);


// db.Category.belongsToMany(db.Product, {
//   // as: 'Product',
//   through: db.Product_category,

//  // onDelete: "cascade"
// });

// db.Customer.belongsToMany(db.Product, {
//   through: 'rating',
//   onDelete: "cascade"
// });
// db.Customer.hasMany(db.Order, {

//   onDelete: "cascade"
// });

// db.Image.belongsTo(db.Product, {

//   foreignKey: {
//       allowNull: false
//   }
// });

// db.OrderLine.belongsTo(db.Order, {
//   foreignKey: {
//       allowNull: false
//   },
//   onDelete: "cascade"
// });
// db.OrderLine.belongsTo(db.Product, {
//   foreignKey: {
//       allowNull: false
//   },
//   onDelete: "cascade"
// });

// db.Order.belongsTo(db.Customer, {
//   foreignKey: {
//       allowNull: false
//   },
//   onDelete: "cascade"
// });
// db.Order.hasMany(db.OrderLine, {

//   onDelete: "cascade"
// });

// db.Product.belongsToMany(db.Category, {
//   as: 'Category',
//   through: db.Product_category,
//   //onDelete: "cascade"
// });
// db.Product.belongsToMany(db.Customer, {
//   // as: 'product',
//   through: 'rating',
//   // onDelete: "cascade"
// });
// db.Product.hasMany(db.OrderLine, {

//   onDelete: "cascade"
// });
// db.Product.hasMany(db.Image, {

//   onDelete: "cascade"
// });
// db.Product.hasMany(db.User, {

//   onDelete: "cascade"
// });

// db.User.hasMany(db.Product, {

//   onDelete: "cascade"
// });

db.sequelize.sync({ alter: true, force: false }).then(() => {
  app.listen(3000, () => {
    console.log("server running in port 3000")

    figlet("H3B - ENGINE", function (err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      console.log(data);
    });
  })
}).catch((error) => {
  console.error('Unable to connect to the database: ', error.message);
});



