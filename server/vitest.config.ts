import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const envDir = path.join(serverRoot, "src");
const testEnv = loadEnv("test", envDir, "");

if (testEnv.TEST_DATABASE_URL && !testEnv.DATABASE_URL) {
  testEnv.DATABASE_URL = testEnv.TEST_DATABASE_URL;
}

export default defineConfig({
  root: serverRoot,
  envDir,
  test: {
    env: testEnv,
  },
});
