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

    var Jhtrans = function Jhtrans() {
      // Dictionary for templates
      this.templates = {};
      this.config = {
        RECURSION_MAX: 1000
      };
    };

    Jhtrans.prototype.getTemplate = function (name) {

      if (this.templates.hasOwnProperty(name)) {
        return this.templates[name].cloneNode(true);
      }

      throw Error("template not found for: '" + name + "'");
    };

    Jhtrans.prototype.translate = function (name, map) {
      return this.translateElement(
        this.getTemplate(name),
        map
      );
    };

    Jhtrans.prototype.translateElement = function (elm, map, recursion) {

      map = map || {};
      recursion = recursion || 0;

      if (recursion > this.config.RECURSION_MAX) {
        throw Error("recursion was over max");
      }

      var cns = elm.childNodes;
      var cn;
      var i;
      var text;
      var name;
      var tmpl;
      var trans;
      for (i = 0; i < cns.length; ++i) {
        cn = cns.item(i);
        if (cn.nodeType === Node.ELEMENT_NODE) {
          this.translateElement(cn, map, recursion + 1);
        }
        else if (cn.nodeType === Node.TEXT_NODE) {
          name = null;
          text = (cn.textContent || "").trim();

          if (text.length >= 3 && text.indexOf("~@") === 0) {
            // replace by holder name with map
            if (!map.hasOwnProperty(text.substr(2))) {
              throw Error("map not found for: '" + text.substr(2) + "'");
            }
            name = map[text.substr(2)];
          }
          else if (text.length >= 3 && text.indexOf("~#") === 0) {
            // replace by template name
            name = text.substr(2);
          }

          if (name !== null) {
            tmpl = this.getTemplate(name);
            trans = this.translateElement(tmpl, map, recursion + 1);
            elm.replaceChild(trans, cn);
          }
        }
      }

      return elm;
    };

    Jhtrans.prototype.putTemplate = function (name, definition) {
      var template = this.definitionToElement(definition);
      this.templates[name] = template;
      return this;
    };

    Jhtrans.prototype.putTemplateAll = function (nameDefinitions) {
      for (var name in nameDefinitions) {
        if (!Object.prototype.hasOwnProperty.call(nameDefinitions, name)) {
          continue;
        }
        this.putTemplate(name, nameDefinitions[name]);
      }
      return this;
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