

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
        }
      }
    },

    city: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    activity: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    login: { type: DataTypes.STRING, allowNull: false },








  }, {
    sequelize,
    paranoid: true,
    // defaultScope: {
    //   attributes: {
    //     exclude: ['password']
    //   },

    // },
  }





  );
  User.associate = models => {
    User.hasMany(models.Product, {

      onDelete: "cascade"
    });
  }

  return User;
};










// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
//     passwordHash: {
//         type: String,
//         required: true,
//     },
//     phone: {
//         type: String,
//         required: true,
//     },
//     isAdmin: {
//         type: Boolean,
//         default: false,
//     },
//     street: {
//         type: String,
//         default: ''
//     },
//     apartment: {
//         type: String,
//         default: ''
//     },
//     zip :{
//         type: String,
//         default: ''
//     },
//     city: {
//         type: String,
//         default: ''
//     },
//     country: {
//         type: String,
//         default: ''
//     }

// });

// userSchema.virtual('id').get(function () {
//     return this._id.toHexString();
// });

// userSchema.set('toJSON', {
//     virtuals: true,
// });

// exports.User = mongoose.model('User', userSchema);
// exports.userSchema = userSchema;
