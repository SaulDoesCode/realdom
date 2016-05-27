/**
 * vdom
 * @ndaidong
**/

'use strict';

((factory) => {
  var ENV = typeof module !== 'undefined' && module.exports ? 'node' : 'browser';
  if (ENV === 'node') {
    module.exports = factory();
  } else {
    var root = window || {};
    if (root.define && root.define.amd) {
      root.define([], factory);
    } else if (root.exports) {
      root.exports = factory();
    } else {
      let o = factory();
      root.DOM = o.DOM;
      root.vDOM = o.vDOM;
    }
  }
})(() => { // eslint-disable-line no-invalid-this

  var RD = {}, VD = {};

  var isUndefined = (v) => {
    return v === undefined; // eslint-disable-line no-undefined
  };
  var isString = (v) => {
    return typeof v === 'string';
  };
  var isElement = (v) => {
    return v instanceof HTMLElement;
  };
  var isFunction = (v) => {
    return v && {}.toString.call(v) === '[object Function]';
  };

  var hasProperty = (ob, k) => {
    if (!ob || !k) {
      return false;
    }
    let r = true;
    if (isUndefined(ob[k])) {
      r = k in ob;
    }
    return r;
  };

  var trim = (s, all) => {
    if (!isString(s)) {
      return '';
    }
    let x = s ? s.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '') : s || '';
    if (x && all) {
      return x.replace(/\r?\n|\r/g, ' ').replace(/\s\s+|\r/g, ' ');
    }
    return x;
  };

  var createId = (leng, prefix) => {
    let rn = () => {
      return Math.random().toString(36).slice(2);
    };
    let a = [];
    while (a.length < 10) {
      a.push(rn());
    }
    let r = a.join('');
    let t = r.length;
    let px = prefix || '';
    let ln = Math.max(leng || 32, px.length);
    let s = px;
    while (s.length < ln) {
      let k = Math.floor(Math.random() * t);
      s += r.charAt(k) || '';
    }
    return s;
  };


  // actual DOM
  var _get, _add, _create, _query, _queryAll;

  _get = (el) => {
    let p = (isString(el) ? document.getElementById(el) : el) || null;
    if (p && isElement(p)) {
      let pc = p.classList;
      p.hasClass = (c) => {
        c = trim(c, true);
        if (!c) {
          return false;
        }
        return pc.contains(c);
      };
      p.addClass = (c) => {
        c = trim(c, true);
        if (!c) {
          return false;
        }
        let a = c.split(' ');
        if (a.length > 1) {
          a.forEach((s) => {
            pc.add(s);
          });
        } else {
          pc.add(c);
        }
        return p;
      };
      p.removeClass = (c) => {
        c = trim(c, true);
        if (!c) {
          return false;
        }
        let a = c.split(' ');
        if (a.length > 1) {
          a.forEach((s) => {
            pc.remove(s);
          });
        } else {
          pc.remove(c);
        }
        return p;
      };
      p.toggleClass = (c) => {
        c = trim(c, true);
        if (!c) {
          return false;
        }
        let a = c.split(' ');
        if (a.length > 1) {
          a.forEach((s) => {
            pc.toggle(s);
          });
        } else {
          pc.toggle(c);
        }
        return p;
      };
      p.empty = () => {
        p.innerHTML = '';
        return p;
      };
      p.html = (s) => {
        if (isUndefined(s)) {
          return p.innerHTML;
        }
        p.innerHTML = s;
        return p;
      };
      p.destroy = () => {
        if (p.parentNode) {
          p.parentNode.removeChild(p);
        }
      };
    }
    return p;
  };

  _add = (tag, parent) => {
    let p = parent ? _get(parent) : document.body;
    let d = isElement(tag) ? tag : document.createElement(tag);
    p.appendChild(d);
    return _get(d);
  };

  _create = (tag) => {
    return _get(document.createElement(tag));
  };

  _query = (c) => {
    let el, tmp = document.querySelector(c);
    if (tmp) {
      el = _get(tmp);
    }
    return el;
  };

  _queryAll = (c) => {
    let els = [], tmp = document.querySelectorAll(c);
    if (tmp) {
      for (let i = 0; i < tmp.length; i++) {
        els.push(_get(tmp[i]));
      }
    }
    return els;
  };

  var onready = (fn) => {
    let rt = document.readyState;
    if (rt !== 'loading') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  RD.ready = onready;
  RD.one = _query;
  RD.all = _queryAll;
  RD.get = _get;
  RD.add = _add;
  RD.create = _create;

  RD.Event = (() => {

    let isGecko = ((ua) => {
      let n = ua.toLowerCase();
      return /gecko/i.test(n);
    })(navigator.userAgent);

    return {
      on: (element, event, callback) => {
        if (event === 'wheel') {
          event = isGecko ? 'DOMMouseScroll' : 'mousewheel';
        }
        let el = isString(element) ? _get(element) : element;
        let fn = () => {};
        let cb = callback || fn;

        if (el.addEventListener) {
          el.addEventListener(event, cb, false);
        } else if (el.attachEvent) {
          el.attachEvent('on' + event, cb);
        }
      },
      off: (element, event, callback) => {
        let el = isString(element) ? _get(element) : element;
        if (el.removeEventListener) {
          el.removeEventListener(event, callback, false);
        } else if (el.detachEvent) {
          el.detachEvent('on' + event, callback);
        }
      },
      simulate: (element, event) => {
        let evt, el = isString(element) ? _get(element) : element;
        if (document.createEventObject) {
          evt = document.createEventObject();
          el.fireEvent('on' + event, evt);
        } else {
          evt = document.createEvent('HTMLEvents');
          evt.initEvent(event, true, true);
          el.dispatchEvent(evt);
        }
      },
      stop: (e) => {
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        if (e.preventDefault) {
          e.preventDefault();
        }
        return false;
      },
      locate: (e) => {
        let evt = e || window.event;
        let targ = evt.target || evt.srcElement;
        if (targ && targ.nodeType === 3) {
          targ = targ.parentNode;
        }
        return _get(targ);
      }
    };
  })();

  class xMap {
    constructor() {
      this.data = {};
    }

    set(k, v) {
      let d = this.data;
      d[k] = v;
      return this;
    }

    get(k) {
      let d = this.data;
      return d[k] || null;
    }

    has(k) {
      let d = this.data;
      return hasProperty(d, k);
    }

    delete(k) {
      if (!this.has(k)) {
        return false;
      }
      let d = this.data;
      d[k] = null;
      delete d[k];
      return true;
    }
  }

  // virtual DOM
  var Actual = new xMap();
  var Virtual = new xMap();
  var Mirror = new xMap();

  var clone = (o) => {
    let s = JSON.stringify(o);
    return JSON.parse(s);
  };

  var saveMap = (id, vdom) => {
    Actual.set(id, null);
    Mirror.set(id, null);
    Virtual.set(id, vdom);
  };

  VD.get = (id, full) => {
    if (!id || !isString(id)) {
      return null;
    }
    if (full === true) {
      return {
        actual: Actual.get(id),
        virtual: Virtual.get(id),
        mirror: Mirror.get(id)
      };
    }
    return Virtual.get(id);
  };

  VD.remove = (id) => {
    Actual.delete(id);
    Virtual.delete(id);
    Mirror.delete(id);
  };

  var v2a = (node, parent) => {
    let a = parent ? _add(node.tagName, parent) : _create(node.tagName);
    a.setAttribute('tagId', node.tagId);

    let attrs = node.attributes;
    for (let k in attrs) {
      if (hasProperty(attrs, k)) {
        let v = attrs[k];
        if (k === 'text') {
          let t = document.createTextNode(v);
          a.appendChild(t);
        } else {
          a.setAttribute(k, v);
        }
      }
    }

    let events = node.events;
    for (let k in events) {
      if (hasProperty(events, k)) {
        let v = events[k];
        RD.Event.on(a, v.name, v.callback);
      }
    }

    let ls = node.nodeList;
    if (ls.length > 0) {
      for (let i = 0; i < ls.length; i++) {
        let n = ls[i];
        v2a(n, a);
      }
    }
  };

  var render = (nodes, target) => {
    for (let i = 0; i < nodes.length; i++) {
      let n = nodes[i];
      v2a(n, target);
    }
  };

  class vElement {

    constructor(tag, attrs, events, entries) {

      let id = createId(16);
      let el = _get(tag) || _create(tag);

      this.tagName = el.tagName;
      this.tagId = id;
      this.attributes = attrs || Object.create(null);

      let evs = [];
      for (let k in events) {
        if (hasProperty(events, k)) {
          let fn = events[k];
          if (isFunction(fn)) {
            evs.push({
              name: k,
              callback: fn
            });
          }
        }
      }

      this.events = evs;
      this.nodeList = entries || [];

      saveMap(id, this);

      return this;
    }

    setAttribute(k, v) {
      this.attributes[k] = v;
      return this;
    }
    hasAttribute(k) {
      let as = this.attributes;
      return hasProperty(as, k);
    }
    getAttribute(k) {
      return this.attributes[k] || null;
    }
    removeAttribute(k) {
      this.attributes[k] = null;
      delete this.attributes[k];
      return this;
    }

    setEvent(name, fn) {
      this.events.push({
        name: name,
        callback: fn
      });
      return this;
    }
    removeEvent(name) {
      this.events[name] = null;
      delete this.events[name];
      return this;
    }

    insert(tag, attrs, events, entries) {
      let n = new vElement(tag, attrs, events, entries);
      n.parentId = this.tagId;
      this.nodeList.unshift(n);
      return n;
    }

    append(tag, attrs, events, entries) {
      let n = new vElement(tag, attrs, events, entries);
      n.parentId = this.tagId;
      this.nodeList.push(n);
      return n;
    }

    find(tagId) {

      let item;
      let look = (node) => {
        let entries = node.nodeList || [];
        if (entries.length > 0 && !item) {
          for (let i = 0; i < entries.length; i++) {
            let j = entries[i];
            if (j.tagId === tagId) {
              item = j;
              break;
            } else {
              look(j);
            }
          }
        }
        return item;
      };

      return look(this) || null;
    }

    remove(tagId) {
      let removed = false;

      let rmTag = (node) => {
        let entries = node.nodeList || [];
        if (entries.length > 0) {
          for (let i = entries.length - 1; i >= 0; i--) {
            let j = entries[i];
            if (j.tagId === tagId) {
              entries.splice(i, 1);
              removed = true;
              node.nodeList = entries;
              break;
            } else {
              rmTag(j);
            }
          }
        }
      };

      rmTag(this);
      return removed;
    }

    render(target) {

      let tagId = this.tagId;

      let el = RD.one(`[tagId="${tagId}"]`);
      if (!el) {
        el = _create(this.tagName);
        el.setAttribute('tagId', tagId);
      }
      if (el) {
        let tag = _get(target);
        if (!tag) {
          tag = _get(el.parentNode);
        }
        render(this.nodeList, el);
        tag.empty();
        tag.appendChild(el);

        Actual.set(tagId, el);
        Mirror.set(tagId, clone(this));
      }
    }

  }

  VD.Element = vElement;

  VD.create = (el, attrs, events, entries) => {
    return new vElement(el, attrs, events, entries);
  };

  return {
    DOM: RD,
    vDOM: VD
  };
});
