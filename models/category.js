const db = require('../models');
module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
        'Category',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false },
            url: { type: DataTypes.STRING, allowNull: false },
            // image: { type: DataTypes.STRING, allowNull: true }
        },
        {
            sequelize,
            paranoid: true
        }
    );

    Category.associate = (models) => {
        Category.hasMany(models.Product_category, {
            foreignKey: 'CategoryId', // Specify the foreign key column name
            onDelete: 'cascade'
        });
    };

    return Category;
};
