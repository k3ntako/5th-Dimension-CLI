"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const node_emoji_1 = __importDefault(require("node-emoji"));
exports.warn = (message) => console.warn(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('orange')(message)}`);
exports.error = (message) => console.error(`${node_emoji_1.default.get('warning')}  ${chalk_1.default.keyword('red')(message)}`);
