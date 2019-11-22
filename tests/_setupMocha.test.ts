import sinon from 'sinon';

Object.assign(global, {
  fdCLI: {
    fakes: {},
  }
})

beforeEach((): void => {
  // Adds spy before each test
  const consoleLogFake: sinon.SinonSpy<any> = sinon.fake();
  global.fdCLI.fakes.consoleLogFake = consoleLogFake;
  sinon.replace(console, 'log', consoleLogFake);
});

afterEach((): void => {
  // Removes spies and fakes before each test
  sinon.restore();
});