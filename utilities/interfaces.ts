export interface IBookInfo {
  authors: string[];
  title: string;
  publisher: string;
}

export interface IBook {
  volumeInfo: IBookInfo,
}

export interface IBookResponse {
  items: IBook[];
}