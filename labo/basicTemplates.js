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

    "h1": ["h1", {}, "@"],
    "div": ["div", {}, "@"],
    "span": ["span", {}, "@"],
    "a": ["a", {}, "@"],
    "button@button": ["button", { "type": "button" }, "@"],
    "button@submit": ["button", { "type": "submit" }, "@"],
    "input@button": ["input", { "type": "button" }],
    "input@checkbox": ["input", { "type": "checkbox" }],
    "input@date": ["input", { "type": "date" }],
    "input@password": ["input", { "type": "password" }],
    "input@radio": ["input", { "type": "radio" }],
    "input@reset": ["input", { "type": "reset" }],
    "input@submit": ["input", { "type": "submit" }],
    "input@text": ["input", { "type": "text" }],
    "input@time": ["input", { "type": "time" }],
    "option": ["option", { "value": "@value" }, "@"],
    "select": ["select", {}, "@"],
    "table": ["table", {}, "@"],
    "textarea": ["textarea", {}, ""],
    "thead": ["thead", {}, "@"],
    "tbody": ["tbody", {}, "@"],
    "tr": ["tr", {}, "@"],
    "th": ["th", {}, "@"],
    "td": ["td", {}, "@"],

    // Utilities

    "center-max320": ["div", { "class": "center-max320 @class" }, [
      ["div", { "class": "@class-inner" }, "@"]
    ]],

    // Grid system, Row

    "row": ["div", { "class": "row" }, "@"],

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
        { "#": "input@checkbox", "name": "@name", "value": "@value" },
        { "#": "span", "@": "@caption" },
      ]
    },

    "radio-caption": {
      "#": "div", "@class": "radio-caption @class", "@": [
        { "#": "input@radio", "name": "@name", "value": "@value" },
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
