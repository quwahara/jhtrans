# Jhtrans

Translate JavaScript array to HTML DOM object.  
Templating and replace the placeholder with a template. 

## Example 1, array to HTML DOM

`definitionToElement(array)` translates arrty to HTML DOM

```javascript
  var Jhtrans = require("jhtrans");
  var jht = new Jhtrans();

  var ex1 = jht.definitionToElement(["hr"]);
  // The ex1 represents:
  // <hr>

  var ex2 = jht.definitionToElement(["div", {
    "class": "aaa",
    "style": "display: inline-block; width: 30px; height: 1.5rem; background-color: blue;"
  }]);
  // The ex2 represents:
  // <div class="aaa" style="display: inline-block; width: 30px; height: 1.5rem; background-color: blue;"></div>

  var ex3 = jht.definitionToElement(["div", null, "Hello, world!"]);
  // The ex3 represents:
  // <div>Hello, world!</div>
```