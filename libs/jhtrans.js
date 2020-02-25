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

  function isFunction(fun) {
    return fun && {}.toString.call(fun) === '[object Function]';
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

  function isPrimitive(v) {
    if (v == null) return false;
    var t = typeof v;
    return t === "string" || t === "number" || t === "boolean";
  }

  function isString(v) {
    return typeof v === "string";
  }

  function isEmptyString(v) {
    return isNullOrUndefined(v) || (isString(v) && v === "");
  }

  function isAttr(v) {
    return !isNullOrUndefined(v) && v.nodeType === Node.ATTRIBUTE_NODE;
  }

  function isElementNode(v) {
    return !isNullOrUndefined(v) && v.nodeType === Node.ELEMENT_NODE;
  }

  function isTextNode(v) {
    return !isNullOrUndefined(v) && v.nodeType === Node.TEXT_NODE;
  }

  function isInputFamily(v) {
    return !isNullOrUndefined(v) && (v.tagName === "INPUT" || v.tagName === "TEXTAREA" || v.tagName === "SELECT");
  }

  function isTerminalTag(v) {
    return !isNullOrUndefined(v) && (v.tagName === "INPUT" || v.tagName === "TEXTAREA" || v.tagName === "HR");
  }

  var RID_MIN = 100000000000000;
  var RID_MAX = RID_MIN * 10 - 1;

  function rid() {
    return "_" + (Math.floor(Math.random() * (RID_MAX - RID_MIN + 1)) + RID_MIN).toString(10);
  }

  const placeholderMaker = "@";

  function isPlaceholderKey(s) {
    return s && s.indexOf(placeholderMaker) === 0;
  }

  const templateMaker = "#";

  function isTemplateKey(s) {
    return (s || "").indexOf(templateMaker) === 0;
  }

  function removeChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function copyChildNodes(childNodes) {
    const copies = [];
    copies.length = childNodes.length;
    for (let i = 0; i < childNodes.length; ++i) {
      copies[i] = childNodes[i];
    }
    return copies;
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

    this._oven = document.createElement("div");

    // Global replacement dictionary
    this.globalReplacements = {};
  };

  Jhtrans.prototype.getTemplate = function (name) {

    if (this.templates.hasOwnProperty(name)) {
      return this.templates[name].cloneNode(true);
    }

    return null;
  };

  Jhtrans.prototype.putTemplateAll = function (nameDeclarations) {
    for (var name in nameDeclarations) {
      this.putTemplate(name, nameDeclarations[name]);
    }
    return this;
  };

  Jhtrans.prototype.putTemplate = function (name, declaration) {

    if (isArray(declaration)) {
      var template = this.fromArray(declaration);
      this.templates[name] = template;
      return this;
    }
    else if (isElementNode(declaration)) {
      this.templates[name] = declaration;
      return this;
    }
    else if (isObject(declaration)) {
      this.templates[name] = this.translate(declaration);
      return this;
    }

    throw Error("The declaration was unsupported type.");
  };


  Jhtrans.prototype.fromArray = function (declaration) {
    if (!isArray(declaration)) {
      throw Error("declaration argument requires an array");
    }

    if (declaration.length < 1) {
      throw Error("declaration array requires one item at least");
    }

    var tag = declaration[0];
    if (typeof tag !== "string") {
      throw Error("First item in declaration must be string");
    }

    if (tag === "") {
      throw Error("First item was empty string");
    }

    // declaration[0] must be a tag name
    var elm = document.createElement(tag);

    // declaration[1] must be object which represents attributes,
    // or null if it is not attributes
    if (declaration.length >= 2 && isObject(declaration[1])) {
      var object = declaration[1];
      for (var key in object) {
        if (!Object.prototype.hasOwnProperty.call(object, key)) {
          continue;
        }
        elm.setAttribute(key, object[key]);
      }
    }

    // declaration[1] must be object which represents attributes,
    // or null if it is not attributes
    if (declaration.length >= 3) {
      var third = declaration[2];
      if (isString(third)) {
        if (isInputFamily(elm)) {
          elm.value = third;
        } else {
          elm.textContent = third;
        }
      } else if (isArray(third)) {
        if (!isTerminalTag(elm)) {
          for (let i = 0; i < third.length; ++i) {
            var child = this.fromArray(third[i]);
            elm.appendChild(child);
          }
        }
      }
    }

    return elm;
  }

  Jhtrans.prototype.fromHtml = function (html) {
    if (typeof html !== "string") {
      throw Error("The html must be string");
    }

    this._oven.innerHTML = html;

    const child = this._oven.firstElementChild;
    if (child) {
      const removedChild = this._oven.removeChild(child);
      removeChildren(this._oven);
      return removedChild;
    } else {
      return null;
    }
  }

  Jhtrans.prototype.endsWithPred = function (key) {
    return (function (key) {
      return function (target) {
        if (!isString(target)) { return false; }
        const index = target.indexOf(key);
        return index >= 0 && index === (target.length - key.length);
      };
    })(key);
  };

  Jhtrans.prototype.csvContainsPred = function (key) {
    return (function (key) {
      return function (target) {
        if (!isString(target)) { return false; }
        return target.split(/\s*,\s*/g).indexOf(key) >= 0;
      };
    })(key);
  };

  function isPlaceholderTextNode(node) {
    return isTextNode(node) && isPlaceholderKey(node.textContent);
  }

  function splitForPlaceholder(str) {
    const rgx = /@[\w\-]*/g;
    const dump = [];
    let foundIndex = 0;
    let results;
    while ((results = rgx.exec(str)) !== null) {
      if (results.index > foundIndex) {
        dump.push(str.substring(foundIndex, results.index));
      }
      foundIndex = rgx.lastIndex;
      dump.push(results[0]);
    }
    if (foundIndex < str.length) {
      dump.push(str.substr(foundIndex, str.length));
    }
    return dump;
  }

  function collectPlaceholder(elementNode, outCollections) {

    const copies = copyChildNodes(elementNode.childNodes);

    for (let i = 0; i < copies.length; ++i) {
      const copy = copies[i];
      if (isTextNode(copy) && isString(copy.textContent)) {
        let splits = splitForPlaceholder(copy.textContent);
        outCollections.push({
          owner: copy,
          splits: splits
        });
      }

    }

    for (let i = 0; i < copies.length; ++i) {
      if (isElementNode(copies[i])) {
        collectPlaceholder(copies[i], outCollections);
      }
    }

    const attrs = elementNode.attributes;
    for (let i = 0; i < attrs.length; ++i) {
      if (isString(attrs[i].value)) {
        let splits = splitForPlaceholder(attrs[i].value);
        outCollections.push({
          owner: attrs[i],
          splits: splits
        });
      }

    }

    return outCollections;
  }

  Jhtrans.prototype.setGlobalReplacement = function (key, value) {
    this.globalReplacements[key] = value;
    return this;
  }

  Jhtrans.prototype.translate = function (desc) {

    if (!desc.hasOwnProperty("#")) {
      throw Error("'#' was not found for the desc object.");
    }

    const key = desc["#"];

    let elementNode;

    if (isElementNode(key)) {
      elementNode = key;
    }
    else if (isString(key)) {
      elementNode = this.getTemplate(key);
      if (isNullOrUndefined(elementNode)) {
        throw Error("Template was not found for the key:'" + key + "'");
      }

      if (!isElementNode(elementNode)) {
        throw Error("Template for the key was not an element. key:'" + key + "'");
      }

    }
    else {
      throw Error("The key was unsupported type.");
    }

    const collections = collectPlaceholder(elementNode, []);

    for (let i = 0; i < collections.length; ++i) {
      const collection = collections[i];
      if (isObject(collection)) {

        if (isTextNode(collection.owner)) {
          const textNode = collection.owner;
          const splits = collection.splits;
          const buff = [];

          for (let j = 0; j < splits.length; ++j) {
            let found = false;
            const split = splits[j];
            if (isPlaceholderKey(split)) {
              const placeholder = split;
              if (desc.hasOwnProperty(placeholder)) {
                const replacements = desc[placeholder];
                let replacements2;
                if (!isArray(replacements)) {
                  replacements2 = [replacements];
                } else {
                  replacements2 = replacements;
                }

                if (!isNullOrUndefined(replacements2) && replacements2.length > 0) {
                  found = true;
                  // Justify number of text node to be equivalent with the array length.
                  for (let k = 0; k < replacements2.length; ++k) {
                    buff.push(replacements2[k]);
                  }
                }
              }
            }
            if (!found) {
              buff.push(split);
            }
          }

          for (let j = 0; j < (buff.length - 1); ++j) {
            const createdTextNode = document.createTextNode("");
            textNode.parentNode.insertBefore(createdTextNode, textNode);
            this.processReplacement(createdTextNode, buff[j]);
          }

          if (buff.length >= 1) {
            this.processReplacement(textNode, buff[buff.length - 1]);
          }

        }
        else if (isAttr(collection.owner)) {
          const attr = collection.owner;
          const splits = collection.splits;
          let value = "";
          for (let j = 0; j < splits.length; ++j) {
            let found = false;
            const split = splits[j];
            if (isPlaceholderKey(split)) {
              const placeholder = split;
              let replacement = null;
              if (desc.hasOwnProperty(placeholder)) {
                replacement = desc[placeholder];
              }
              else if (this.globalReplacements.hasOwnProperty(placeholder)) {
                replacement = this.globalReplacements[placeholder];
              }
              if (isString(replacement)) {
                value += replacement;
                found = true;
              }
            }
            if (!found) {
              value += split;
            }
          }
          attr.value = value;
        }

      }
    }

    const keys = Object.keys(desc);

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      if (key === "#") {
        continue;
      }
      if (isPlaceholderKey(key)) {
        continue;
      }

      const splits = key.split(/\s+/g);
      const len = splits.length;

      // Overwrite attribute
      if (len === 1) {
        elementNode.setAttribute(key, desc[key]);
        continue;
      }

      if (len === 2) {
        const first = splits[0];
        const second = splits[1];

        // Remove attribute
        if (first === "-") {
          elementNode.removeAttribute(second);
          continue;
        }

        if (first === "class") {

          // Merge class
          if (second === "+") {
            if (isString(desc[key])) {
              const valueSplits = desc[key].split(/\s+/g);
              for (let j = 0; j < valueSplits.length; ++j) {
                elementNode.classList.add(valueSplits[j]);
              }
            }
            continue;
          }

          // Reduce class
          if (second === "-") {
            if (isString(desc[key])) {
              const valueSplits = desc[key].split(/\s+/g);
              for (let j = 0; j < valueSplits.length; ++j) {
                elementNode.classList.remove(valueSplits[j]);
              }
            }
            continue;
          }

          // Over write class
          if (second === "=") {
            if (isString(desc[key])) {
              elementNode.class = desc[key];
            }
            continue;
          }
        }
        else {
          // Merge attribute value
          if (second === "+") {
            if (isString(desc[key])) {
              let attrS = elementNode.getAttribute(first);
              if (!isString(attrS)) {
                attrS = "";
              }
              const attrA = attrS.split(/\s+/g);
              const valueSplits = desc[key].split(/\s+/g);
              for (let j = 0; j < valueSplits.length; ++j) {
                if (attrA.indexOf(valueSplits[j]) === -1) {
                  attrA.push(valueSplits[j]);
                }
              }
              let newAttrS = "";
              for (let j = 0; j < attrA.length; ++j) {
                if (j >= 1) {
                  newAttrS += " ";

                }
                newAttrS += attrA[j];
              }
              elementNode.setAttribute(first, newAttrS);
            }
            continue;
          }

          // Reduce attribute value
          if (second === "-") {
            if (isString(desc[key])) {
              let attrS = elementNode.getAttribute(first);
              if (!isString(attrS)) {
                attrS = "";
              }
              const attrA = attrS.split(/\s+/g);
              const valueSplits = desc[key].split(/\s+/g);
              let newAttrS = "";
              for (let j = 0; j < attrA.length; ++j) {
                if (valueSplits.indexOf(attrA[j]) === -1) {
                  if (newAttrS.length >= 1) {
                    newAttrS += " ";
                  }
                  newAttrS += attrA[j];
                }
              }
              elementNode.setAttribute(first, newAttrS);
            }
            continue;
          }

          // Overwrite attribute value
          if (second === "=") {
            if (isString(desc[key])) {
              elementNode.setAttribute(first, desc[key]);
            }
            continue;
          }
        }
      }
      throw Error("The key was unsupported format.");
    }

    return elementNode;
  }

  Jhtrans.prototype.processReplacement = function (textNode, replacement) {

    console.log("processReplacement", { "textNode": textNode, "replacement": replacement });

    if (isString(replacement)) {
      return this.processString(textNode, replacement);
    }
    else if (isObject(replacement)) {
      if (!replacement.hasOwnProperty("#")) {
        throw Error("'#' was not found for the replacement object.");
      }

      const translated = this.translate(replacement);

      textNode.parentNode.replaceChild(translated, textNode);

      return translated;
    }
    else if (isArray(replacement)) {

      const elementNode = this.fromArray(replacement);

      textNode.parentNode.replaceChild(elementNode, textNode);

      return elementNode;
    }
    else {
      throw Error("The replacement is unsupported.");
    }
  };

  Jhtrans.prototype.processString = function (textNode, string) {

    console.log("processString", { "textNode": textNode, "string": string });

    const templ = this.getTemplate(string);
    if (!isNullOrUndefined(templ)) {
      textNode.parentNode.replaceChild(templ, textNode);
      return templ;
    } else {
      textNode.textContent = string;
      return textNode;
    }
  };

  return Jhtrans;
});