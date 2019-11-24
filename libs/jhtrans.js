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

  function isElementNode(v) {
    return !isNullOrUndefined(v) && v.nodeType === Node.ELEMENT_NODE;
  }

  function isTextNode(v) {
    return !isNullOrUndefined(v) && v.nodeType === Node.TEXT_NODE;
  }

  function isInputFamily(v) {
    return !isNullOrUndefined(v) && (v.tagName === "INPUT" || v.tagName === "TEXTAREA");
  }

  function isTerminalTag(v) {
    return !isNullOrUndefined(v) && (v.tagName === "INPUT" || v.tagName === "TEXTAREA" || v.tagName === "HR");
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
      RECURSION_MAX: 1000,
      PUT_PL_CLASS: true,
      PL_CLASS_PREFIX: "pl-",
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

    if (isNullOrUndefined(template)) {
      throw Error("The template was not found for:'" + tKey + "'.");
    }

    if (!isElementNode(template)) {
      throw Error("The template was not ELEMENT_NODE.");
    }

    return this.acceptNode(template, trMap, "", 0, null);
  };

  Jhtrans.prototype.acceptNode = function (objectNode, trMap, pl, recursion, index) {

    if (isNullOrUndefined(objectNode)) {
      throw Error("The objectNode was null or undefined.");
    }

    if (isElementNode(objectNode)) {
      return this.acceptElementNode(objectNode, trMap, pl, recursion, index);
    }

    if (isTextNode(objectNode)) {
      return this.acceptTextNode(objectNode, trMap, pl, recursion, index);
    }

    throw Error("The objectNode was not ELEMENT_NODE nor TEXT_NODE.");
  }

  Jhtrans.prototype.acceptElementNode = function (objectElementNode, trMap, pl, recursion, index) {

    // We will walk down objectElementNode.childNodes.
    // Copying childNodes before walking down,
    // because childNodes length will change
    // if objectElementNode is appneded child/children.
    const cns = [];
    for (let i = 0; i < objectElementNode.childNodes.length; ++i) {
      cns.push(objectElementNode.childNodes.item(i));
    }

    // Walking down childNodes
    for (let i = 0; i < cns.length; ++i) {
      const cn = cns[i];
      this.acceptNode(cn, trMap, pl, recursion, index);
    }

    return objectElementNode;
  }

  Jhtrans.prototype.acceptTextNode = function (objectTextNode, trMap, pl, recursion, index) {
    const text = (objectTextNode.textContent || "").trim();
    return this.replaceTextNode(objectTextNode, text, trMap, pl, recursion, index);
  }

  Jhtrans.prototype.replaceTextNode = function (objectTextNode, objectValue, trMap, pl, recursion, index) {

    if (isNullOrUndefined(objectTextNode)) {
      throw Error("The objectTextNode was null or undefined.");
    }

    if (!isTextNode(objectTextNode)) {
      throw Error("The pobjectTextNode was not TEXT_NODE.");
    }

    if (isNullOrUndefined(objectValue)) {
      throw Error("The objectValue was null or undefined.");
    }

    if (recursion > this.config.RECURSION_MAX) {
      throw Error("Recursion count was over max.");
    }

    if (isString(objectValue)) {

      let rawStrig = objectValue;

      // Placeholder location key
      const indexStr = isNullOrUndefined(index) ? "" : "x" + index;
      const plh = pl + (pl ? "-" : "");
      const plKey = plh + recursion + indexStr;

      if (isTemplateKey(objectValue)) {
        const tmKey = objectValue.substring(templateMaker.length);
        const template = this.getTemplate(tmKey);
        if (this.config.PUT_PL_CLASS && isElementNode(template)) {
          template.classList.add(this.config.PL_CLASS_PREFIX + plKey);
        }
        if (!isNullOrUndefined(template)) {
          objectTextNode.parentNode.replaceChild(template, objectTextNode);
          this.acceptElementNode(template, trMap, plKey, recursion + 1, null);
          return template;
        }
        rawStrig = tmKey;

      } else if (isPlaceholderKey(objectValue)) {
        let hasTrValue = false;
        let trValue = null;

        if (trMap.hasOwnProperty(plKey)) {
          hasTrValue = true;
          trValue = trMap[plKey];
        } else {
          const phKey = objectValue.substring(placeholderMaker.length);
          if (trMap.hasOwnProperty(phKey)) {
            hasTrValue = true;
            trValue = trMap[phKey];
          }
        }

        if (hasTrValue) {
          return this.replaceTextNode(objectTextNode, trValue, trMap, plKey, recursion, index);
        }
      }

      objectTextNode.textContent = rawStrig;
      return objectTextNode;
    } // /isString


    if (isElementNode(objectValue)) {
      const elm = objectValue;
      objectTextNode.parentNode.replaceChild(elm, objectTextNode);
      this.acceptElementNode(elm, trMap, pl, recursion + 1, null);
      return elm;
    }

    if (isTextNode(objectValue)) {
      const textNode = objectValue;
      return this.acceptTextNode(textNode, text, trMap, pl, recursion, index);
    }

    if (isArray(objectValue)) {

      const array = objectValue;
      const len = array.length;

      if (len === 0) {
        objectTextNode.parentNode.removeChild(objectTextNode);
        return null;
      }

      const textNodes = [];
      for (let i = 1; i < len; ++i) {
        const textNode = document.createTextNode("");
        objectTextNode.parentNode.insertBefore(textNode, objectTextNode);
        textNodes.push(textNode);
      }
      textNodes.push(objectTextNode);

      const accepteds = [];
      for (let i = 0; i < len; ++i) {
        accepteds.push(this.replaceTextNode(textNodes[i], array[i], trMap, pl, recursion + 1, i));
      }
      return accepteds;
    }

    return objectTextNode;
  }

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
        if (isInputFamily(elm)) {
          elm.value = third;
        } else {
          elm.textContent = third;
        }
      } else if (isArray(third)) {
        if (!isTerminalTag(elm)) {
          for (let i = 0; i < third.length; ++i) {
            var child = this.definitionToElement(third[i]);
            elm.appendChild(child);
          }
        }
      }
    }

    return elm;
  };

  return Jhtrans;
});