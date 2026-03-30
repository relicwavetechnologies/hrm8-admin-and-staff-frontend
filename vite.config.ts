import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3000";

    return {
        plugins: [react()],
        server: {
            port: 8080,
            strictPort: true,
            proxy: {
                "/api": {
                    target: apiProxyTarget,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
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
    };
});
