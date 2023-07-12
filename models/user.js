module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            name: { type: DataTypes.STRING, allowNull: false },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Must be a valid email address'
                    }
                }
            },

            city: { type: DataTypes.STRING, allowNull: false },
            status: { type: DataTypes.STRING, allowNull: false },
            activity: { type: DataTypes.STRING, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: false },
            login: { type: DataTypes.STRING, allowNull: false }
        },
        {
            sequelize,
            paranoid: true
            // defaultScope: {
            //   attributes: {
            //     exclude: ['password']
            //   },

            // },
        }
    );
    User.associate = (models) => {
        User.hasMany(models.Product, {
            onDelete: 'cascade'
        });
    };

    return User;
};
