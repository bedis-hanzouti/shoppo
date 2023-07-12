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

            status: { type: DataTypes.STRING, allowNull: false },
            total: { type: DataTypes.INTEGER, allowNull: false },
            total_discount: { type: DataTypes.INTEGER, allowNull: false },
            quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            discount: { type: DataTypes.INTEGER, allowNull: false }
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
