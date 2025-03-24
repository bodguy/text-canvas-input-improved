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
        setupFiles: ['./vitest.setup.ts'],
        environment: 'jsdom',
        deps: {
            optimizer: {
                web: {
                    include: ['vitest-canvas-mock']
                }
            }
        },
        poolOptions: {
            threads: {
                singleThread: true
            }
        },
        environmentOptions: {
            jsdom: {
                resources: 'usable'
            }
        },
        coverage: {
            provider: 'v8',
            reporter: ['json-summary', 'json'],
            reportOnFailure: false
        }
    }
})
