// Third-party dependencies
import inquirer, { prompt } from 'inquirer';

// Local dependencies
import Book from '../Book';
import ReadingList from '../ReadingList';
import { NUMBERS } from '../../utilities/emoji';


export default class AddBookAction {
  constructor(){}

  static async start(googleResults: Book[], user): Promise<Book[]> {
    const addBookAction: AddBookAction = new AddBookAction();

    const promptChoices = addBookAction.preparePromptChoices(googleResults);
    const { bookIndices } = await addBookAction.promptBooksToAdd(promptChoices);

    const booksAdded: Book[] = await addBookAction.addBooksToDB(googleResults, bookIndices, user);

    return booksAdded;
  }

  private preparePromptChoices(googleResults): inquirer.ChoiceCollection {
    return googleResults.map((book, idx) => ({
      name: `${NUMBERS[idx + 1]}  ${book.title}`,
      value: idx,
    }));
  }

  private async promptBooksToAdd(promptChoices: inquirer.ChoiceCollection): Promise<{bookIndices: number[]}>{
    return await prompt({
      message: "Which book(s) would you like to add to your reading list?",
      name: "bookIndices",
      choices: promptChoices,
      type: "checkbox",
    });
  }

  private async addBooksToDB(googleResults, bookIndices, user): Promise<Book[]>{
    const booksToAdd = googleResults.filter((_, idx) => bookIndices.includes(idx));

    const promises = booksToAdd.map(book => ReadingList.addBook(book, user));
    await Promise.all(promises);

    return booksToAdd;
  }
}
