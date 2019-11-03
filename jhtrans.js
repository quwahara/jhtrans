(function (definition) {
  if (typeof exports === "object") {
    // CommonJS
    module.exports = definition();
  } else if (typeof define === "function" && define.amd) {
    // RequireJS
    define(definition);
  } else {
    // <script>
    Jhtrans = definition();
  }
})(function () {
  'use strict';
  return (function () {

    function isArray(v) {
      return Array.isArray(v);
    }

    function isInt(v) {
      return v === parseInt(v, 10);
    }

    function isObject(v) {
      return v && !Array.isArray(v) && (typeof v) === "object";
    }

    function isString(v) {
      return typeof v === "string";
    }

    var Jhtrans = function Jhtrans(templates) {
      // Dictionary for templates
      this.templates = {};
    };

    Jhtrans.prototype.getTemplate = function (name) {

      if (this.templates.hasOwnProperty(name)) {
        return this.templates[name];
      }

      throw Error("template not found for: '" + name + "'");
    };

    Jhtrans.prototype.putTemplate = function (name, definition) {
      var template = this.definitionToElement(definition);
      this.templates[name] = template;
      return template;
    };

    Jhtrans.prototype.definitionToElement = function (definition) {

      if (!isArray(definition)) {
        throw Error("definition argument requires an array");
      }

      if (definition.length < 1) {
        throw Error("definition array requires one item at least");
      }

      var tag = definition[0];
      if (typeof tag !== "string") {
        throw Error("First item in definition must be string");
      }

      if (tag.length === "") {
        throw Error("First item was empty string");
      }

      // definition[0] must be a tag name
      var elm = document.createElement(tag);

      // definition[1] must be object which represents attributes,
      // or null if it is not attributes
      if (definition.length >= 2 && isObject(definition[1])) {
        var object = definition[1];
        for (var key in object) {
          if (!Object.prototype.hasOwnProperty.call(object, key)) {
            continue;
          }
          elm.setAttribute(key, object[key]);
        }
      }

      // definition[1] must be object which represents attributes,
      // or null if it is not attributes
      if (definition.length >= 3) {
        var third = definition[2];
        if (isString(third)) {
          elm.textContent = third;
        }
        else if (isArray(third)) {
          var i;
          for (i = 0; i < third.length; ++i) {
            var child = this.definitionToElement(third[i]);
            elm.appendChild(child);
          }
        }
      }

      return elm;
    };

    return Jhtrans;
  })();

});