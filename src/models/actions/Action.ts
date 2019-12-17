// Third-party dependencies
import chalk from 'chalk';

// Local dependencies
import { NUMBERS } from '../../utilities/emoji';


export default class Action {
  constructor(){}

  protected logOneBook(book, idx?: number): void{
    const emojiNum = Number.isInteger(idx) ? `${NUMBERS[idx + 1]}  ` : "";
    const authors = book.authors && book.authors.join(", ");

    console.log(emojiNum + chalk.bold(book.title));
    console.log("Author(s): " + (authors || "N/A"));
    console.log("Publisher: " + (book.publisher || "N/A") + "\n");
  }
}