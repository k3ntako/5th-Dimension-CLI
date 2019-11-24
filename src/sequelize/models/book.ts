'use strict';

import { Association, Model } from 'sequelize';
import {
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from 'sequelize';
import { Author } from './author';
import { User } from './user';

export class Book extends Model {
  public id!: string;
  public title!: string;
  public publisher?: string;
  public isbn_10!: string;
  public isbn_13!: string;
  public issn!: string;
  public other_identifier!: string;

  public getAuthors!: BelongsToManyGetAssociationsMixin<Author>;
  public addAuthor!: BelongsToManyAddAssociationMixin<Author, number>;
  public hasAuthor!: BelongsToManyHasAssociationMixin<Author, number>;
  public countAuthors!: BelongsToManyCountAssociationsMixin;
  public createAuthor!: BelongsToManyCreateAssociationMixin<Author>;

  public getUsers!: BelongsToManyGetAssociationsMixin<User>;
  public addUser!: BelongsToManyAddAssociationMixin<User, number>;
  public hasUser!: BelongsToManyHasAssociationMixin<User, number>;
  public countUsers!: BelongsToManyCountAssociationsMixin;
  public createUser!: BelongsToManyCreateAssociationMixin<User>;

  public readonly authors?: Author[];
  public readonly users?: User[];

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate?: Function;

  public static associations: {
    authors: Association<Book, Author>;
    users: Association<Book, User>;
  };
}

export default (sequelize, DataTypes) => {
  Book.init({
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
    sequelize: sequelize,
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

    Book.hasMany(models.UserBook, {
      foreignKey: 'book_id',
      as: 'userBooks',
    });
  };
  return Book;
};
