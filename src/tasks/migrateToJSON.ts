
require('dotenv').config();

import fs from 'fs';
import path from 'path';
import ReadingList from '../models/ReadingList';
import Loading from '../models/Loading';
import db from '../sequelize/models';
import { User as IUser } from '../sequelize/models/user';
import { Book as IBook } from '../sequelize/models/book';
import { DEFAULT_USER } from '../models/User';
import fetch from 'node-fetch';

const BASE_URL: string = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY: string = "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
const FIELDS: string = "&fields=items(id,volumeInfo(title,authors,publisher))";
const LIMIT_ONE: string = '&maxResults=1';

interface INewBook {
  title: string,
  authors: string[],
  publisher?: string,
  googleID?: string,
}

const dataFileDir: string = path.join(__dirname, '../data/data.json');

const exportDBToJSON = async () => {
  try{
    if (fs.existsSync(dataFileDir)) {
      throw new Error('JSON file already exists.')
    }

    const loading = new Loading();
    loading.start();

    // Find the default user
    const email: string = DEFAULT_USER.email;
    const users: IUser[] = await db.User.findAll({
      where: { email }
    });

    if (!users.length){
      throw new Error('No user with the ID found');
    }

    // Find all the books
    const user: IUser = users[0];
    const userBooks: IBook[] = await user.getBooks({
      attributes: [
        'id', 'title', 'publisher', 'isbn_10', 'isbn_13', 'issn', 'other_identifier'
      ],
      include: [{
        model: db.Author,
        as: 'authors',
      }, {
        model: db.UserBook,
        as: 'UserBook',
      }],
    });

    const failedBooks = [];
    const successfulBooks = [];

    for (let userBook of userBooks){
      const { title, publisher, authors, isbn_10, isbn_13, issn, other_identifier } = userBook.dataValues;
      const authorsArr = authors.map(author => author.name);
      const bookFromDB = {
        title,
        publisher,
        authors: authorsArr,
        issn,
        other_identifier,
      };


      if (!isbn_13 && !isbn_10) {
        failedBooks.push(bookFromDB);
        continue;
      }


      const url = BASE_URL + `?q=isbn:${isbn_13 || isbn_10}` + API_KEY + FIELDS + LIMIT_ONE;

      const response = await fetch(url);

      if (!response.ok){
        failedBooks.push(bookFromDB);
        continue;
      }

      const json = await response.json();


      if (!json.items[0].id) {
        failedBooks.push(bookFromDB);
        continue;
      }

      const volumeInfo = json.items[0].volumeInfo;

      successfulBooks.push({
        googleID: json.items[0].id,
        title: volumeInfo.title,
        authors: volumeInfo.authors,
        publisher: volumeInfo.publisher || null,
      });
    };

    await ReadingList.exportToJSON(successfulBooks);

    loading.stop();

    if (failedBooks.length) {
      console.log('Following books were not added: ', failedBooks);
    }

    process.exit();
  } catch (err){
    console.log(err.message);
  }
}

exportDBToJSON();