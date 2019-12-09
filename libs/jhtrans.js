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

  function copyChildNodes(childNodes) {
    const copies = [];
    copies.length = childNodes.length;
    for (let i = 0; i < childNodes.length; ++i) {
      copies[i] = childNodes[i];
    }
    return copies;
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

  function isPlaceholderTextNode(node) {
    return isTextNode(node) && isPlaceholderKey(node.textContent.trim());
  }

  function findPlaceholder(elementNode) {

    const copies = copyChildNodes(elementNode.childNodes);

    for (let i = 0; i < copies.length; ++i) {
      if (isPlaceholderTextNode(copies[i])) {
        return copies[i];
      }
    }

    for (let i = 0; i < copies.length; ++i) {
      if (isElementNode(copies[i])) {
        const found = findPlaceholder(copies[i]);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }


  Jhtrans.prototype.translate = function (key, replacements) {

    let elementNode;

    if (isElementNode(key)) {
      elementNode = key;
    }
    else if (isString(key)) {
      if (!isTemplateKey(key)) {
        throw Error("Template key is required for the key.");
      }

      elementNode = this.getTemplate(key.substring(1));
      if (isNullOrUndefined(elementNode)) {
        throw Error("Template was not found for the key:'" + key.substring(1) + "'");
      }

      if (!isElementNode(elementNode)) {
        throw Error("Template for the key was not an element. key:'" + key.substring(1) + "'");
      }

    }
    else {
      throw Error("The key was unsupported type.");
    }

    const textNode = findPlaceholder(elementNode);
    if (!textNode) {
      return textNode;
    }

    if (isNullOrUndefined(replacements) || replacements.length === 0) {
      // textNode.parentNode.removeChild(textNode);
      return elementNode;
    }

    // Justify number of text node to be equivalent with the array length.
    const textNodes = [];
    for (let i = 1; i < replacements.length; ++i) {
      const createdTextNode = document.createTextNode("");
      textNode.parentNode.insertBefore(createdTextNode, textNode);
      textNodes.push(createdTextNode);
    }
    textNodes.push(textNode);

    let lastNode = textNode;
    for (let i = 0; i < replacements.length; ++i) {
      lastNode = this.processTextNodeBy2(textNodes[i], replacements[i]);
    }
    return elementNode;
  }

  Jhtrans.prototype.processTextNodeBy2 = function (textNode, replacement) {

    console.log("processTextNodeBy", { "textNode": textNode, "replacement": replacement });

    if (isString(replacement)) {
      return this.replaceString2(textNode, replacement);
    }
    else if (isObject(replacement)) {
      if (!replacement.hasOwnProperty("k")) {
        throw Error("'k' was not found for the replacement object.");
      }
      if (!replacement.hasOwnProperty("rs")) {
        throw Error("'rs' was not found for the replacement object.");
      }

      const translated = this.translate(replacement.k, replacement.rs);

      textNode.parentNode.replaceChild(translated, textNode);

      return translated;
    }
    else {
      throw Error("The replacement is unsupported.");
    }
  };

  Jhtrans.prototype.replaceString2 = function (textNode, string) {
    if (isTemplateKey(string)) {
      const templ = this.getTemplate(string.substring(1));
      if (!isNullOrUndefined(templ)) {
        textNode.parentNode.replaceChild(templ, textNode);
        return templ;
      }
    }
    textNode.textContent = string;
    return textNode;
  };




  Jhtrans.prototype.processNode = function (node, replacements) {

    let outNode;

    if (isNullOrUndefined(replacements) || replacements.length === 0) {
      return node;
    }
    else if (isElementNode(node)) {
      outNode = this.processElementNode(node, replacements);
    }
    else if (isTextNode(node)) {
      outNode = this.processTextNode(node, replacements);
    } else {
      outNode = node;
    }

    return outNode;
  };

  Jhtrans.prototype.processElementNode = function (elementNode, replacements) {

    const cns = copyChildNodes(elementNode.childNodes);

    console.log("processElementNode", { "elementNode": elementNode, "childNodes": cns, "replacements": replacements });

    for (let i = 0; i < cns.length; ++i) {
      this.processNode(cns[i], replacements);
    }

    return elementNode;
  };

  Jhtrans.prototype.processTextNode = function (textNode, replacements) {

    const text = textNode.textContent.trim();

    if (!isPlaceholderKey(text)) {
      return textNode;
    }

    const replacement = replacements.shift();

    return this.processTextNodeBy(textNode, replacement, replacements);
  };

  Jhtrans.prototype.processTextNodeBy = function (textNode, replacement, replacements) {

    console.log("processTextNodeBy", { "textNode": textNode, "replacement": replacement, "replacements": replacements });

    if (isString(replacement)) {
      return this.replaceString(textNode, replacement, replacements);
    }
    else if (isObject(replacement)) {
      if (!replacement.hasOwnProperty("k")) {
        throw Error("'k' was not found for the replacement object.");
      }
      if (!replacement.hasOwnProperty("rs")) {
        throw Error("'rs' was not found for the replacement object.");
      }

      const translated = this.translate(replacement.k, replacement.rs);

      textNode.parentNode.replaceChild(translated, textNode);

      return translated;
    }
    else if (isArray(replacement)) {
      // Justify number of text node to be equivalent with the array length.
      const textNodes = [];
      for (let i = 1; i < replacement.length; ++i) {
        const createdTextNode = document.createTextNode("");
        textNode.parentNode.insertBefore(createdTextNode, textNode);
        textNodes.push(createdTextNode);
      }
      textNodes.push(textNode);

      let lastNode = textNode;
      for (let i = 0; i < replacement.length; ++i) {
        if (isString(replacement[i])) {
          lastNode = this.processTextNodeBy(textNodes[i], replacement[i], replacements);
        }
        else if (isArray(replacement[i])) {
          lastNode = this.processTextNodeBy(textNodes[i], replacement[i][0], replacement[i][1]);
        }
      }
      return lastNode.parentNode.childNodes;
    }
    else {
      return textNode;
    }
  };

  Jhtrans.prototype.replaceString = function (textNode, string, replacements) {
    if (isTemplateKey(string)) {
      const templ = this.getTemplate(string.substring(1));
      if (!isNullOrUndefined(templ)) {
        textNode.parentNode.replaceChild(templ, textNode);
        return this.processNode(templ, replacements);
      }
    }
    textNode.textContent = string;
    return textNode;
  };

  return Jhtrans;
});