'use strict';
import { Association, Model } from 'sequelize';
import { Book } from './book';
import { User } from './user';

export class UserBook extends Model {
  public id!: string;
  public user_id!: string;
  public book_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public readonly books?: Book[];

  public static associate?: Function;

  public static associations: {
    books: Association<UserBook, Book>;
    users: Association<UserBook, User>;
  };
}


export default (sequelize, DataTypes) => {
  UserBook.init({
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
    sequelize: sequelize,
  });

  UserBook.associate = function (models) {
    UserBook.belongsTo(models.Book);
    UserBook.belongsTo(models.User);
  };
  return UserBook;
};
