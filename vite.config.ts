import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const packageChunkMap: Array<[string, string]> = [
    ["@tiptap", "editor"],
    ["dompurify", "editor"],
    ["@fullcalendar", "calendar"],
    ["react-big-calendar", "calendar"],
    ["date-fns", "calendar"],
    ["date-fns-tz", "calendar"],
    ["recharts", "charts"],
    ["chart.js", "charts"],
    ["jspdf", "pdf-export"],
    ["jspdf-autotable", "pdf-export"],
    ["xlsx", "spreadsheets"],
    ["jszip", "spreadsheets"],
    ["pdfjs-dist", "pdf-viewer"],
    ["mapbox-gl", "maps"],
    ["world-countries", "maps"],
    ["@dnd-kit", "interaction"],
    ["framer-motion", "motion"],
    ["motion", "motion"],
    ["@radix-ui", "ui"],
    ["@tanstack/react-query", "react-core"],
    ["react-router-dom", "react-core"],
    ["zustand", "react-core"],
    ["openai", "ai"],
    ["@ai-sdk", "ai"],
];

function getPackageChunk(id: string) {
    if (!id.includes("node_modules")) return undefined;

    for (const [pkg, chunk] of packageChunkMap) {
        if (id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`)) {
            return chunk;
        }
    }

    if (
        id.includes("/node_modules/react/") ||
        id.includes("/node_modules/react-dom/") ||
        id.includes("\\node_modules\\react\\") ||
        id.includes("\\node_modules\\react-dom\\")
    ) {
        return "react-core";
    }

    return undefined;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3000";

    return {
        plugins: [react()],
        build: {
            chunkSizeWarningLimit: 900,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        return getPackageChunk(id);
                    },
                },
            },
        },
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
