'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Author extends sequelize_1.Model {
}
exports.Author = Author;
exports.default = (sequelize, DataTypes) => {
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
