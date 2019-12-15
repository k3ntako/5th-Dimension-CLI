// Declaring global variables
// https://stackoverflow.com/questions/41717006/node-js-global-variable-and-typescript

import  {IfdCLI} from './interfaces';
import { RequestInfo, RequestInit, Response } from 'node-fetch';

declare global {
  const fdCLI: IfdCLI
  function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>
}