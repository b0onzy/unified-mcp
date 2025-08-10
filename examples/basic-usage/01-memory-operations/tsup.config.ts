import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/demo.ts',
    'src/cleanup.ts',
    'src/scenarios/task-tracking.ts',
    'src/scenarios/commit-history.ts',
    'src/scenarios/ai-conversations.ts'
  ],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
  external: [],
});