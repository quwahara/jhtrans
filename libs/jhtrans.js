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
      PL_CLASS_PREFIX: "jh-",
      PUT_PL_CLASS: true,
      DEPTH_MAX: 1000,
      USE_PL_AS_RAW_STRING: true,
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

    return this.acceptElementNode(template, trMap, "", 0, 0);
  };

  Jhtrans.prototype.acceptElementNode = function (objectElementNode, trMap, pl, depth, index) {

    if (this.config.PUT_PL_CLASS) {
      objectElementNode.classList.add(this.config.PL_CLASS_PREFIX + this.compPlKey(pl, depth, index));
    }

    // We will walk down objectElementNode.childNodes.
    // Copying childNodes before walking down,
    // because childNodes length will change
    // if objectElementNode is appneded child/children.
    const cns = [];
    for (let i = 0; i < objectElementNode.childNodes.length; ++i) {
      cns.push(objectElementNode.childNodes.item(i));
    }

    const nextPl = this.compPlKey(pl, depth, index);

    ++depth;

    // Walking down childNodes
    for (let i = 0; i < cns.length; ++i) {
      const cn = cns[i];

      if (isElementNode(cn)) {
        this.acceptElementNode(cn, trMap, nextPl, depth, i);
        continue;
      }

      if (isTextNode(cn)) {
        this.acceptTextNode(cn, trMap, nextPl, depth, i);
        continue;
      }

      throw Error("A child node was not ELEMENT_NODE nor TEXT_NODE.");
    }

    return objectElementNode;
  }

  Jhtrans.prototype.acceptTextNode = function (objectTextNode, trMap, pl, depth, index) {
    const text = (objectTextNode.textContent || "").trim();
    return this.replaceTextNode(objectTextNode, text, trMap, pl, depth, index);
  }

  Jhtrans.prototype.replaceTextNode = function (objectTextNode, objectValue, trMap, pl, depth, index) {

    if (isNullOrUndefined(objectTextNode)) {
      throw Error("The objectTextNode was null or undefined.");
    }

    if (!isTextNode(objectTextNode)) {
      throw Error("The pobjectTextNode was not TEXT_NODE.");
    }

    if (isNullOrUndefined(objectValue)) {
      throw Error("The objectValue was null or undefined.");
    }

    if (depth > this.config.DEPTH_MAX) {
      throw Error("depth was over max.");
    }

    if (isString(objectValue)) {
      return this.replaceTextNodeByString(objectTextNode, objectValue, trMap, pl, depth, index);
    }

    if (isElementNode(objectValue)) {
      const elm = objectValue;
      objectTextNode.parentNode.replaceChild(elm, objectTextNode);
      this.acceptElementNode(elm, trMap, pl, depth, index);
      return elm;
    }

    if (isTextNode(objectValue)) {
      const textNode = objectValue;
      return this.acceptTextNode(textNode, text, trMap, pl, depth, index);
    }

    if (isArray(objectValue)) {
      return this.replaceTextNodeByArray(objectTextNode, objectValue, trMap, pl, depth, index);
    }

    return objectTextNode;
  }

  Jhtrans.prototype.replaceTextNodeByString = function (objectTextNode, objectValue, trMap, pl, depth, index) {

    if (isTemplateKey(objectValue)) {
      return this.replaceTextNodeByTemplateKey(objectTextNode, objectValue, trMap, pl, depth, index);
    } else if (isPlaceholderKey(objectValue)) {
      return this.replaceTextNodeByPlaceholderKey(objectTextNode, objectValue, trMap, pl, depth, index);
    } else {
      return this.replaceTextNodeByRawString(objectTextNode, objectValue, trMap, pl, depth, index);
    }
  }

  Jhtrans.prototype.replaceTextNodeByTemplateKey = function (objectTextNode, objectValue, trMap, pl, depth, index) {

    const tmKey = objectValue.substring(templateMaker.length);
    const template = this.getTemplate(tmKey);

    if (!isNullOrUndefined(template)) {
      objectTextNode.parentNode.replaceChild(template, objectTextNode);
      this.acceptElementNode(template, trMap, pl, depth, index);
      return template;
    }

    return this.replaceTextNodeByRawString(objectTextNode, objectValue, trMap, pl, depth, index);
  }

  Jhtrans.prototype.replaceTextNodeByPlaceholderKey = function (objectTextNode, objectValue, trMap, pl, depth, index) {

    const plKey = this.compPlKey(pl, depth, index);
    let hasTrValue = false;
    let trValue = null;

    if (trMap.hasOwnProperty(plKey)) {
      hasTrValue = true;
      trValue = trMap[plKey];
    } else {
      const phKey = objectValue.substring(placeholderMaker.length);
      if (phKey.length > 0 && trMap.hasOwnProperty(phKey)) {
        hasTrValue = true;
        trValue = trMap[phKey];
      }
    }

    if (hasTrValue) {
      return this.replaceTextNode(objectTextNode, trValue, trMap, pl, depth, index);
    }

    const rawString = this.config.USE_PL_AS_RAW_STRING ? plKey : objectValue;

    return this.replaceTextNodeByRawString(objectTextNode, rawString, trMap, pl, depth, index);
  }

  Jhtrans.prototype.compPlKey = function (pl, depth, index) {
    const indexStr = isNullOrUndefined(index) ? "" : "x" + index;
    const plh = pl + (pl ? "-" : "");
    const plKey = plh + depth + indexStr;
    return plKey;
  }

  Jhtrans.prototype.replaceTextNodeByRawString = function (objectTextNode, rawString, trMap, pl, depth, index) {
    objectTextNode.textContent = rawString;
    return objectTextNode;
  }

  Jhtrans.prototype.replaceTextNodeByArray = function (objectTextNode, array, trMap, pl, depth, index) {

    const len = array.length;
    const parent = objectTextNode.parentNode;
    if (len === 0) {
      parent.removeChild(objectTextNode);
      return null;
    }

    const textNodes = [];

    // Justify number of text node to be equivalent with the array length.
    for (let i = 1; i < len; ++i) {
      const textNode = document.createTextNode("");
      parent.insertBefore(textNode, objectTextNode);
      textNodes.push(textNode);
    }
    textNodes.push(objectTextNode);

    const accepteds = [];
    for (let i = 0; i < len; ++i) {
      accepteds.push(this.replaceTextNode(textNodes[i], array[i], trMap, pl, depth, i));
    }
    return accepteds;

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