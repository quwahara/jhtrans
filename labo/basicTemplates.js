(function (definition) {
  if (typeof exports === "object") {
    // CommonJS
    module.exports = definition();
  } else if (typeof define === "function" && define.amd) {
    // RequireJS
    define(definition);
  } else {
    // <script>
    basicTemplates = definition();
  }
})(function () {
  'use strict';

  return {

    // Basic tags

    "h1": ["h1", { "class": "@class" }, "@"],
    "div": ["div", { "class": "@class" }, "@"],
    "span": ["span", { "class": "@class" }, "@"],
    "a": ["a", { "class": "@class", "href": "@href", "target": "@target" }, "@"],
    "button@button": ["button", { "type": "button", "name": "@name" }, "@"],
    "input@checkbox": ["input", { "type": "checkbox", "name": "@name" }],
    "input@radio": ["input", { "type": "radio", "name": "@name", "value": "@value" }],
    "input@text": ["input", { "type": "text", "name": "@name" }],
    "input@password": ["input", { "type": "password" }],
    "option": ["option", { "value": "@value" }, "@"],
    "select": ["select", { "name": "@name" }, "@"],
    "table": ["table", { "class": "@class" }, "@"],
    "textarea": ["textarea", { "class": "@class" }, ""],
    "thead": ["thead", { "class": "@class" }, "@"],
    "tbody": ["tbody", { "class": "@class" }, "@"],
    "tr": ["tr", { "class": "@class" }, "@"],
    "th": ["th", { "class": "@class" }, "@"],
    "td": ["td", { "class": "@class" }, "@"],

    // Utilities

    "center-max320": ["div", { "class": "center-max320 @class" }, [
      ["div", { "class": "@class-inner" }, "@"]
    ]],

    // Grid system, Row

    "row": ["div", { "class": "row @class" }, "@"],

    // Grid system, Columns, 1 to 12

    "col-1": ["div", { "class": "col-1 @class" }, "@"],
    "col-2": ["div", { "class": "col-2 @class" }, "@"],
    "col-3": ["div", { "class": "col-3 @class" }, "@"],
    "col-4": ["div", { "class": "col-4 @class" }, "@"],
    "col-5": ["div", { "class": "col-5 @class" }, "@"],
    "col-6": ["div", { "class": "col-6 @class" }, "@"],
    "col-7": ["div", { "class": "col-7 @class" }, "@"],
    "col-8": ["div", { "class": "col-8 @class" }, "@"],
    "col-9": ["div", { "class": "col-9 @class" }, "@"],
    "col-10": ["div", { "class": "col-10 @class" }, "@"],
    "col-11": ["div", { "class": "col-11 @class" }, "@"],
    "col-12": ["div", { "class": "col-12 @class" }, "@"],

    // Grid system, Columns, 1 to 12

    "col-sm-1": ["div", { "class": "col-sm-1 @class" }, "@"],
    "col-sm-2": ["div", { "class": "col-sm-2 @class" }, "@"],
    "col-sm-3": ["div", { "class": "col-sm-3 @class" }, "@"],
    "col-sm-4": ["div", { "class": "col-sm-4 @class" }, "@"],
    "col-sm-5": ["div", { "class": "col-sm-5 @class" }, "@"],
    "col-sm-6": ["div", { "class": "col-sm-6 @class" }, "@"],
    "col-sm-7": ["div", { "class": "col-sm-7 @class" }, "@"],
    "col-sm-8": ["div", { "class": "col-sm-8 @class" }, "@"],
    "col-sm-9": ["div", { "class": "col-sm-9 @class" }, "@"],
    "col-sm-10": ["div", { "class": "col-sm-10 @class" }, "@"],
    "col-sm-11": ["div", { "class": "col-sm-11 @class" }, "@"],
    "col-sm-12": ["div", { "class": "col-sm-12 @class" }, "@"],

    // Combinations

    "pse14": ["div", { "class": "pse14" }, "@"],
    "row{col-3.col-6.col-3}": {
      "#": "row", "@": [
        { "#": "col-3", "@": "@1" },
        { "#": "col-6", "@": "@2" },
        { "#": "col-3", "@": "@3" }
      ]
    },

    "labeled": {
      "#": "pse14", "@": [
        ["label", null, "@label"],
        "@"
      ]
    },

    "checkbox-caption": {
      "#": "div", "@class": "checkbox-caption @class", "@": [
        { "#": "input@checkbox" },
        { "#": "span", "@": "@caption" },
      ]
    },

    "radio-caption": {
      "#": "div", "@class": "radio-caption @class", "@": [
        { "#": "input@radio" },
        { "#": "span", "@": "@caption" },
      ]
    },

    "table-hb": {
      "#": "table", "@": [
        { "#": "thead", "@": "@thead" },
        { "#": "tbody", "@": "@tbody" },
      ]
    },

  };
});
