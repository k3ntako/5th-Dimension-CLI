# Fifth Dimension CLI
This is a node CLI program that allows a user to search the Google Books API and add any resulting books to their reading list. The user's data will be persisted in a database.

This program is built using test-driven development and Typescript. Test-driven development helps ensure to ensure maximal test coverage. By writing a test prior to every feature, it ensures that no feature goes without a test (only feature missing a test is Loading.ts due to time constraints). Tests help prevent bugs and assure that the features are doing what we expect them to. Typescript makes code easier to read by providing the type of a variable to the reader. It also prevents bugs by pointing out areas where the variables are assigned unexpected types.

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
  $ npm migrate
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
All interactions will involve your keyboard. Often, your will be asked to choose one or more options from a list of options. Move up and down with your arrow keys. If you are able to choose more than one option, use the `Space button` to select the options and hit `Return`/`Enter` to submit. Just use `Return`/`Enter` if you are only able to select one option.If you are asked for a text input, type your input and hit `Return`/`Enter`.

If you want to change the font size, please look at the settings in your Terminal application.

### Adding features
Because the source code is written in Typescript, you need to compile the files to vanilla Javascript. Run `npm tsc` and it will compile your Typescript in the background. Open a new Terminal window to run tests and run the program. Edit the Typescript files in `/src` or `/tests`. Do not touch `/dist` as they are the compiled version (plain Javascript) of `/src`.

### PR with JSON instead of Postgres
As I example below, I have come to realize that Postgres was not necessary for this project. I have created a new branch (`json`) and opened a [PR](https://github.com/k3ntako/5th-Dimension-CLI/pull/1). This new branch utilizes a JSON file instead of Postgres, and it offers an `npm` command that will create a JSON file with the books in the Postgres database. For instructions on migrating, please read the *Migrating from Postgres* section in the ReadMe on the `json` branch. This was completed after the deadline, and thus it was not merged.

When I first developed this program, I had scalability in mind. I had hoped to allow multiple users and planned to add features that would require more complex queries. Querying a large JSON file is much slower, especially for complex queries such as finding all users with a certain book. Additionally, Postgres would help assure a better data integrity.

However, the scope of this project did not require multiple users, nor did it require complex queries. Postgres proved to be unnecessary and even problematic. For example, a user may not have Postgres already installed and may find it complicated or troublesome to install. JSON does not require any extra steps by the user, and Postgres was an unnecessary barrier to entry.

Looking back, I have learned to start projects simple and migrate to heavier dependencies as the project requires it. I was excited to start the project and I was slightly too ambitious. The features I was hoping to add were not all feasible in the time frame. Postgres would have made more sense for a website, because the user does not have to interact with the database.

## Testing
This program was built using test-driven development. Mocha, Chai, and Sinon were used to write the tests. The tests will run against the code in the `/src` folder, because the tests are also written in Typescript. The files in `/dist` are plain Javascript, that is what will be used when you run the program.

Run tests:
```
  $ npm test
```

### Issues
- Exiting the program occurs when `process.exit` is called. However, if that is called during a test, Mocha will be exited and the test would stop running. As a result, any session of this program will remain open until the end of the test. Not only is this a waste of resources, but this also results in unwanted `console.log`. Solving this issue would likely require use of the `child_process` module in Node.js. Given the time constraints, this was not implemented.

- A minor issue is that the `clear` module is called throughout the test, which scrolls the page to the top of the window. `clear` does not erase the  content, but instead hides it.

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