import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
var packageChunkMap = [
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
function getPackageChunk(id) {
    if (!id.includes("node_modules"))
        return undefined;
    for (var _i = 0, packageChunkMap_1 = packageChunkMap; _i < packageChunkMap_1.length; _i++) {
        var _a = packageChunkMap_1[_i], pkg = _a[0], chunk = _a[1];
        if (id.includes("/node_modules/".concat(pkg, "/")) || id.includes("\\node_modules\\".concat(pkg, "\\"))) {
            return chunk;
        }
    }
    if (id.includes("/node_modules/react/") ||
        id.includes("/node_modules/react-dom/") ||
        id.includes("\\node_modules\\react\\") ||
        id.includes("\\node_modules\\react-dom\\")) {
        return "react-core";
    }
    return undefined;
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    var apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3000";
    return {
        plugins: [react()],
        build: {
            chunkSizeWarningLimit: 900,
            rollupOptions: {
                output: {
                    manualChunks: function (id) {
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
