require('dotenv').config();
import fetch, { Response } from 'node-fetch';
import { IBook, IBookResponse } from '../utilities/interfaces';

const BASE_URL: string = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY: string = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS: string = "&fields=items(volumeInfo(title,authors,publisher,industryIdentifiers))";
const LIMIT: string = '&maxResults=5';

export default class BookSearch{
  searchStr: string;
  results: IBook[];
  constructor(){
    this.searchStr = "";
    this.results = [];
  }

  search(searchStr: string) {
    const regex: RegExp = /\s\s+/g; // remove multiple spaces in a row
    this.searchStr = searchStr.trim().replace(regex, ' ');
  }

  async fetchBooks() {
    const searchURL: string = this.searchStr.split(" ").join("+");
    const url: string = BASE_URL + `?q=${searchURL}` + FIELDS + LIMIT + API_KEY;

    const response: Response = await fetch(url);
    if(!response.ok){
      throw new Error(`${response.status} - ${response.statusText}`)
    }

    const json: IBookResponse = await response.json();

    this.results = [];
    json.items.forEach(book => {
      const { title, publisher, authors, industryIdentifiers} = book.volumeInfo;
      if (title){
        this.results.push({ title, publisher, authors, industryIdentifiers });
      }
    });
  }

}