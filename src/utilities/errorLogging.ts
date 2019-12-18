import chalk from 'chalk';
import emoji from 'node-emoji';

export const warn = (message: string): void => console.warn(`${emoji.get('warning')}  ${chalk.keyword('orange')(message)}`);
export const error = (message: string): void => console.error(`${emoji.get('warning')}  ${chalk.keyword('red')(message)}`);
