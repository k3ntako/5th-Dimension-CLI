require('dotenv').config();
import fetch from 'node-fetch';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS = "&fields=items(volumeInfo(title,authors,publisher))";
const LIMIT = '&maxResults=5';

export default class BookSearch{
  searchStr: string;
  results: [];
  constructor(){
    this.searchStr = "";
    this.results = [];
  }

  search(searchStr) {
    const regex = /\s\s+/g; // remove multiple spaces in a row
    this.searchStr = searchStr.trim().replace(regex, ' ');
  }

  async fetchBooks() {
    const searchURL = this.searchStr.split(" ").join("+");
    const url = BASE_URL + `?q=${searchURL}` + FIELDS + LIMIT + API_KEY;

    const response = await fetch(url);
    if(!response.ok){
      throw new Error(`${response.status} - ${response.statusText}`)
    }

    const json = await response.json();

    this.results = json.items;
  }

}