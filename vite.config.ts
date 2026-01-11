import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/lichsu2025/", // đổi đúng tên repo của bạn
});
