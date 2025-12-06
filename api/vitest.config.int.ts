import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.integration.spec.ts"],
    exclude: ["node_modules", "dist", "test", ".git", ".github"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "test/",
        "**/*.spec.ts",
        "**/*.dto.ts",
        "**/*.schema.ts",
        "**/*.types.ts",
        "src/main.ts",
        "src/drizzle/migrate.ts",
      ],
      cleanOnRerun: false,
    },
    logHeapUsage: true,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
});
