// start testing

const {join} = require('path');

const dir = '../test/specs/';
[
  'builtTest',
  'apis',
  'dom',
  'event'
].forEach(script => require(join(dir, script)));
