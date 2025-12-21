import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    strictPort: true, // Prevents falling back to another port
  },
  plugins: [react()],
  // Always use the base path for both development and production
  base: '/Report-Generation-System/',  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});