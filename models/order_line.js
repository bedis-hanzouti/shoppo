



module.exports = (sequelize, DataTypes) => {
    const OrderLine = sequelize.define('OrderLine', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
      
        
        status: { type: DataTypes.INTEGER, allowNull: false },
        total: { type: DataTypes.INTEGER, allowNull: false },
        total_discount: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        discount: { type: DataTypes.INTEGER, allowNull: false },
        
        
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
    OrderLine.associate = models => {
        OrderLine.belongsTo(models.Order, {
            
            onDelete: "cascade"
        });
    }
    OrderLine.associate = models => {
        OrderLine.belongsTo(models.Product, {
            
            onDelete: "cascade"
        });
    }
    return OrderLine;
};










