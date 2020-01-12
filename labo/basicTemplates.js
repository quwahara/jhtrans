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
    "a": ["a", { "class": "@class", "href": "@href" }, "@"],
    "button@button": ["button", { "type": "button", "name": "@name" }, "@"],
    "input@text": ["input", { "type": "text", "name": "@name" }],
    "input@password": ["input", { "type": "password" }],

    // Grid system, Row

    "row": ["div", { "class": "row" }, "@"],

    // Grid system, Columns, 1 to 12

    "col-1": ["div", { "class": "col-1" }, "@"],
    "col-2": ["div", { "class": "col-2" }, "@"],
    "col-3": ["div", { "class": "col-3" }, "@"],
    "col-4": ["div", { "class": "col-4" }, "@"],
    "col-5": ["div", { "class": "col-5" }, "@"],
    "col-6": ["div", { "class": "col-6" }, "@"],
    "col-7": ["div", { "class": "col-7" }, "@"],
    "col-8": ["div", { "class": "col-8" }, "@"],
    "col-9": ["div", { "class": "col-9" }, "@"],
    "col-10": ["div", { "class": "col-10" }, "@"],
    "col-11": ["div", { "class": "col-11" }, "@"],
    "col-12": ["div", { "class": "col-12" }, "@"],

    // Combinations

    "pad3": ["div", { "class": "pad3" }, "@"],
    "pad6": ["div", { "class": "pad6" }, "@"],
    "row{col-3.col-6.col-3}": {
      "#": "row", "@": [
        { "#": "col-3", "@": "@1" },
        { "#": "col-6", "@": "@2" },
        { "#": "col-3", "@": "@3" }
      ]
    },

    "labeled": {
      "#": "pad6", "@": [
        ["lable", null, "@label"],
        "@target"
      ]
    }

  };
});
