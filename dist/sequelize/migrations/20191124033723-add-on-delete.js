// 'use strict';
// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     return Promise.all([
//       queryInterface.addConstraint('author_books', ['author_id'], {
//         type: 'foreign key',
//         primaryKey: true,
//         references: {
//           table: 'authors',
//           field: 'id',
//         },
//         onDelete: 'cascade',
//       }),
//       queryInterface.addConstraint('author_books', ['book_id'], {
//         type: 'foreign key',
//         primaryKey: true,
//         references: {
//           table: 'books',
//           field: 'id',
//         },
//         onDelete: 'cascade',
//       }),
//       queryInterface.addConstraint('user_books', ['book_id'], {
//         type: 'foreign key',
//         primaryKey: true,
//         references: {
//           table: 'books',
//           field: 'id',
//         },
//         onDelete: 'cascade',
//       }),
//       queryInterface.addConstraint('user_books', ['user_id'], {
//         type: 'foreign key',
//         primaryKey: true,
//         references: {
//           table: 'users',
//           field: 'id',
//         },
//         onDelete: 'cascade',
//       }),
//     ]);
//   },
//   down: (queryInterface, Sequelize) => {
//     return queryInterface.dropTable('author_books');
//   }
// };
