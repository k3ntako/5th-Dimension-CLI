"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_emoji_1 = __importDefault(require("node-emoji"));
exports.NUMBERS = [
    node_emoji_1.default.get('zero'),
    node_emoji_1.default.get('one'),
    node_emoji_1.default.get('two'),
    node_emoji_1.default.get('three'),
    node_emoji_1.default.get('four'),
    node_emoji_1.default.get('five'),
    node_emoji_1.default.get('six'),
    node_emoji_1.default.get('seven'),
    node_emoji_1.default.get('eight'),
    node_emoji_1.default.get('nine'),
    node_emoji_1.default.get('one') + " " + node_emoji_1.default.get('zero'),
];
