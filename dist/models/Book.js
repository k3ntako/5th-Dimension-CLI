"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Book {
    constructor(params) {
        ["id", "title", "publisher", "authors", "isbn_10", "isbn_13", "issn", "other_identifier"].forEach(key => {
            this[key] = params[key] || null;
        });
    }
    static createFromDB(params) {
        const { id, title, publisher, isbn_10, isbn_13, issn, other_identifier } = params;
        // create params with empty "authors"
        const parsedParams = {
            id, title, publisher, isbn_10, isbn_13, issn, other_identifier,
            authors: [],
        };
        // convert authors into an array of strings (their names)
        parsedParams.authors = params.authors ? params.authors.map(author => author.name) : [];
        return new Book(parsedParams);
    }
    static createFromGoogle(params) {
        const { title, publisher, authors, industryIdentifiers } = params;
        if (!title || !title.trim())
            return null;
        let parsedParams = {
            title: title.trim(),
            publisher: publisher && publisher.trim(),
            authors: authors,
        };
        if (industryIdentifiers && industryIdentifiers.length) {
            parsedParams = this.addIdentifiers(parsedParams, industryIdentifiers);
        }
        return new Book(parsedParams);
    }
    static addIdentifiers(paramsWithoutIdentifiers, industryIdentifiers) {
        const params = Object.assign({}, paramsWithoutIdentifiers); // remove reference (aka no side effects)
        industryIdentifiers.forEach(identifierObj => {
            const identifier = identifierObj.identifier && identifierObj.identifier.trim();
            const type = identifierObj.type && identifierObj.type.trim().toLowerCase();
            // Skip if identifier or type is blank
            if (!identifier || !type)
                return;
            switch (type) {
                case "isbn_10":
                case "isbn_13":
                    // Remove any non-alphanumeric characters (especially space and hyphens)
                    // Last digit (check digit) can be an "X" to represent 10 (e.g., 097522980X)
                    params[type] = identifier.replace(/[^0-9a-z]/gi, '');
                    break;
                case "other":
                    params.other_identifier = identifier;
                    break;
                default:
                    params[type] = identifier;
                    break;
            }
        });
        return params;
    }
}
exports.default = Book;
