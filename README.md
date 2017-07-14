# realdom
A lightweight DOM & Event manipulation.

# Setup

- CDN

  - [realdom.js](https://rawgit.com/SaulDoesCode/realdom/master/dist/realdom.js)
  - [realdom.min.js](https://rawgit.com/SaulDoesCode/realdom/master/dist/realdom.min.js)
  - [realdom.min.map](https://rawgit.com/SaulDoesCode/realdom/master/dist/realdom.min.map)

- Also supports ES6 Module, CommonJS, AMD and UMD style.

### Usage

```
import {create, add} from 'realdom';

let div = create('DIV');
div.addClass('panel');

let span = add('SPAN', div);
span.html('Hello world');
// ...

```

### How does it work?

Here are several examples:

- [Material Design - Ripple effect](https://codepen.io/ndaidong/full/VbNPBa/)
- [Material Design - Floating input label](https://codepen.io/ndaidong/full/NjmYrj/)
- [Material Design - Animation effect - Grid render](https://codepen.io/ndaidong/full/WjqbjJ/)
- [Test CSS 3D transform](https://codepen.io/ndaidong/pen/JRmXvZ)


# APIs

### DOM

```
import {
  ready,
  create,
  add,
  get,
  query,
  queryAll
} from 'realdom';

let rows = queryAll('table tr');
rows.forEach((row) => {
  row.style.backgroundColor = 'red';
});

```

 - .query(String selectors)
 - .queryAll(String selectors)
 - .get(String ID)
 - .add(Element|String tag [, Element parent])
 - .create(Element dom)
 - .ready(Function callback)

Returned elements have several helpful methods as below:
 - .class(String|Object name, Boolean state)
 - .hasClass(String className)
 - .addClass(String className)
 - .removeClass(String className)
 - .toggleClass(String className)
 - .replaceClass(String classNameOld, String classNameNew)
 - .attr(Object|String attr, String val)
 - .setAttr(String name, String val),
 - .getAttr(String name),
 - .removeAttr(String name),
 - .toggleAttr(String name, Boolean state),
 - .css(Object|String style, String val)
 - .query(String selectors)
 - .queryAll(String selectors)
 - .html([String html])
 - .empty()
 - .destroy()


#### Event

```
import { Event } from 'realdom';
```

- .Event.on(String|Element s, String eventName, Function callback(event, target))
- .Event.once(String|Element s, String eventName, Function callback(event, target))
- .Event.emit(String|Element s, String eventName)
- .Event.stop(Event e)

Examples:

```
import {
  ready,
  add,
  all,
  Event
} from 'realdom';

ready(() => {

  // Add a new element to document.body
  let container = add('DIV');

  // then add a DIV element into container
  let div1 = add('DIV', container);

  // then add a class "sub-item" to child DIV
  div1.addClass('sub-item');

  // more a child DIV
  let div2 = add('DIV', container);

  // also add a class "sub-item"
  div2.addClass('sub-item');

  // now, we can extract list of elements by class name:
  let subItems = all('.sub-item');

  console.log(subItems);


  // create a button
  let btn = add('INPUT');

  // add some attributes
  btn.attr({
    type: 'button',
    id: 'btnLogin',
    value: 'Login'
  });

  // specify css style
  btn.css({
    color: 'red',
    fontSize: 15,
    backgroundColor: '#ff6',
    maxWidth: 500,
    'padding-top': '2px'
  });

  // set an event listener
  Event.on(btn, 'click', () => {
    alert('Hello! How it\'s going?');
  });

  // simulate a click event on there (it works as same as jQuery.trigger method)
  Event.emit(btn, new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  }));

  // or
  Event.emit(btn, 'custom-event');

});
```


# Test

```
git clone https://github.com/ndaidong/realdom.git
cd realdom
npm install
npm test
```



# License

The MIT License (MIT)
