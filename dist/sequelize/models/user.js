'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
}
exports.User = User;
exports.default = (sequelize, DataTypes) => {
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
    User.associate = function (models) {
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
