import sinon from 'sinon';
import fetchMock from 'fetch-mock';

import { bornACrime } from './_mockBooks';

Object.assign(global, {
  fdCLI: {
    fakes: {},
  }
});

beforeEach((): void => {
  // Adds spy before each test
  // This prevents logging while running tests
  const consoleLogFake: sinon.SinonSpy<any> = sinon.fake();
  global.fdCLI.fakes.consoleLogFake = consoleLogFake;
  sinon.replace(console, 'log', consoleLogFake);

  const consoleWarnFake: sinon.SinonSpy<any> = sinon.fake();
  global.fdCLI.fakes.consoleWarnFake = consoleWarnFake;
  sinon.replace(console, 'warn', consoleWarnFake);

  const consoleErrorFake: sinon.SinonSpy<any> = sinon.fake();
  global.fdCLI.fakes.consoleErrorFake = consoleErrorFake;
  sinon.replace(console, 'error', consoleErrorFake);

  fetchMock.mock('begin:https://www.googleapis.com/books/v1/volumes?q=Born+a+Crime', {
    body: bornACrime,
    status: 200,
  });
});

afterEach((): void => {
  // Removes spies and fakes before each test
  sinon.restore();
  fetchMock.restore();
});