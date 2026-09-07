import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const envDir = serverRoot; // matches setup.ts's own .env.test resolution
const testEnv = loadEnv("test", envDir, "");

if (testEnv.TEST_DATABASE_URL && !testEnv.DATABASE_URL) {
  testEnv.DATABASE_URL = testEnv.TEST_DATABASE_URL;
}

export default defineConfig({
  root: serverRoot,
  envDir,
  test: {
    env: testEnv,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/tests/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/tests/integration/**/*.test.ts"],
          globalSetup: ["src/tests/integration/globalSetup.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});