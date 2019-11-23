'use strict';
import { Model } from 'sequelize';

class AuthorBook extends Model {
  public author_id!: string;
  public book_id!: string;

  public static associate?: Function;
}

export { AuthorBook };

export default (sequelize, DataTypes) => {
  AuthorBook.init({
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
    sequelize: sequelize,
  });

  AuthorBook.associate = function (models) {
    AuthorBook.belongsTo(models.Author);
    AuthorBook.belongsTo(models.Book);
  };

  return AuthorBook;
};
