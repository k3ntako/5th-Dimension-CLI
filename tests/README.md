# Testing
## Dropping and Creating a new database
Prior to each test, `npm rum drop-test-db` is run to drop and create the test database. This was not done using the CLI commands (i.e., `npx sequelize-cli db:drop && npx sequelize-cli db:create`), because `sequelize-cli` does not seem to support checks for `EXISTS` and `NOT EXISTS` for PostgreSQL. As a result, `sequelize-cli` will throw an error if a user tries to drop a database that does not exist or create a database that already exists.

Due to these obstacles, `_setup/_drop_db.ts` is used to provide a clean database prior to testing.

### Status on this issue
This is an issue that has been commonly cited:
- [Issue #599](https://github.com/sequelize/cli/issues/599)
- [Issue #70](https://github.com/sequelize/cli/issues/70)
- [Issue #629](https://github.com/sequelize/cli/issues/629)

[Pull Request #700](https://github.com/sequelize/cli/pull/700/files/c2714da87f777dea98608944512115fc3c9d0aad) seems to have added checks for MySQL and MS SQL. However, line 89 in [`src/commands/database.js`](https://github.com/sequelize/cli/pull/700/files/c2714da87f777dea98608944512115fc3c9d0aad#diff-acd1796e36be1834a02f6a4298797adbR85-R112) suggests support was not extended to Postgres.