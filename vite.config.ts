import { defineConfig, UserConfigExport } from 'vite';

export default function (): UserConfigExport {
  return defineConfig({
    resolve: {},
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
  });
}