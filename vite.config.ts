import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 9002,
        host: '0.0.0.0'
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['lucide-react', '@radix-ui/react-slot'],
                    charts: ['recharts'],
                    libs: ['date-fns', 'uuid', 'zod', 'clsx', 'tailwind-merge', 'i18next', 'react-i18next'],
                },
            },
        },
    },
})
