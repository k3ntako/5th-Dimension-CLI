'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    title: DataTypes.STRING(255),
    publisher: DataTypes.STRING(255),
    isbn_10: DataTypes.STRING(50),
    isbn_13: DataTypes.STRING(50),
    issn: DataTypes.STRING(50),
    other_identifier: DataTypes.STRING(255),
  }, {
    underscored: true,
    tableName: 'books',
  });

  Book.associate = function (models) {
    Book.belongsToMany(models.Author, {
      through: models.AuthorBook,
      foreignKey: 'book_id',
      as: "authors",
    });

    Book.belongsToMany(models.User, {
      through: models.UserBook,
      foreignKey: 'book_id',
      as: "users",
    });
  };
  return Book;
};