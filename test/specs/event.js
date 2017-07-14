var test = require('tape');
var sinon = require('sinon');

const isFunc = o => typeof o === 'function';

var es6RD = require('../../src/main');
var fullRD = require('../../dist/realdom');
var minRD = require('../../dist/realdom.min');

let keys = ['on', 'off', 'emit', 'stop'];

let checkEventMethods = (el, assert) => {
  keys.forEach(k => {
    assert.ok(isFunc(el[k]), `el.${k}() must be a function`);
  });
};

var checkEvents = doc => {
  test('Test doc.Event:', assert => {

    assert.comment('Test event listener on/off:');

    let fn = sinon.spy();
    let el = doc.add('DIV');
    let child = doc.add('DIV', el);

    const listener = doc.Event.on(el, 'custom', fn);
    doc.Event.emit(el, 'custom');
    assert.ok(fn.calledOnce, 'fn must be called once');

    doc.Event.emit(child, 'custom');
    assert.ok(fn.calledTwice, 'fn must be called twice');

    listener.off();
    doc.Event.emit(el, 'custom');
    assert.ok(!fn.calledThrice, 'fn must not be called thrice');

    assert.comment('Test event listener stop bubbling:');
    let fn2 = sinon.spy((e) => {
      doc.Event.stop(e);
    });
    let fn3 = sinon.spy();
    doc.Event.on(el, 'custom', fn3);
    doc.Event.on(child, 'custom', fn2);
    doc.Event.emit(child, 'custom');
    assert.ok(fn2.called, 'fn2 must be called');
    assert.ok(!fn3.called, 'fn3 must not be called');

    assert.comment('Test event listener locate:');
    let fn4 = sinon.spy((e, target) => {
      assert.equals(target, el, 'Element and event target must be the same');
    });
    doc.Event.on(el, 'custom', fn4);
    doc.Event.simulate(el, 'custom');

    checkEventMethods(doc.Event, assert);

    assert.end();
  });

};

[es6RD, fullRD, minRD].map(checkEvents);
