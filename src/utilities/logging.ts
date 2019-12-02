import emoji from 'node-emoji';
import chalk from 'chalk';

const warn = (message: string) => console.warn(`${emoji.get('warning')}  ${chalk.keyword('orange')(message)}`);
const error = (message: string) => console.error(`${emoji.get('warning')}  ${chalk.keyword('red')(message)}`);

export { warn, error };