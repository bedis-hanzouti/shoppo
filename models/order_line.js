module.exports = (sequelize, DataTypes) => {
    const OrderLine = sequelize.define(
        'OrderLine',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            status: { type: DataTypes.STRING, allowNull: true },
            total: { type: DataTypes.DOUBLE, allowNull: false },
            total_discount: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
            quantity: { type: DataTypes.INTEGER, allowNull: false },
            discount: { type: DataTypes.DOUBLE, allowNull: false }
        },
        {
            sequelize,
            paranoid: true

            // If you want to give a custom name to the deletedAt column
            // deletedAt: 'destroyTime'
        }
    );
    OrderLine.associate = (models) => {
        OrderLine.belongsTo(models.Order, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'cascade'
        });
        OrderLine.belongsTo(models.Product, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'cascade'
        });
    };
    // OrderLine.associate = models => {
    //     OrderLine.belongsTo(models.Product, {
    //         foreignKey: {
    //             allowNull: false
    //         },
    //         onDelete: "cascade"
    //     });
    // }
    return OrderLine;
};
