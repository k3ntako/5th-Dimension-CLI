require('dotenv').config();
import fetch, { Response } from 'node-fetch';
import { IGoogleResponse } from '../utilities/interfaces';
import Book from './Book';

const BASE_URL: string = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY: string = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS: string = "&fields=items(volumeInfo(title,authors,publisher,industryIdentifiers))";
const LIMIT: string = '&maxResults=5';

export default class BookSearch{
  constructor(){}

  static async search(searchStr: string) {
    const regex: RegExp = /\s\s+/g; // remove multiple spaces in a row
    const parsedSearchStr = searchStr.trim().replace(regex, ' ');

    return await BookSearch.fetchBooks(parsedSearchStr);
  }

  static async fetchBooks(searchStr: string) {
    const searchURL: string = searchStr.split(" ").join("+");
    const url: string = BASE_URL + `?q=${searchURL}` + FIELDS + LIMIT + API_KEY;

    const response: Response = await fetch(url);
    if(!response.ok){
      throw new Error(`${response.status} - ${response.statusText}`)
    }

    const json: IGoogleResponse = await response.json();

    const books = [];
    json.items.forEach(bookInfo => {
      const book = Book.create(bookInfo.volumeInfo);

      if (book) books.push(book);
    });

    return books;
  }

}