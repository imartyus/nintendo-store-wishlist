import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/background.js',
  output: {
    format: 'cjs',
    name: 'bkg',
    file: 'public/background.js'
  },
  plugins: [
    resolve({
      browser: true,
      extensions: ['.mjs', '.js', '.json', '.ts']
    }),
    commonjs(),
    typescript({
      sourceMap: false,
      inlineSources: false,
      tsconfig: './tsconfig.json',
      include: ['src/**/*.ts', 'src/**/*.d.ts']
    }),
    terser()
  ]
}
