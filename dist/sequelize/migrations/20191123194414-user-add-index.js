'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex('users', ['email'], { unique: true });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeIndex('books', ['isbn_10', 'isbn_13'], {});
    }
};
