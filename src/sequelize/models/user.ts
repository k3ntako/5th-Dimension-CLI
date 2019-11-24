'use strict';
import { Association, Model } from 'sequelize';
import {
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin
} from 'sequelize';
import { Book } from './book';

export class User extends Model {
  public id!: string;
  public first_name?: string;
  public last_name?: string;
  public email?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getBooks!: BelongsToManyGetAssociationsMixin<Book>;
  public addBook!: BelongsToManyAddAssociationMixin<Book, number>;
  public hasBook!: BelongsToManyHasAssociationMixin<Book, number>;
  public countBooks!: BelongsToManyCountAssociationsMixin;
  public createBook!: BelongsToManyCreateAssociationMixin<Book>;

  public readonly books?: Book[];

  public static associate?: Function;

  public static associations: {
    books: Association<User, Book>;
  };
}


export default (sequelize, DataTypes) => {
  User.init({
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
    sequelize: sequelize,
  });

  User.associate = function(models) {
    User.belongsToMany(models.Book, {
      through: models.UserBook,
      foreignKey: 'user_id',
      as: "books",
    });

    User.hasMany(models.UserBook, {
      foreignKey: 'user_id',
      as: 'userBooks',
    });
  };

  return User;
};