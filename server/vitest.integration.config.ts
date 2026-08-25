import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["src/tests/integration/**/*.test.ts"],
      pool: "forks",
      fileParallelism: false,
      globalSetup: ["./src/tests/integration/globalSetup.ts"],
    },
  }),
);
