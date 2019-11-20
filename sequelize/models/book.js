'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: DataTypes.STRING(255),
    publisher: DataTypes.STRING(255),
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
  };
  return Book;
};