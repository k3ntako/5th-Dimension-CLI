// Third-party dependencies
import chalk from 'chalk';

// Local dependencies
import { NUMBERS } from '../../utilities/emoji';
import logging from '../../utilities/logging';


export default class Action {
  constructor(){}

  protected logOneBook(book, idx?: number): void{
    const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx + 1]}  ` : "";
    const authors = book.authors && book.authors.join(", ");

    logging.logOneBook(
      emojiNum,
      chalk.bold(book.title),
      authors,
      book.publisher
    );
  }
}