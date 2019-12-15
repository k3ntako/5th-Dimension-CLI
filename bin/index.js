// Makes fetch available globally
// fetchMock requires fetch to be available globally
global.fetch = require('node-fetch')

const start = require('../dist/index.js').default;

start();