# Fifth Dimension CLI
This is a node CLI program that allows a user to search the Google Books API and add any resulting books to their reading list. The user's data will be persisted in a database. This program is built using test-driven development and Typescript.

## Getting Started
1. Make sure you have Node.js installed. Try running `node -v` in your Terminal. If you get an error or do not see your version, download Node from `here` and install it.
2. In Terminal go to the directory where you'd like this project to live and run:
```
  $ git clone https://github.com/k3ntako/5th-Dimension-CLI.git
```
3. Go into the newly created folder:
```
  $ cd 5th-Dimension-CLI
```
4. Install all the dependencies:
```
  $ npm i
```
5. Install PostgreSQL:
- Follow the [directions](https://www.postgresql.org/download/) for your operating system.
- For macOS, it is easier to download the [Postgres.app](https://postgresapp.com/) instead of following the instructions above.
6. Create database and run migrations:
```
  $ npx sequelize-cli db:create
  $ npm run migrate
```
7. Get a Google Developer API Key
  - Follow the instructions [here](https://developers.google.com/books/docs/v1/using#APIKey);
  - Create a `.env` in the root directory of your project by running
  ```
    $ touch .env
  ```
  - Set your key to `GOOGLE_BOOKS_API_KEY`. Your `.env` file should look like:
  ```
  GOOGLE_BOOKS_API_KEY=YOUR_API_KEY
  ```

8. Start the program:
```
  $ node .
```

### Using the program
All interactions will involve your keyboard. Often, your will be asked to choose one or more options from a list of options. Move up and down with your arrow keys. If you are able to choose more than one option, use the `Space button` to select the options and hit `Return`/`Enter` to submit. Just use `Return`/`Enter` if you are only able to select one option. If you are asked for a text input, type your input and hit `Return`/`Enter`.

If you want to change the font size, please look at the settings in your Terminal application.

### Adding features
- Run `npm run tsc` to compile the Typescript to vanilla JS. Open a new Terminal window to run tests and run the program.
- Open a new Terminal window to run tests and run the program.
- Edit `src` and do not touch `/dist` as they are the compiled version (plain Javascript) of `/src`.
- `npm run tsc` does not delete `dist` files deleted in `src`. To remove them, stop `npm run tsc` and them run the following in the root directory of this project:
```
  $ rm -rf dist
  $ npm run tsc
```

## Testing
Mocha, Chai, and Sinon were used to write the tests. The tests will run against the code in the `/src` folder, because the tests are also written in Typescript.

Run tests:
```
  $ npm test
```

## Built With
  - [Google Books API Family](https://developers.google.com/books/docs/overview) - provides the search results and the information about each book.
  - [Node.js](https://nodejs.org/) - offers Javascript outside of the browser including the command-line.
  - [Typescript](https://www.typescriptlang.org/) - is a superset of JavaScript that adds type definitions to variables.
  - [Mocha](https://mochajs.org/) - is a test runner.
  - [Chai](https://www.chaijs.com/) - is an assertion library.
  - [Sinon](https://sinonjs.org/) - offers spies, stubs, and fakes for testing.
  - [Sequelize](https://sequelize.org/v5/) - is an ORM for interacting with databases including PostgreSQL.
  - [Inquirer.js](https://www.npmjs.com/package/chalk) - offers more than text input as a method of interaction for the user.
  - [node-fetch](https://www.npmjs.com/package/node-fetch) - mimics `window.fetch` in the browser.
  - [Chalk](https://www.npmjs.com/package/chalk) - is used to style the output text.


## Potential Features
- Search by different fields (i.e., title, author, or etc.).
- Multiple user support, and password protect the data.
- Online back-up of user data.
- Importing/exporting data from/to CSV and/or JSON.
- Multiple reading lists.
- Customization options:
  - Font-color
  - Number of responses per search
  - Number of books per page while viewing reading list
  - Choose what fields (i.e., title, author, publisher, ISBN, and/or etc.) are displayed in a search

## Contributing
Currently, this project is not accepting any contributions, however, feel free to fork the project!