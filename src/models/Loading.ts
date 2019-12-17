export default class Loading {
  stream: NodeJS.WritableStream;
  interval?: NodeJS.Timeout;
  constructor(){
    this.stream = process.stderr;
    this.interval = null;
  }

  start(): void {
    let i = 0;
    this.interval = setInterval(() => {
      let dots = "."
      for (let num = 0; num < i; num++) {
        dots += "."
      }

      this.stream.clearLine();
      this.stream.cursorTo(0);
      this.stream.write("Loading" + dots);

      i++;
      if (i > 2) i = 0;
    }, 300);
  }

  stop(): void {
    clearInterval(this.interval);
    this.stream.clearLine();
    this.stream.cursorTo(0);
  }
}