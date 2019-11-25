export interface IGoogleResponse {
  items: [{
    volumeInfo: {
      authors: string[];
      title: string;
      publisher: string;
      industryIdentifiers: [{
        type: string;
        identifier: string;
      }]
    }
  }];
}

export interface IfdCLI {
  fakes: {
    consoleLogFake?: sinon.SinonSpy<any>;
  };
}