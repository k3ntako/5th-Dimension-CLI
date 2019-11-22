// Declaring global variables
// https://stackoverflow.com/questions/41717006/node-js-global-variable-and-typescript
// fdCLI = fifth-dimension-cli to avoid naming collisions

interface IfdCLI {
  fakes: {
    consoleLogFake?: sinon.SinonSpy<any>;
  };
}

declare namespace NodeJS {
  interface Global {
    fdCLI: IfdCLI
  }
}