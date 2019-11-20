'use strict';
module.exports = (sequelize, DataTypes) => {
  const AuthorBook = sequelize.define('AuthorBook', {
    author_id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: sequelize.models.Author,
        key: 'id',
      },
    },
    book_id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: sequelize.models.Book,
        key: 'id',
      },
    },
  }, {
    underscored: true,
    tableName: 'author_books',
    timestamps: false,
  });

  AuthorBook.associate = function (models) {
    AuthorBook.belongsTo(models.Author);
    AuthorBook.belongsTo(models.Book);
  };
  return AuthorBook;
};