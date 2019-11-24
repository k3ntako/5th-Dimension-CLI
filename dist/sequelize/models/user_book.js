'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class UserBook extends sequelize_1.Model {
}
exports.UserBook = UserBook;
exports.default = (sequelize, DataTypes) => {
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
