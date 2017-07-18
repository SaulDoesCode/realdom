/**
 * realdom created by Dong Nguyen
 * modified by @SaulDoesCode
**/

if (!Array.from) Array.from = c => [...c];

// I know it's ugly but it works
export const curry = (fn, arity = fn.length, next = (...memory) => (...more) => ((more.length + memory.length) >= arity ? fn: next)(...memory.concat(more))) => next();

const doc = document,
isInstance = curry((t, o) => o && o instanceof t),
istype = str => obj => typeof obj === str,
typeinc = str => obj => toString.call(obj).indexOf(str) !== -1,
isUndef = o => o === void 0,
isEl = typeinc('HTML'),
isObj = typeinc('Object'),
isFunc = istype('function'),
isStr = istype('string'),
isBool = istype('boolean'),
isPrimitive = s => isStr(s) || isBool(s) || !isNaN(s),
isArrlike = o => o && typeof o.length != 'undefined',
isEmpty = val => !val || isFunc(val) || !(isObj(val) ? Object.keys(val).length : isArrlike(val) && val.length),
isNode = isInstance(Node),
forEach = 'forEach',
each = (iterable, func, i = 0) => {
  if (!isEmpty(iterable)) {
    iterable[forEach] ? iterable[forEach](func) : isArrlike(iterable) && Array.prototype[forEach](iterable, func);
    if (isObj(iterable)) {
      const keys = Object.keys(iterable), max = keys.length;
      while (i < max) {
        func(iterable[keys[i]], keys[i], iterable);
        i++;
      }
    }
  }
  return iterable;
}

var attachBehaviors;


export const query = (selector, element = doc) => get((isStr(element) ? doc.querySelector(element) : element).querySelector(selector));

export const queryAll = (selector, element = doc) => Array.from((isStr(element) ? query(element) : element).querySelectorAll(selector)).map(el => get(el));

export const get = el => {
  if(isStr(el)) el = query(el);
  return el && !el.___BEHAVIORS_ATTACHED ? attachBehaviors(el) : el;
}

export const add = (tag, parent) => {
  parent = parent ? get(parent) : doc.body;
  const d = isEl(tag) ? tag : doc.createElement(tag);
  parent.appendChild(d);
  return get(d);
}

export const create = tag => get(doc.createElement(tag));

const EventManager = curry((state, target, type, handle, options = false, once) => {
  if (isStr(target)) target = query(target);
  if (!target.addEventListener) throw new Error('EventManager: bad event target');
  if (isNode(target) && !target.eventListeners) target.eventListeners = new Set;

  function handler(evt) {
    handle.call(target, evt, target);
    once && target.removeEventListener(type, handler);
  }

  const remove = () => {
    target.removeEventListener(type, handler);
    target.eventListeners && target.eventListeners.delete(manager);
  },
  add = mode => {
    once = !!mode;
    remove();
    target.addEventListener(type, handler, options);
    target.eventListeners && target.eventListeners.add(manager);
  },
  manager = {
    reseat(newTarget, removeOriginal) {
      removeOriginal && remove();
      return EventManager(state, newTarget, type, handle, options, once);
    },
    on: () => (add(), manager),
    once: () => (add(true), manager),
    off: () => (remove(), manager)
  }
  return manager[state]();
}, 4);

export const Event = {
  on: EventManager('on'),
  once: EventManager('once'),
  emit(target, event) {
    if (isStr(target)) target = query(target);
    if (target.addEventListener) target.dispatchEvent(isStr(event) ? new CustomEvent(event) : event);
  },
  stop(e) {
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    return false;
  }
};

attachBehaviors = p => {
  if (p && isEl(p)) {

    p.query = selector => query(selector, p);
    p.queryAll = selector => queryAll(selector, p);

    const pc = p.classList;

    p.hasClass = name => isStr(name) && pc.contains(name);

    p.class = (name, state = !p.hasClass(name)) => {
      state = state ? 'add' : 'remove';
      name.indesOf(' ') !== -1 ? each(name.split(' '), cls => pc[state](cls)) : pc[state](name);
      return p;
    };

    p.addClass = name => p.class (name, true);
    p.removeClass = name => p.class (name, true);
    p.toggleClass = name => p.class (name);

    p.replaceClass = (oldClass = '', newClass = '') => p.class (oldClass, false).class (newClass, true);

    p.hasAttr = attr => p.hasAttribute(attr);

    p.attr = (attr, val) => {
      if (p.attributes) isObj(attr) ? each(attr, (v, a) => p.setAttribute(a, v)) : isPrimitive(val) ? p.setAttribute(attr, val) : p.getAttribute(attr);
      return p;
    }

    p.getAttr = attr => p.getAttribute(attr);
    p.setAttr = (attr, val) => (p.attr(attr, val), p);
    p.removeAttr = attr => (p.removeAttribute(attr), p);

    p.toggleAttr = (attr, state = !p.hasAttr(attr)) => (p[state ? 'setAttribute' : 'removeAttr'](name, ''), p);

    p.css = (styles, prop) => (isObj(styles) ? each(styles, (val, key) => p.style[key] = val) : isStr(styles) && isStr(prop) && (p.style[styles] = prop), p);

    p.empty = () => (p.innerHTML = '', p);

    p.html = s => isUndef(s) ? p.innerHTML : (p.innerHTML = s, p);

    p.destroy = () => p.remove ? p.remove() : p.parentNode && p.parentNode.removeChild(p);

    p.on = EventManager('on', p);
    p.once = EventManager('once', p);
    p.emit = Event.emit.bind(null, p);

    p.___BEHAVIORS_ATTACHED = !0;
  }
  return p;
};

let LoadStack = [], isReady = false;
Event.once(window, 'DOMContentLoaded', () => {
  isReady = true;
  each(LoadStack, fn => fn());
  LoadStack = null;
});

export const ready = fn => isReady ? fn() : LoadStack.push(fn);
