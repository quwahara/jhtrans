define(function (require) {
  "use strict";

  // require Jhtrans
  var Jhtrans = require('../libs/jhtrans');

  // prepare an instance of Jhtrans
  const jht = new Jhtrans();

  // puts template to the instance
  // putTemplateAll draws one Object.
  // Object key represents a name of template.
  // Object value represents declaration of Element node.
  // It calls "Element declaration".
  jht.putTemplateAll({
    "row": ["div", { "class": "row" }, "@"],
    "col-4":
      // This Element declaration becomes: `<div class="col">@</div>`.
      // The items of Element declaration represents: 
      [
        "div",				// -- Tag name
        { "class": "col-4" },	// -- Attributes, you can put null or omit.
        "@"					// -- Contents, you can put String, null or omit.
      ],
    "two-spans": ["div", null,
      [						// -- Contents, you can put Array and 
        //    Element declaration in it.
        //    They become child element nodes.
        ["span", null, "@1"],
        ["span", null, "@2"]
      ]]
  });

  const translated = jht.translate({
    "#": "row", "@": [
      "col-4",
      {
        "#": "col-4", "@": [
          {
            "#": "two-spans",
            "@1": ["Hello"],
            "@2": [", World!"]
          }
        ]
      },
      "col-4"
    ]
  });

  document.querySelector(".mount").appendChild(translated);
});