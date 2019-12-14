# Jhtrans

Translate JavaScript data to HTML DOM object. Templating and translate declarations to HTML DOM object. 

## Usage

```javascript
define(function (require) {
  "use strict";

  // This usage shows preparing template and generating Element node.
  // This code assumes there is a HTML file that has a tag having `class="mount"` attribute.
  // The tag is a mount point for the generated Element node.

  // require Jhtrans
  var Jhtrans = require('../libs/jhtrans');

  // prepare an instance of Jhtrans
  const jht = new Jhtrans();

  // The function putTemplateAll puts templates to the instance.
  // Put templates are reused in translation.
  // 
  // The Object key represents a name of template.
  // The Object value represents declaration of Element node.
  // It calls "Element declaration".
  jht.putTemplateAll({
    // The "row" is template name.
    "row":
      // This Element declaration becomes: `<div class="row">@</div>`.
      [
        // The items of Element declaration represents: 
        "div",				        // -- Tag name
        { "class": "row" },  	// -- Attributes, you can put null or omit.
        "@"					          // -- Contents, you can put String, null or omit.
      ],
    "col-4": ["div", { "class": "col-4" }, "@"],
    "two-spans": ["div", null,
      // You can put Array to contents.
      [
        // The items are declaration.
        // They become child element nodes.
        ["span", null, "@1"],
        ["span", null, "@2"]
      ]]
  });

  // The function translate produces Element node by
  // using Translation declarations that is an argument.
  //
  // The value for the "#" is a template name.
  // The value is translated to Element node in templates
  // that is matching with the name.
  //
  // The value for the "@" and/or "@XXX" is a replacement name.
  // Element node can have "@" and/or "@XXX" in contents.
  // For instance, `<div class="row">@</div>`.
  // The function picks the "@" in the Element node.
  // Next, it searches in the declaration.
  // The declaration is like:`{"@": "Hello"}`.
  // Then "@" will be found and it replaces the "@" to "Hello".
  // The Element node becomes `<div class="row">Hello</div>`.
  //
  const translated = jht.translate(
    // Below is Translation declarations.
    // Translation declaration must have a key, "#".
    {
      // The value "row" is translated to an Element node because it is a template name.
      "#": "row",
      // The value for "@" will be replace with "@" in the "row" Element node content.
      "@":
        // A number of Element nodes are generated if the value for "@" was an Array.
        [
          // It translated as a template if the String was a template name.
          "col-4",
          // It is transated recursively if its type is Object.
          {
            "#": "col-4", "@": [
              {
                "#": "two-spans",
                // It translated as a literal string if the String was not a template name.
                "@1": "Hello",
                "@2": ", World!"
              }
            ]
          },
          "col-4"
        ]
    });

  /*
      Above declaration will be transated to like:
      ```
      <div class="row">
        <div class="col-4">@</div>
        <div class="col-4">
          <div><span>Hello</span><span>, World!</span></div>
        </div>
        <div class="col-4">@</div>
      </div>
      ```
  */

  // You can put the translated Elenment node where you want.
  document.querySelector(".mount").appendChild(translated);
});
```