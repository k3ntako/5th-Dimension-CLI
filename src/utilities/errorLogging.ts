import chalk from 'chalk';
import clear from 'clear';
import emoji from 'node-emoji';

export const warn = (message: string): void => {
  clear();
  console.warn(`${emoji.get('warning')}  ${chalk.keyword('orange')(message)}`)
};

export const error = (message: string): void => console.error(`${emoji.get('warning')}  ${chalk.keyword('red')(message)}`);
