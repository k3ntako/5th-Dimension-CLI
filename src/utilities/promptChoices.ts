import emoji from 'node-emoji';

interface IPromptOption {
  name: string;
  value: string;
}

export default {
  search: (): IPromptOption => ({
    name: emoji.get('mag') + " Search for books!",
    value: "search",
  }),
  view_list: (listCount: number, bookPlurality: string): IPromptOption => ({
    name: emoji.get('books') + ` View your reading list (${listCount} book${bookPlurality})`,
    value: "view_list",
  }),
  remove_book: (): IPromptOption => ({
    name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
    value: "remove_book",
  }),
  add_book: (): IPromptOption => ({
    name: emoji.get('star') + " Add book(s) above to your reading list",
    value: "add_book",
  }),
  next: (): IPromptOption => ({
    name: emoji.get('arrow_forward') + "  Next page",
    value: "next",
  }),
  previous: (): IPromptOption => ({
    name: emoji.get('arrow_backward') + "  Previous page",
    value: "previous",
  }),
  exit: (): IPromptOption => ({
    name: emoji.get('closed_lock_with_key') + "  Exit",
    value: "exit",
  }),
}