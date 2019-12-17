// Declaring global variables
// https://stackoverflow.com/questions/41717006/node-js-global-variable-and-typescript

import { RequestInfo, RequestInit, Response } from 'node-fetch';

declare global {
  const fdCLI: FD.IfdCLI
  function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>
}