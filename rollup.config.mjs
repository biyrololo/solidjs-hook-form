import { createRequire } from 'module';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const deps = Object.keys(pkg.dependencies || {});

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'esm'
    },
    external: (id) => deps.some(dep => id.startsWith(dep)),
    plugins: [
        nodeResolve({
            extensions: ['.js', '.ts']
        }),
        terser(),
        typescript()
    ]
}