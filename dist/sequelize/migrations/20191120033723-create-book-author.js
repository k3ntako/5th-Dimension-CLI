'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('author_books', {
            author_id: {
                primaryKey: true,
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'authors',
                    key: 'id',
                },
                onDelete: 'cascade',
            },
            book_id: {
                primaryKey: true,
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'books',
                    key: 'id',
                },
                onDelete: 'cascade',
            },
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('author_books');
    }
};
