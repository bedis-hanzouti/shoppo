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
        },
        {
            sequelize,
            paranoid: true,
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt']
                }
            }
        }
    );

    Product_category.associate = (models) => {
        Product_category.belongsTo(models.Product, {
            foreignKey: 'ProductId', // Specify the foreign key column name
            allowNull: false
        });
        Product_category.belongsTo(models.Category, {
            foreignKey: 'CategoryId', // Specify the foreign key column name
            allowNull: false
        });
    };

    return Product_category;
};
