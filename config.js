const path = require('path');
const dataFolderDir = path.join(__dirname, './dist/data');
const dataFileName = 'data.json';
const dataFileDir = path.join(dataFolderDir, dataFileName);

const testDataFolderDir = path.join(__dirname, './tests/data');
const testDataFileName = 'test_data.json';
const testDataFileDir = path.join(testDataFolderDir, testDataFileName);

module.exports = {
  development: {
    dataFolderDir,
    dataFileName,
    dataFileDir,
  },
  test: {
    dataFolderDir: testDataFolderDir,
    dataFileName: testDataFileName,
    dataFileDir: testDataFileDir,
  },
  production: {
    dataFolderDir,
    dataFileName,
    dataFileDir,
  },
}