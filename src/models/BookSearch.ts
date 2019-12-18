/* global fetch */ // ESLint - fetch is available globally
import Book from './Book';

require('dotenv').config();

const doubleSpaceRegex = /\s\s+/g; // remove multiple spaces in a row

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS = "&fields=items(volumeInfo(title,authors,publisher,industryIdentifiers))";
const LIMIT = '&maxResults=5';

export default class BookSearch{
  constructor(){}

  static async search(searchStr: string): Promise<Book[]> {
    const url: string = BookSearch.generateURL(searchStr);
    const googleResultsRaw: FD.GoogleResponse = await BookSearch.fetchBooks(url);

    return this.parseGoogleResults(googleResultsRaw);
  }

  static generateURL = (searchStr): string => {
    const parsedSearchStr: string = searchStr.trim().replace(doubleSpaceRegex, ' ');

    // Format searchStr into what Google expects
    const searchURL: string = parsedSearchStr
      .split(" ")
      .map(search => encodeURIComponent(search))
      .join("+");

    return BASE_URL + `?q=${searchURL}` + FIELDS + LIMIT + API_KEY;
  }

  static async fetchBooks(url: string): Promise<FD.GoogleResponse> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`)
    }

    return await response.json();
  }

  static parseGoogleResults = (googleResultsRaw: FD.GoogleResponse): Book[] => {
    // no books returned
    if (!googleResultsRaw.items) {
      return [];
    }

    const books = [];
    googleResultsRaw.items.forEach(bookInfo => {
      const book: Book = Book.createFromGoogle(bookInfo.volumeInfo);

      if (book) books.push(book);
    });

    return books;
  }
}