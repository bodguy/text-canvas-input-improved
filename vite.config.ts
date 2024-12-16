import { defineConfig, UserConfigExport } from 'vite'
import path from 'node:path'

export default function (): UserConfigExport {
    return defineConfig({
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '/src')
            }
        },
        base: './',
        build: {
            outDir: 'dist'
        },
        server: {
            port: 3000
        },
        plugins: [],
        clearScreen: false,
        envPrefix: ['VITE_']
    })
}
