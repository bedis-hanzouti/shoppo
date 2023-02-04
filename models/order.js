



module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
      
         //customer_id: { type: DataTypes.INTEGER, allowNull: false },
        status: { type: DataTypes.INTEGER, allowNull: false },
        total: { type: DataTypes.INTEGER, allowNull: false },
        total_discount: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        discount: { type: DataTypes.INTEGER, allowNull: false},
        
        
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
    Order.associate = models => {
        Order.belongsTo(models.Customer, {
            
            onDelete: "cascade"
        });
    }
    Order.associate = models => {
        Order.hasMany(models.OrderLine, {
            
            onDelete: "cascade"
        });
    }
    return Order;
};










