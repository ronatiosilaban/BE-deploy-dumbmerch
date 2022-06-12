'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    static associate(models) {
      // define association here
      product.belongsTo(models.user, {
        as: "user",
        foreignKey: {
          name: "idUser"
        }
      })
      product.belongsToMany(models.category, {
        as: "categories",
        through: {
          model: 'productCategory',
          as: "bridge",
        },
        foreignKey: "idProduct"
      })
    }
  }




  product.init({
    image: DataTypes.STRING,
    price: DataTypes.INTEGER,
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
    qty: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};

