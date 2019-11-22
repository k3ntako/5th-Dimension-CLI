'use strict';
module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(255),
    }
  }, {
    underscored: true,
    tableName: 'authors',
    timestamps: false,
  });

  Author.associate = function(models) {
    Author.belongsToMany(models.Book, {
      through: models.AuthorBook,
      as: "books",
      foreignKey: 'author_id',
    });
  };
  return Author;
};