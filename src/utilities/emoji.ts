import emoji from 'node-emoji';

export const NUMBERS = [
  emoji.get('zero'), // never used, but index matches the number
  emoji.get('one'),
  emoji.get('two'),
  emoji.get('three'),
  emoji.get('four'),
  emoji.get('five'),
  emoji.get('six'),
  emoji.get('seven'),
  emoji.get('eight'),
  emoji.get('nine'),
  emoji.get('one') + " " + emoji.get('zero'),
];