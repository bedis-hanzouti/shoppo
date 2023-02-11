



module.exports = (sequelize, DataTypes) => {
    const Product_category = sequelize.define('Product_category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
      
      
        
        // categoryId: { type: DataTypes.INTEGER, allowNull: false },
        // productId: { type: DataTypes.INTEGER, allowNull: false },
       
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
   
    return Product_category;
};










