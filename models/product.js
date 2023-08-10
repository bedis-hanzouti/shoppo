module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define(
        'Product',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            code: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false },
            price: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            quantity: { type: DataTypes.INTEGER, allowNull: false },
            discount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            brand: { type: DataTypes.STRING, allowNull: false }
        },
        {
            sequelize,
            paranoid: true
        }
    );

    Product.associate = (models) => {
        Product.hasMany(models.Product_category, {
            foreignKey: 'ProductId', // Specify the foreign key column name
            onDelete: 'cascade'
        });

        Product.belongsToMany(models.Customer, {
            through: 'Rating',
            onDelete: 'cascade'
        });

        Product.hasMany(models.OrderLine, {
            onDelete: 'cascade'
        });

        Product.hasMany(models.Image, {
            onDelete: 'cascade'
        });

        Product.hasMany(models.User, {
            onDelete: 'cascade'
        });
    };

    return Product;
};
