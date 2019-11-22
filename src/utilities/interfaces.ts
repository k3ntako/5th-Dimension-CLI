export interface IBook {
  authors: string[];
  title: string;
  publisher: string;
  industryIdentifiers: [{
    type: string;
    identifier: string;
  }]
}

export interface IBookWrapper {
  volumeInfo: IBook,
}

export interface IBookResponse {
  items: IBookWrapper[];
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}