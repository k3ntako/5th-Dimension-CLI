'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex('users', ['email'], { unique: true, transaction: t });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeIndex('books', ['isbn_10', 'isbn_13'], { transaction: t });
    }
};
