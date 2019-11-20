export interface IBook {
  authors: string[];
  title: string;
  publisher: string;
}

export interface IBookWrapper {
  volumeInfo: IBook,
}

export interface IBookResponse {
  items: IBookWrapper[];
}