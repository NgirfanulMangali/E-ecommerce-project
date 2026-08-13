"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.runMigrations = runMigrations;
exports.clearDb = clearDb;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../../generated/prisma/client");
const child_process_1 = require("child_process");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, "../../.env.test") });
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const adapter = new adapter_pg_1.PrismaPg({ connectionString: `${testDatabaseUrl}` });
exports.prisma = new client_1.PrismaClient({ adapter });
function runMigrations() {
    (0, child_process_1.execSync)("npx prisma migrate deploy --config=src/prisma.config.ts", {
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    });
}
async function clearDb() {
    await exports.prisma.user.deleteMany();
}
