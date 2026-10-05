import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// Component tests (ISTQB test level: component). Playwright specs in e2e/ are
// a different test level and are run by Playwright, not Vitest.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ["src/**/*.test.ts"],
      environment: "node",
    },
  }),
);
