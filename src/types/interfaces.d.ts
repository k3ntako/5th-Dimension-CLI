declare namespace FD {
  export interface BookParams {
    id?: string;
    authors: string[];
    title: string;
    publisher: string;
    isbn_10?: string;
    isbn_13?: string;
    issn: string;
    other_identifier?: string;
  }

  export interface IndustryIdentifier {
    type: string;
    identifier: string;
  }

  export interface DBBook {
    id: string;
    title: string;
    publisher?: string;
    authors: {
      id: string;
      name: string;
    }[];
    isbn_10?: string;
    isbn_13?: string;
    issn?: string;
    other_identifier?: string;
  }

  export interface GoogleBook {
    authors: string[];
    title: string;
    publisher: string;
    industryIdentifiers: [IndustryIdentifier];
  }

  export interface GoogleResponse {
    items: [{
      volumeInfo: GoogleBook;
    }];
  }

  export interface UserParams {
    email: string;
    first_name: string;
    last_name: string;
  }

  export interface IfdCLI {
    fakes: {
      consoleLogFake?: sinon.SinonSpy<any>;
    };
  }
}