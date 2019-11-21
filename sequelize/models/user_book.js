'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserBook = sequelize.define('UserBook', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: sequelize.models.Book,
        key: 'id',
      },
    },
    book_id: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: sequelize.models.User,
        key: 'id',
      },
    },
  }, {
    underscored: true,
    tableName: 'user_books',
  });

  UserBook.associate = function (models) {
    UserBook.belongsTo(models.Book);
    UserBook.belongsTo(models.User);
  };
  return UserBook;
};