'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class AuthorBook extends sequelize_1.Model {
}
exports.AuthorBook = AuthorBook;
exports.default = (sequelize, DataTypes) => {
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
