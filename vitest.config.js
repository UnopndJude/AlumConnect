import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // App Router 사용 시 필요한 alias
      app: resolve(__dirname, "./app"),
    },
  },
})
