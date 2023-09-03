module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define(
        'Order',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            // 


            pending: { type: DataTypes.STRING, allowNull: false, defaultValue: sequelize.fn('now') },
            canceled: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            delivered: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            expedied: { type: DataTypes.STRING, allowNull: true, defaultValue: null },

            total: { type: DataTypes.DOUBLE, allowNull: false },
            total_discount: { type: DataTypes.DOUBLE, allowNull: false },
            quantity: { type: DataTypes.INTEGER, allowNull: false },
            shipping: { type: DataTypes.INTEGER, allowNull: true },
            rank: { type: DataTypes.INTEGER, allowNull: false },
            discount: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 }
        },
        {
            sequelize,
            paranoid: true

            // If you want to give a custom name to the deletedAt column
            // deletedAt: 'destroyTime'
        }
    );
    Order.associate = (models) => {
        Order.belongsTo(models.Customer, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'cascade',

        });
    };
    Order.associate = (models) => {
        Order.hasMany(models.OrderLine, {
            onDelete: 'cascade'
        });
    };
    return Order;
};