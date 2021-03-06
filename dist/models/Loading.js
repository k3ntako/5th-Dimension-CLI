"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Loading {
    constructor() {
        this.stream = process.stderr;
        this.interval = null;
    }
    start() {
        let i = 0;
        this.interval = setInterval(() => {
            let dots = ".";
            for (let num = 0; num < i; num++) {
                dots += ".";
            }
            this.stream.clearLine();
            this.stream.cursorTo(0);
            this.stream.write("Loading" + dots);
            i++;
            if (i > 2)
                i = 0;
        }, 300);
    }
    stop() {
        clearInterval(this.interval);
        this.stream.clearLine();
        this.stream.cursorTo(0);
    }
}
exports.default = Loading;
