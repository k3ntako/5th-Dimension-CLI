const { Client } = require('pg');

const client = new Client({
  user: null,
  host: "127.0.0.1",
  database: "postgres",
  password: null,
});

client.connect().then(() => {
  console.log("Starting test setup...");
  return client.query('DROP DATABASE IF EXISTS fifth_dimension_cli_test');
}).then(() => {
  return client.query('CREATE DATABASE fifth_dimension_cli_test');
}).then(() => {
  console.log("Finished creating clean test database");
  client.end();
});

