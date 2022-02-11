import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/background.js',
  output: {
    format: 'cjs',
    name: 'bkg',
    file: 'public/background.js'
  },
  plugins: [
    commonjs(),
    typescript({
      sourceMap: false,
      inlineSources: false
    }),
    terser()
  ]
};
