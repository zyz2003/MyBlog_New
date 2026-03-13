export default {
  preset: 'unbuild',
  entries: [
    { input: 'src/index', name: 'index' },
    { input: 'src/plugin-adapter', name: 'plugin-adapter' },
    { input: 'src/database', name: 'database' }
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  }
}
