



module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
      
        code: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        
        discount: { type: DataTypes.INTEGER, allowNull: false ,defaultValue: 0},
        brand: { type: DataTypes.STRING, allowNull: false },
        
        // url: { type: DataTypes.STRING, allowNull: false },
        
       
       

      
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
    Product.associate = models => {
        Product.belongsToMany(models.Category, {
            as: 'product',
            through: 'Product_category',
            onDelete: "cascade"
        });
    }

    Product.associate = models => {
        Product.belongsToMany(models.Customer, {
            as: 'product',
            through: 'rating',
            // onDelete: "cascade"
        });
    }

    Product.associate = models => {
        Product.hasMany(models.OrderLine, {
            
            onDelete: "cascade"
        });
    }

    Product.associate = models => {
        Product.hasMany(models.User, {
            
            onDelete: "cascade"
        });
    }
    // Product.associate = models => {
    //     Product.hasMany(models.Image, {
            
    //         onDelete: "cascade"
    //     });
    // }
    Product.associate = models => {
        Product.hasMany(models.Image, {
            
            onDelete: "cascade"
        });
    }

    Product.associate = models => {
        Product.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            },
            onDelete: "cascade"
        });
    }
    return Product;
};










