const esbuild = require('esbuild');
const watch = process.argv.includes('--watch');

const opts = {
  entryPoints: ['src/app.ts'],
  bundle: true,
  outfile: 'dist/app.js',
  format: 'iife',
  target: 'es2020',
  sourcemap: true,
  minify: !watch,
  loader: { '.json': 'json' },
};

if (watch) {
  esbuild.context(opts).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(opts).then(() => console.log('Build complete.'));
}
