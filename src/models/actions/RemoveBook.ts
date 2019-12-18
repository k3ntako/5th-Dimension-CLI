// Third-party dependencies
import inquirer, { prompt } from 'inquirer';

// Local dependencies
import Book from '../Book';
import { User as IUser } from '../../sequelize/models/user';
import { NUMBERS } from '../../utilities/emoji';
import ReadingList from '../ReadingList';


export default class RemoveBookAction {
  constructor(){}

  static async start(books: Book[], user: IUser): Promise<Book[]>{
    const removeBookAction: RemoveBookAction = new RemoveBookAction();

    const promptChoices =  removeBookAction.preparePromptChoices(books);
    const { bookIndices } = await removeBookAction.promptBooksToRemove(promptChoices);

    return await removeBookAction.removeBooks(books, bookIndices, user);
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
}
