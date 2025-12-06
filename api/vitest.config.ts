import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "test"],
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
    },
    logHeapUsage: true,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
});
