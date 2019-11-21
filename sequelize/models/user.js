'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    first_name: DataTypes.STRING(255),
    last_name: DataTypes.STRING(255),
    email: DataTypes.STRING(255),
  }, {
    underscored: true,
    tableName: 'users',
  });

  User.associate = function(models) {
    User.belongsToMany(models.Book, {
      through: models.UserBook,
      foreignKey: 'user_id',
      as: "books",
    });
  };

  return User;
};