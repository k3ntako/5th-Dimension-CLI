'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_books', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      book_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'books',
          key: 'id',
        },
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_books');
  }
};