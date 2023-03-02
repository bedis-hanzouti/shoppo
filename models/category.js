// const { Model, DataTypes, Optional } =require('sequelize')
// const{sequelize}=require('sequelize')


const db = require('../models');

//const product = require('../models/product');
//const Product_category = require('./n/Product_category'); 
module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
      
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        url: { type: DataTypes.STRING, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: false },
        
       
         
          


    },{
        sequelize,
        paranoid: true,
        
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
    //   Category.belongsToMany(product, { through: Product_category });

    Category.associate = models => {
        Category.belongsToMany(models.Product, {
            as: 'Product',
            through: 'Product_category',
           // onDelete: "cascade"
        });
    
     }
    return Category;
};










