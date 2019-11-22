'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('books', 'isbn_10', {
          type: Sequelize.STRING(50),
        }, { transaction: t }),
        queryInterface.addColumn('books', 'isbn_13', {
          type: Sequelize.STRING(50),
        }, { transaction: t }),
        queryInterface.addColumn('books', 'other_identifier', {
          type: Sequelize.STRING(255),
        }, { transaction: t }),
        queryInterface.addColumn('books', 'other_identifier_type', {
          type: Sequelize.STRING(255),
        }, { transaction: t }),
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('books', 'isbn_10', { transaction: t }),
        queryInterface.removeColumn('books', 'isbn_13', { transaction: t }),
        queryInterface.removeColumn('books', 'other_identifier', { transaction: t }),
        queryInterface.removeColumn('books', 'other_identifier_type', { transaction: t }),
      ])
    })
  }
};