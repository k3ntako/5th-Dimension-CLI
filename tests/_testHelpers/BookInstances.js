import Book from '../../src/models/Book';
import { bornACrime, makeWayForDucklings, whereTheCrawdadsSing } from '../_setup/_mockBooks';

export const bornACrimeInfo = Book.createFromGoogle(bornACrime.items[0].volumeInfo);
export const makeWayForDucklingsInfo = Book.createFromGoogle(makeWayForDucklings.items[0].volumeInfo);
export const whereTheCrawdadsSingInfo = Book.createFromGoogle(whereTheCrawdadsSing.items[0].volumeInfo);
