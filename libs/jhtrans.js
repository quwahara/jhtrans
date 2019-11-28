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

  const placeholderMaker = "@";

  function isPlaceholderKey(s) {
    return (s || "").indexOf(placeholderMaker) === 0;
  }

  const templateMaker = "#";

  function isTemplateKey(s) {
    return (s || "").indexOf(templateMaker) === 0;
  }

  const Context = function Context(parentContext) {
    this.parentContext = parentContext;
    this.depth = 0;
    this.pl = "";
    this.recursion = 0;
    this.index = 0;
  }

  Context.prototype.incRecursion = function () {
    this.recursion += 1;
  };

  Context.prototype.decRecursion = function () {
    this.recursion -= 1;
  };

  Context.prototype.resetIndex = function () {
    this.index = 0;
  };

  Context.prototype.incIndex = function () {
    this.index += 1;
  };

  Context.prototype.sink = function () {
    const deeper = new Context(this.parentContext);
    deeper.depth = this.depth + 1;
    deeper.pl = this.getPlKey();
    deeper.recursion = this.recursion;
    deeper.index = this.index;
    return deeper;
  }

  Context.prototype.getPlKey = function () {
    const indexStr = isNullOrUndefined(this.index) ? "" : "x" + this.index;
    const plh = this.pl + (this.pl ? "-" : "");
    const plKey = plh + this.depth + indexStr;
    return plKey;
  }

  const Jhtrans = function Jhtrans() {
    // Dictionary for templates
    this.templates = {};
    this.config = {
      PL_CLASS_PREFIX: "jh-",
      PUT_PL_CLASS: true,
      RECURSION_MAX: 1000,
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

    return this.translateElementNode(template, trMap);
  };

  Jhtrans.prototype.translateElementNode = function (elementNode, trMap) {

    if (!isElementNode(elementNode)) {
      throw Error("The elementNode was not ELEMENT_NODE.");
    }

    return this.acceptElementNode(elementNode, trMap, new Context(null));
  };

  Jhtrans.prototype.acceptElementNode = function (objectElementNode, trMap, ctx) {

    if (this.config.PUT_PL_CLASS) {
      objectElementNode.classList.add(this.config.PL_CLASS_PREFIX + ctx.getPlKey());
    }

    // We will walk down objectElementNode.childNodes.
    // Copying childNodes before walking down,
    // because childNodes length will change
    // if objectElementNode is appneded child/children.
    const cns = [];
    for (let i = 0; i < objectElementNode.childNodes.length; ++i) {
      cns.push(objectElementNode.childNodes.item(i));
    }

    const deeperCtx = ctx.sink();

    // Walking down childNodes
    for (deeperCtx.resetIndex(); deeperCtx.index < cns.length; deeperCtx.incIndex()) {
      const cn = cns[deeperCtx.index];

      if (isElementNode(cn)) {
        this.acceptElementNode(cn, trMap, deeperCtx);
        continue;
      }

      if (isTextNode(cn)) {
        this.acceptTextNode(cn, trMap, deeperCtx);
        continue;
      }

      throw Error("A child node was not ELEMENT_NODE nor TEXT_NODE.");
    }

    return objectElementNode;
  }

  Jhtrans.prototype.acceptTextNode = function (objectTextNode, trMap, ctx) {
    const text = (objectTextNode.textContent || "").trim();
    return this.replaceTextNode(objectTextNode, text, trMap, ctx);
  }

  Jhtrans.prototype.replaceTextNode = function (objectTextNode, objectValue, trMap, ctx) {

    if (isNullOrUndefined(objectTextNode)) {
      throw Error("The objectTextNode was null or undefined.");
    }

    if (!isTextNode(objectTextNode)) {
      throw Error("The pobjectTextNode was not TEXT_NODE.");
    }

    if (isNullOrUndefined(objectValue)) {
      throw Error("The objectValue was null or undefined.");
    }

    if (ctx.recursion > this.config.RECURSION_MAX) {
      throw Error("recursion count was over max.");
    }

    ctx.incRecursion();

    let result;
    if (isString(objectValue)) {
      result = this.replaceTextNodeByString(objectTextNode, objectValue, trMap, ctx);
    }
    else if (isElementNode(objectValue)) {
      const elm = objectValue;
      objectTextNode.parentNode.replaceChild(elm, objectTextNode);
      this.acceptElementNode(elm, trMap, ctx);
      result = elm;
    }
    else if (isTextNode(objectValue)) {
      const textNode = objectValue;
      result = this.acceptTextNode(textNode, text, trMap, ctx);
    }
    else if (isArray(objectValue)) {
      result = this.replaceTextNodeByArray(objectTextNode, objectValue, trMap, ctx);
    }
    else {
      result = objectTextNode;
    }

    ctx.decRecursion();

    return result;
  }

  Jhtrans.prototype.replaceTextNodeByString = function (objectTextNode, objectValue, trMap, ctx) {

    if (isTemplateKey(objectValue)) {
      return this.replaceTextNodeByTemplateKey(objectTextNode, objectValue, trMap, ctx);
    } else if (isPlaceholderKey(objectValue)) {
      return this.replaceTextNodeByPlaceholderKey(objectTextNode, objectValue, trMap, ctx);
    } else {
      return this.replaceTextNodeByRawString(objectTextNode, objectValue, trMap, ctx);
    }
  }

  Jhtrans.prototype.replaceTextNodeByTemplateKey = function (objectTextNode, objectValue, trMap, ctx) {

    const tmKey = objectValue.substring(templateMaker.length);
    const template = this.getTemplate(tmKey);

    if (!isNullOrUndefined(template)) {
      objectTextNode.parentNode.replaceChild(template, objectTextNode);
      this.acceptElementNode(template, trMap, ctx);
      return template;
    }

    return this.replaceTextNodeByRawString(objectTextNode, objectValue, trMap, ctx);
  }

  Jhtrans.prototype.replaceTextNodeByPlaceholderKey = function (objectTextNode, objectValue, trMap, ctx) {

    const plKey = ctx.getPlKey();
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
      return this.replaceTextNode(objectTextNode, trValue, trMap, ctx);
    }

    const rawString = this.config.USE_PL_AS_RAW_STRING ? plKey : objectValue;

    return this.replaceTextNodeByRawString(objectTextNode, rawString, trMap, ctx);
  }

  Jhtrans.prototype.replaceTextNodeByRawString = function (objectTextNode, rawString, trMap, ctx) {
    objectTextNode.textContent = rawString;
    return objectTextNode;
  }

  Jhtrans.prototype.replaceTextNodeByArray = function (objectTextNode, array, trMap, ctx) {

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
    const indexBuf = ctx.index;
    for (ctx.resetIndex(); ctx.index < len; ctx.incIndex()) {
      accepteds.push(this.replaceTextNode(textNodes[ctx.index], array[ctx.index], trMap, ctx));
    }
    ctx.index = indexBuf;

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