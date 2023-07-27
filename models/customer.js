

module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        name: { type: DataTypes.STRING, allowNull: false },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Must be a valid email address",
                },
                notEmpty: true,

            }
        },

        city: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: true },
        activity: { type: DataTypes.STRING, allowNull: true },
        password: { type: DataTypes.STRING, allowNull: false },
        login: { type: DataTypes.STRING, allowNull: true },



    }, {
        sequelize,
        paranoid: true,
        // defaultScope: {
        //     attributes: {
        //         exclude: ['password']
        //     },

        // },
    });
    Customer.associate = models => {
        // Customer.belongsToMany(models.Product, {
        //     through: 'rating',
        //     onDelete: "cascade"
        // });
        Customer.hasMany(models.Order, {

            onDelete: "cascade"
        });
    }

    Customer.associate = models => {
        Customer.hasMany(models.Order, {

            onDelete: "cascade"
        });
    }
    return Customer;
};










