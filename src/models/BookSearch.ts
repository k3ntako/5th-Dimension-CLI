require('dotenv').config();
import { Response } from 'node-fetch';
import { IGoogleResponse } from '../types/interfaces';
import Book from './Book';

const doubleSpaceRegex: RegExp = /\s\s+/g; // remove multiple spaces in a row

const BASE_URL: string = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY: string = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS: string = "&fields=items(volumeInfo(title,authors,publisher,industryIdentifiers))";
const LIMIT: string = '&maxResults=5';

export default class BookSearch{
  constructor(){}

  static async search(searchStr: string) {
    const url: string = BookSearch.generateURL(searchStr);
    const googleResultsRaw: IGoogleResponse = await BookSearch.fetchBooks(url);

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

  static async fetchBooks(url: string): Promise<IGoogleResponse> {
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`)
    }

    return await response.json();
  }

  static parseGoogleResults = (googleResultsRaw: IGoogleResponse): Book[] => {
    // no books returned
    if (!googleResultsRaw.items) {
      return [];
    }

    const books = [];
    googleResultsRaw.items.forEach(bookInfo => {
      const book = Book.create(bookInfo.volumeInfo);

      if (book) books.push(book);
    });

    return books;
  }
}