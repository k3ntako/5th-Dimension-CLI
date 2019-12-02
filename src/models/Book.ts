export default class Book {
  id?: string;
  title: string;
  publisher?: string;
  authors: string[] |  any;
  isbn_10?: string;
  isbn_13?: string;
  issn?: string;
  other_identifier?: string;

  constructor(params) {
    ["id","title", "publisher", "authors"].forEach(key => {
      this[key] = params[key] || null;
    });
  }

  static create(params){
    const { id, title, publisher, authors } = params;
    if(!id || !id.trim()){
      console.warn('Book does not have an ID. Skippinng...');
      console.warn('Skipped: ' + JSON.stringify(params));
      return null;
    }

    let parsedParams = {
      id: id,
      title: title.trim(),
      publisher: publisher && publisher.trim(),
      authors: authors,
    }

    return new Book(parsedParams);
  }
}