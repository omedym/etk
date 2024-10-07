import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { peerDependencies, dependencies, devDependencies } from './package.json';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  build: {
    manifest: true,
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@omedym/react-edg',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), ...Object.keys(dependencies), ...Object.keys(devDependencies)],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled',
        },
      },
      plugins: [
        typescript({
          sourceMap: false,
          declaration: true,
          outDir: 'dist',
        }),
      ],
    },
  },
});
