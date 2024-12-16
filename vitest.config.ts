import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/src')
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        deps: {
            optimizer: {
                web: {
                    include: ['vitest-canvas-mock']
                }
            }
        },
        coverage: {
            provider: 'v8',
            reporter: ['html']
        }
    }
})