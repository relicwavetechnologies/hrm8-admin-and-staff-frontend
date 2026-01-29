import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@/app": path.resolve(__dirname, "./src/app"),
            "@/modules": path.resolve(__dirname, "./src/modules"),
            "@/shared": path.resolve(__dirname, "./src/shared"),
            "@/pages": path.resolve(__dirname, "./src/pages"),
            "@/contexts": path.resolve(__dirname, "./src/contexts"),
        },
    },
});
