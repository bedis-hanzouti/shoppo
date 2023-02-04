



module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
      
        code: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        
        discount: { type: DataTypes.INTEGER, allowNull: false ,defaultValue: 0},
        brand: { type: DataTypes.STRING, allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        url: { type: DataTypes.STRING, allowNull: false },
        
       
       

      
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
    Product.associate = models => {
        Product.belongsToMany(models.Category, {
            
            through: 'Product_category',
            onDelete: "cascade"
        });
    }

    Product.associate = models => {
        Product.belongsToMany(models.Customer, {
            as: 'Product',
            through: 'Product_category',
            onDelete: "cascade"
        });
    }
    Product.associate = models => {
        Product.hasMany(models.OrderLine, {
            
            onDelete: "cascade"
        });
    }
    Product.associate = models => {
        Product.hasMany(models.Image, {
            
            onDelete: "cascade"
        });
    }
    Product.associate = models => {
        Product.hasMany(models.Image, {
            
            onDelete: "cascade"
        });
    }
    return Product;
};










