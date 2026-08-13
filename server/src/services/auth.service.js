"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.checkEmailExists = checkEmailExists;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function registerUser(name, email, password) {
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    return user;
}
async function checkEmailExists(email) {
    const userExist = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    return userExist ? true : false;
}
