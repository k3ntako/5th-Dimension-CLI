import Book from '../../src/models/Book';
import { bornACrime, makeWayForDucklings, whereTheCrawdadsSing } from '../_setup/_mockBooks';

export const bornACrimeInfo = Book.create(bornACrime.items[0].volumeInfo);
export const makeWayForDucklingsInfo = Book.create(makeWayForDucklings.items[0].volumeInfo);
export const whereTheCrawdadsSingInfo = Book.create(whereTheCrawdadsSing.items[0].volumeInfo);
