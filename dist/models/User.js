"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __importDefault(require("../sequelize/models"));
const DEFAULT_USER = {
    first_name: "Default",
    last_name: "User",
    email: "default@example.com",
};
class User {
    constructor(params) { }
    static create(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email } = params;
            if (!email) {
                throw new Error('No email passed in');
            }
            const user = yield models_1.default.User.create({
                first_name: firstName,
                last_name: lastName,
                email: email,
            });
            return user;
        });
    }
    static loginAsDefault() {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            yield models_1.default.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const users = yield models_1.default.User.findAll({
                    where: { email: DEFAULT_USER.email },
                    transaction,
                    lock: true,
                });
                user = users[0];
                if (!user) {
                    user = yield models_1.default.User.create(DEFAULT_USER, {
                        transaction,
                        lock: true,
                    });
                }
            }));
            return user;
        });
    }
}
exports.default = User;
