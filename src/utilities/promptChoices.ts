import emoji from 'node-emoji';

interface PromptOption {
  name: string;
  value: string;
}

export default {
  search: (): PromptOption => ({
    name: emoji.get('mag') + " Search for books!",
    value: "search",
  }),
  viewList: (listCount: number, bookPlurality: string): PromptOption => ({
    name: emoji.get('books') + ` View your reading list (${listCount} book${bookPlurality})`,
    value: "viewList",
  }),
  removeBook: (): PromptOption => ({
    name: emoji.get('no_entry_sign') + ` Remove book(s) from your reading list`,
    value: "removeBook",
  }),
  addBook: (): PromptOption => ({
    name: emoji.get('star') + " Add book(s) above to your reading list",
    value: "addBook",
  }),
  next: (): PromptOption => ({
    name: emoji.get('arrow_forward') + "  Next page",
    value: "next",
  }),
  previous: (): PromptOption => ({
    name: emoji.get('arrow_backward') + "  Previous page",
    value: "previous",
  }),
  exit: (): PromptOption => ({
    name: emoji.get('closed_lock_with_key') + "  Exit",
    value: "exit",
  }),
}