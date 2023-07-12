module.exports = (sequelize, DataTypes) => {
    const Product_category = sequelize.define(
        'Product_category',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            }

            // categoryId: { type: DataTypes.INTEGER, allowNull: false },
            // productId: { type: DataTypes.INTEGER, allowNull: false },
        },
        {
            sequelize,
            paranoid: true,
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt']
                }
            }

            // If you want to give a custom name to the deletedAt column
            // deletedAt: 'destroyTime'
        }
    );
    Product_category.associate = (models) => {
        Product_category.belongsTo(models.Product, {
            foreignKey: {
                allowNull: false
            }
        });
        Product_category.belongsTo(models.Category, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    return Product_category;
};
