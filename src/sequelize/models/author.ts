'use strict';
import { Association, Model } from 'sequelize';
import {
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from 'sequelize';
import { Book } from './book';


class Author extends Model {
  public id!: string;
  public name!: string;

  public getBooks!: BelongsToManyGetAssociationsMixin<Book>;
  public addBook!: BelongsToManyAddAssociationMixin<Book, number>;
  public hasBook!: BelongsToManyHasAssociationMixin<Book, number>;
  public countBooks!: BelongsToManyCountAssociationsMixin;
  public createBook!: BelongsToManyCreateAssociationMixin<Book>;

  public readonly books?: Book[];

  public static associate?: Function;

  public static associations: {
    books: Association<Author, Book>;
  };
}

export { Author };

export default (sequelize, DataTypes) => {
  Author.init({
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
    sequelize: sequelize
  });

  Author.associate = function (models) {
    Author.hasMany(models.AuthorBook);

    Author.belongsToMany(models.Book, {
      through: models.AuthorBook,
      as: "books",
      foreignKey: 'author_id',
    });
  };

  return Author;
};
