const test = require('tape'),
  isObj = o => toString.call(o).indexOf('Object') !== -1,
  isFunc = o => typeof o === 'function';

require('jsdom-global')();

const es6RD = require('../../src/main'),
  fullRD = require('../../dist/realdom'),
  minRD = require('../../dist/realdom.min');

const checkAPIs = (doc) => {
  test('Test overview:', assert => {

    let keys = ['add', 'queryAll', 'create', 'get', 'query', 'ready'];

    const check = k => {
      assert.ok(isFunc(doc[k]), `doc.${k} must be function`);
    }

    keys.map(check);

    assert.ok(isObj(doc.Event), `doc.Event must be object`);
    assert.end();
  });
};

[es6RD, fullRD, minRD].map(checkAPIs);
