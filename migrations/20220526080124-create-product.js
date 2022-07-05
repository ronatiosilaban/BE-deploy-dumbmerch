// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class user extends Model {

//     static associate(models) {
//       user.hasOne(models.profile, {
//         as: "profile",
//         foreignKey: {
//           name: "idUser"
//         }
//       })

//       user.hasMany(models.product, {
//         as: "products",
//         foreignKey: {
//           name: "iduser"
//         }
//       })
//     }
//   };
//   user.hasMany(models.transaction, {
//     as: "sellerTransactions",
//     foreignKey: {
//       name: "idSeller",
//     },
//   });

//   //hasMany association to chat model
//   user.hasMany(models.chat, {
//     as: "senderMessage",
//     foreignKey: {
//       name: "idSender",
//     },
//   });
//   user.hasMany(models.chat, {
//     as: "recipientMessage",
//     foreignKey: {
//       name: "idRecipient",
//     },
//   });


//   user.init({
//     username: DataTypes.STRING,
//     email: DataTypes.STRING,
//     password: DataTypes.STRING,
//     status: DataTypes.STRING
//   }, {
//     sequelize,
//     modelName: 'user',
//   });
//   return user;
// };
'use strict';

const { preferences } = require("joi");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      qty: {
        type: Sequelize.INTEGER
      },
      idUser: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};