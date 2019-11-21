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

  function isArray(v) {
    return Array.isArray(v);
  }

  function isInt(v) {
    return v === parseInt(v, 10);
  }

  function isNullOrUndefined(v) {
    return v == null;
  }

  function isObject(v) {
    return v && !Array.isArray(v) && (typeof v) === "object";
  }

  function isString(v) {
    return typeof v === "string";
  }

  var placeholderMaker = "@";

  function isPlaceholderKey(s) {
    return (s || "").indexOf(placeholderMaker) === 0;
  }



  var templateMaker = "#";

  function isTemplateKey(s) {
    return (s || "").indexOf(templateMaker) === 0;
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

    return null;
  };

  Jhtrans.prototype.translate = function (tKey, trMap) {

    const template = this.getTemplate(tKey);
    if (isNullOrUndefined(templateMaker)) {
      throw Error("The template was not found for:'" + tKey + "'.");
    }

    return this.translateElement(template, trMap);
  };

  Jhtrans.prototype.translateElement = function (elm, trMap, recursion, index) {

    if (isNullOrUndefined(elm)) {
      throw Error("The elm was null or undefined.");
    }

    trMap = trMap || {};
    recursion = recursion || 0;
    const indexStr = isNullOrUndefined(index) ? "" : "-" + index;

    if (recursion > this.config.RECURSION_MAX) {
      throw Error("recursion count was over max");
    }

    // We will walk down elm.childNodes.
    // Copying childNodes before walking down,
    // because childNodes length will change
    // if elm is appneded child/children.
    const cns = [];
    for (let i = 0; i < elm.childNodes.length; ++i) {
      cns.push(elm.childNodes.item(i));
    }

    // Walking down childNodes
    for (let i = 0; i < cns.length; ++i) {

      const cn = cns[i];

      if (cn.nodeType === Node.ELEMENT_NODE) {
        this.translateElement(cn, trMap, recursion + 1);
        continue;
      }

      if (cn.nodeType === Node.TEXT_NODE) {

        const text = (cn.textContent || "").trim();

        // The text wasn't a place holder.
        if (!isPlaceholderKey(text)) {
          // Do nothing
          continue;
        }

        // The text was a placeholder

        // Placeholder location key
        const plKey = "@" + recursion + indexStr;
        // Placeholder key
        const phKey = text;
        let trValueFound = false;
        let trValue;

        if (trMap.hasOwnProperty(plKey)) {
          trValueFound = true;
          trValue = trMap[plKey];
        }

        if (trMap.hasOwnProperty(phKey)) {
          trValueFound = true;
          trValue = trMap[phKey];
        }

        // The placeholer was not found
        if (!trValueFound) {
          // Do nothing
          continue;
        }

        let isAr = false;
        let trValueArray;

        if (isArray(trValue)) {
          isAr = true;
          trValueArray = trValue;
        } else if (isString(trValue)) {
          trValueArray = [trValue];
        } else {
          throw Error("The value in translation map must be an array or a string: '" + text.substr(2) + "'");
        }

        elm.removeChild(cn);

        for (let j = 0; j < trValueArray.length; ++j) {

          const item = trValueArray[j];
          let toAppend;

          if (isString(item)) {
            if (isTemplateKey(item)) {
              const tKey = item;
              const template = this.getTemplate(tKey.substring(templateMaker.length));
              if (isNullOrUndefined(template)) {
                toAppend = document.createTextNode(item);
              } else {
                toAppend = this.translateElement(template, trMap, recursion + 1, isAr ? j : null);
              }
            } else {
              toAppend = document.createTextNode(item);
            }
            elm.appendChild(toAppend);
          }
        }
      }

    } // End of for

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
      } else if (isArray(third)) {
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
});