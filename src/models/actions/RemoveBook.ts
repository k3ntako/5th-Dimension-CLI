// Third-party dependencies
import clear from 'clear';
import chalk from 'chalk';
import inquirer, { prompt } from 'inquirer';

// Local dependencies
import Action from './Action';
import Book from '../Book';
import { User as IUser } from '../../sequelize/models/user';
import { NUMBERS } from '../../utilities/emoji';
import ReadingList from '../ReadingList';


export default class RemoveBookAction extends Action {
  constructor(){
    super();
  }

  static async start(books: Book[], user: IUser): Promise<{removeBookAction: RemoveBookAction}>{
    const removeBookAction: RemoveBookAction = new RemoveBookAction();

    const promptChoices =  removeBookAction.preparePromptChoices(books);
    const { bookIndices } = await removeBookAction.promptBooksToRemove(promptChoices);

    clear();

    const booksRemoved = await removeBookAction.removeBooks(books, bookIndices, user);
    await removeBookAction.logBooks(booksRemoved);

    return { removeBookAction };
  }

  private preparePromptChoices(books): inquirer.ChoiceCollection {
    return books.map((book, idx) => ({
      name: `${NUMBERS[idx + 1]}  ${book.title}`,
      value: idx,
    }));
  }

  private async promptBooksToRemove(promptChoices: inquirer.ChoiceCollection): Promise<{bookIndices: number[]}> {
    return await prompt({
      message: "Which book(s) would you like to remove from your reading list?",
      name: "bookIndices",
      choices: promptChoices,
      type: "checkbox",
    });
  }

  private async removeBooks(books: Book[], bookIndices: number[], user: IUser): Promise<Book[]>{
    const booksToRemove: Book[] = books.filter((_, idx) => bookIndices.includes(idx));
    const promises: Promise<number>[] = booksToRemove.map(book => ReadingList.removeBook(book.id, user.id));
    await Promise.all(promises);

    return booksToRemove;
  }

  private logBooks(booksToRemove: Book[]): void{
    const titles: string = booksToRemove.map(book => chalk.redBright(book.title)).join('\n');

    if (!booksToRemove.length) {
      return console.log('No books removed');
    }

    console.log(chalk.bold("Books removed:"))
    console.log(titles);
  }
}
