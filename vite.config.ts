import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: process.env.PAGES_BASE ?? '/proto3/',
  resolve: { alias: { '@kernel': r('./src/kernel/index.ts'), '@pack': r('./packs') } },
  build: { target: 'es2022', sourcemap: true },
  test: { include: ['tests/**/*.test.ts', 'packs/**/*.test.ts'], maxWorkers: 2 },
});
