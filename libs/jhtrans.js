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

    // Global replacement dictionary
    this.globalReplacements = {};

    // object to be bound in method chaining
    this._staging = null;
  };

  // A dictionary to keep unique for DataStage instances
  Jhtrans._dataStageDic = {};
  Jhtrans._objectPropDic = {};

  Jhtrans.prototype.getTemplate = function (name) {

    if (this.templates.hasOwnProperty(name)) {
      return this.templates[name].cloneNode(true);
    }

    return null;
  };

  Jhtrans.prototype.putTemplate = function (name, declaration) {

    if (isArray(declaration)) {
      var template = this.declarationToElement(declaration);
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

  Jhtrans.prototype.putTemplateAll = function (nameDeclarations) {
    for (var name in nameDeclarations) {
      this.putTemplate(name, nameDeclarations[name]);
    }
    return this;
  };

  Jhtrans.prototype.declarationToElement = function (declaration) {

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
            var child = this.declarationToElement(third[i]);
            elm.appendChild(child);
          }
        }
      }
    }

    return elm;
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

    if (collections.length === 0) {
      return elementNode;
    }

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

      const elementNode = this.declarationToElement(replacement);

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

  Jhtrans.prototype.stage = function (object) {
    if (!isObject(object)) {
      throw Error("The argument type was not object.");
    }

    let prop = new ObjectProp(this, null, null, object);

    return prop;
  }

  const ObjectProp = function ObjectProp(jht, owner, nameInOwner, object) {
    this._jht = jht;
    this._owner = owner;
    this._nameInOwner = nameInOwner;
    this._object = object;
    this._selected = null;
    this._propDic = {};
    this._and = null;

    Object.defineProperty(this, "and", {
      enumerable: false,
      get: (function (self) {
        return function () {
          return self._and;
        };
      })(this)
    });

    for (let key in object) {
      const value = object[key];
      let prop;
      if (isNullOrUndefined(value) || isPrimitive(value)) {
        prop = new PrimitiveProp(jht, this, key);
      }
      else if (isObject(value)) {

        if (!value._rid) {
          let _rid = rid();

          while (Jhtrans._objectPropDic[_rid]) {
            _rid = rid();
          }

          Object.defineProperty(value, "_rid", {
            enumerable: false,
            writable: false,
            value: _rid
          });

          prop = new ObjectProp(jht, object, key, value);

          Jhtrans._objectPropDic[_rid] = prop;
        }
        else {
          prop = Jhtrans._objectPropDic[value._rid];
        }
      }
      else if (isArray(value)) {
        prop = new ArrayProp(jht, this, key);
      }
      else {
        throw Error("Unsupported type");
      }
      this._propDic[key] = prop;

      (function (self, key, prop) {
        Object.defineProperty(self, key, {
          enumerable: true,
          get: function () {
            self._and = prop;
            return prop;
          }
        });
      })(this, key, prop);
    }

    if (isObject(owner) && isString(nameInOwner)) {
      (function (self) {
        Object.defineProperty(owner, nameInOwner, {
          enumerable: true,
          get: function () {
            return self._object;
          },
          set: function (value) {
            if (isNullOrUndefined(value)) {
              for (let key in self._propDic) {
                self._propDic[key]._propagate(self, null);
              }
            }
            else if (isObject(value)) {
              for (let key in self._propDic) {
                self._propDic[key]._propagate(self, value[key]);
              }
            }
            else {
              throw Error("Value type was unmatch");
            }
          }
        });
      })(this);
    }
  };

  ObjectProp.prototype.select = function (queryOrElement) {

    if (isString(queryOrElement)) {
      this._selected = document.querySelector(queryOrElement);
    }
    else if (isElementNode(queryOrElement)) {
      this._selected = queryOrElement;
    }
    else {
      throw Error("The queryOrElement requires query string or ElementNode.");
    }

    return this;
  };

  ObjectProp.prototype._propagate = function (source, value) {

    if (source === this) {
      return;
    }

    if (isNullOrUndefined(value)) {
      for (let key in this._propDic) {
        this._propDic[key]._propagate(this, null);
      }
    }
    else if (isObject(value)) {
      for (let key in this._propDic) {
        this._propDic[key]._propagate(this, value[key]);
      }
    }
    else {
      throw Error("Value type was unmatch");
    }
  }

  const ArrayProp = function ArrayProp(jht, objectProp, nameInObject) {
    this._jht = jht;
    this._objectProp = objectProp;
    this._nameInObject = nameInObject;
    this._value = objectProp._object[nameInObject];
    if (isNullOrUndefined(objectProp._object[nameInObject])) {
      this._previousValue = "";
    } else {
      this._previousValue = "" + objectProp._object[nameInObject];
    }
    this._selected = null;

    // Holding contents are:
    // {
    //    callback: <function>,
    //    element: <ElementNode>
    // }
    this._eachContexts = [];

    Object.defineProperty(objectProp._object, nameInObject, {
      enumerable: true,
      get: (function (self) {
        return function () {
          return self._value;
        };
      })(this),
      set: (function (self) {
        return function (value) {
          self._value = value;
          self._propagate(self, value);
        };
      })(this),
    });

  }

  ArrayProp.prototype.select = function (queryOrElement) {

    if (isString(queryOrElement)) {
      this._selected = document.querySelector(queryOrElement);
    }
    else if (isElementNode(queryOrElement)) {
      this._selected = queryOrElement;
    }
    else {
      throw Error("The queryOrElement requires query string or ElementNode.");
    }

    return this;
  };

  ArrayProp.prototype.each = function (callback) {

    if (!isFunction(callback)) {
      throw Error("The callback was not a function.");
    }

    if (!isElementNode(this._selected)) {
      throw Error("No ElementNode was selected.");
    }

    this._eachContexts.push({
      callback: callback,
      element: this._selected
    });

    this._propagate(null, this._value);

    return this._objectProp;
  };

  ArrayProp.prototype._propagate = function (source, value) {

    if (source !== this) {
      this._value = value;
    }

    for (let i = 0; i < this._eachContexts.length; ++i) {
      const context = this._eachContexts[i];
      for (let j = 0; j < value.length; ++j) {
        if (false === context.callback.call(this, context.element, value[j])) {
          break;
        }
      }
    }

  };

  const PrimitiveProp = function PrimitiveProp(jht, objectProp, nameInObject) {
    this._jht = jht;
    this._objectProp = objectProp;
    this._nameInObject = nameInObject;
    this._value = objectProp._object[nameInObject];
    if (isNullOrUndefined(objectProp._object[nameInObject])) {
      this._previousValue = "";
    } else {
      this._previousValue = "" + objectProp._object[nameInObject];
    }
    this._selected = null;

    // Holding contents are:
    // key = eventType
    // value = {
    //    listener: <function>,
    //    inputs: [<input>]
    // }
    this._listenerContexts = {};

    // Holding contents are:
    //    [<ElementNode>]
    this._toTextElements = [];

    // Holding contents are:
    // key = attrName
    // value = {
    //    attrName: <attrName:string>,
    //    elements: [<ElementNode>]
    // }
    this._toAttrContexts = {};

    // Holding contents are:
    //    <ElementNode>
    this._toClassElements = [];

    // Holding contents are:
    // key = className + ("_on" | "_off")
    // value = {
    //    className: <className:string>,
    //    onOrOff: <onOrOff:boolean>,
    //    elements: [<ElementNode>]
    // }
    this._turnClassContexts = {};

    Object.defineProperty(objectProp._object, nameInObject, {
      enumerable: true,
      get: (function (self) {
        return function () {
          return self._value;
        };
      })(this),
      set: (function (self) {
        return function (value) {
          self._value = value;
          self._propagate(self, value);
        };
      })(this),
    });
  };

  PrimitiveProp.prototype._assertSelected = function () {

    const selected = this._selected || this._objectProp._selected;

    if (!isElementNode(selected)) {
      throw Error("No ElementNode was selected.");
    }

    return selected;
  };

  PrimitiveProp.prototype.select = function (queryOrElement) {

    if (isString(queryOrElement)) {
      this._selected = document.querySelector(queryOrElement);
    }
    else if (isElementNode(queryOrElement)) {
      this._selected = queryOrElement;
    }
    else {
      throw Error("The queryOrElement requires query string or ElementNode.");
    }

    return this;
  };

  PrimitiveProp.prototype.withValue = function (eventType) {

    if (isNullOrUndefined(eventType)) {
      eventType = "change";
    }

    // It adds a single event listener for an event among number of inputs.
    // The listener delivers the value of event target to other inputs and
    // property value of related object. 

    const input = this._assertSelected();

    // if (!isElementNode(this._selected)) {
    //   throw Error("No ElementNode was selected.");
    // }

    if (!isInputFamily(input)) {
      throw Error("Selected NodeElement was not an input, select nor textarea.");
    }

    let context = this._listenerContexts[eventType];
    if (isNullOrUndefined(context)) {
      context = {
        listener: (function (self) {
          return function (event) {
            self._propagate(event.target, event.target.value);
          };
        })(this),
        inputs: [],
      };
      this._listenerContexts[eventType] = context;
    }

    // const input = this._selected;
    const index = context.inputs.indexOf(input);

    // The input of argument has been bound.
    if (index >= 0) {
      return this._objectProp;
    }

    context.inputs.push(input);
    input.value = this._value;
    input.addEventListener(eventType, context.listener);

    return this._objectProp;
  }

  PrimitiveProp.prototype.toText = function (source, value) {

    const element = this._assertSelected();

    const index = this._toTextElements.indexOf(element);

    // The input of argument has been bound.
    if (index >= 0) {
      return this._objectProp;
    }

    this._toTextElements.push(element);
    element.textContent = this._value;

    return this._objectProp;
  }

  PrimitiveProp.prototype.toSrc = function () {
    return this.toAttr("src");
  }

  PrimitiveProp.prototype.toHref = function () {
    return this.toAttr("href");
  }

  PrimitiveProp.prototype.toAttr = function (attrName) {

    const element = this._assertSelected();

    let context = this._toAttrContexts[attrName];
    if (isNullOrUndefined(context)) {
      context = {
        attrName: attrName,
        elements: []
      }
      this._toAttrContexts[attrName] = context;
    }

    const index = context.elements.indexOf(element);

    // The input of argument has been bound.
    if (index >= 0) {
      return;
    }

    context.elements.push(element);
    element.setAttribute(attrName, this._value);

    return this._objectProp;
  };

  PrimitiveProp.prototype.toClass = function () {

    const element = this._assertSelected();

    const index = this._toClassElements.indexOf(element);

    // The input of argument has been bound.
    if (index >= 0) {
      return;
    }

    this._toClassElements.push(element);
    if (!isEmptyString(this._value)) {
      element.classList.add(this._value);
    }

    return this._objectProp;
  };

  PrimitiveProp.prototype.turnClassOn = function (className) {
    return this.turnClass(className, true);
  }

  PrimitiveProp.prototype.turnClassOff = function (className) {
    return this.turnClass(className, false);
  }

  PrimitiveProp.prototype.turnClass = function (className, onOrOff) {

    const element = this._assertSelected();

    const key = className + "_" + (onOrOff ? "on" : "off");

    let context = this._turnClassContexts[key];
    if (isNullOrUndefined(context)) {
      context = {
        className: className,
        onOrOff: onOrOff,
        elements: []
      }
      this._turnClassContexts[key] = context;
    }

    const index = context.elements.indexOf(element);

    // The input of argument has been bound.
    if (index >= 0) {
      return this._objectProp;
    }

    context.elements.push(element);
    const on = context.onOrOff ? this._value : !this._value;
    if (on) {
      element.classList.add(context.className);
    } else {
      element.classList.remove(context.className);
    }

    return this._objectProp;
  };

  /**
   * It propergates value to among the inputs and related object property.
   */
  PrimitiveProp.prototype._propagate = function (source, value) {

    const previousValue = this._previousValue;

    if (source !== this) {

      if (isNullOrUndefined(this._value)) {
        this._previousValue = "";
      } else {
        this._previousValue = "" + this._value;
      }

      this._value = value;
    }

    for (let eventType in this._listenerContexts) {
      const context = this._listenerContexts[eventType];
      const inputs = context.inputs;
      for (let i = 0; i < inputs.length; ++i) {
        const input = inputs[i];
        if (input === source) {
          continue;
        }
        input.value = value;
      }
    }

    for (let i = 0; i < this._toTextElements.length; ++i) {
      const element = this._toTextElements[i];
      if (element === source) {
        continue;
      }
      element.textContent = value;
    }

    for (let attrName in this._toAttrContexts) {
      const context = this._toAttrContexts[attrName];
      const elements = context.elements;
      for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        if (element === source) {
          continue;
        }
        element.setAttribute(attrName, value);
      }
    }

    for (let i = 0; i < this._toClassElements.length; ++i) {
      const element = this._toClassElements[i];
      if (element === source) {
        continue;
      }
      const classList = element.classList;
      if (!isEmptyString(previousValue)) {
        classList.remove(previousValue);
      }
      if (!isEmptyString(value)) {
        classList.add(value);
      }
    }

    for (let key in this._turnClassContexts) {
      const context = this._turnClassContexts[key];
      const elements = context.elements;
      for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        if (element === source) {
          continue;
        }
        const on = context.onOrOff ? value : !value;
        if (on) {
          element.classList.add(context.className);
        } else {
          element.classList.remove(context.className);
        }
      }
    }

  }

  return Jhtrans;
});