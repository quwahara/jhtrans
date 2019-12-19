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

  function isString(v) {
    return typeof v === "string";
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
  };

  // A dictionary to keep unique for DataPropRels instances
  Jhtrans._dataPropRelDic = {};

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

  function collectPlaceholder(elementNode, outCollections) {

    const copies = copyChildNodes(elementNode.childNodes);

    for (let i = 0; i < copies.length; ++i) {
      if (isPlaceholderTextNode(copies[i])) {
        outCollections.push(copies[i]);
      }
    }

    for (let i = 0; i < copies.length; ++i) {
      if (isElementNode(copies[i])) {
        collectPlaceholder(copies[i], outCollections);
      }
    }

    const attrs = elementNode.attributes;
    for (let i = 0; i < attrs.length; ++i) {
      if (isPlaceholderKey(attrs[i].value)) {
        outCollections.push(attrs[i]);
      }
    }

    return outCollections;
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
      if (isTextNode(collection)) {
        const textNode = collection;
        const placeholder = textNode.textContent.trim();

        if (!desc.hasOwnProperty(placeholder)) {
          continue;
        }

        const replacements = desc[placeholder];

        let replacements2;
        if (!isArray(replacements)) {
          replacements2 = [replacements];
        } else {
          replacements2 = replacements;
        }

        if (isNullOrUndefined(replacements2) || replacements2.length === 0) {
          continue;
        }

        // Justify number of text node to be equivalent with the array length.
        const textNodes = [];
        for (let i = 1; i < replacements2.length; ++i) {
          const createdTextNode = document.createTextNode("");
          textNode.parentNode.insertBefore(createdTextNode, textNode);
          textNodes.push(createdTextNode);
        }
        textNodes.push(textNode);

        for (let i = 0; i < replacements2.length; ++i) {
          this.processReplacement(textNodes[i], replacements2[i]);
        }
      }
      else if (isAttr(collection)) {
        const attr = collection;
        const placeholder = attr.value;

        if (!desc.hasOwnProperty(placeholder)) {
          continue;
        }

        const replacement = desc[placeholder];
        if (!isString(replacement)) {
          continue;
        }

        attr.value = replacement;
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

  Jhtrans.prototype._prepareDataPropRels = function (data) {

    if (!data._rid) {
      let _rid = rid();

      while (Jhtrans._dataPropRelDic[_rid]) {
        _rid = rid();
      }

      Object.defineProperty(data, "_rid", {
        writable: false,
        value: _rid
      });
    }

    let _dprs = Jhtrans._dataPropRelDic[data._rid];
    if (_dprs) {
      return _dprs;
    }

    _dprs = new DataPropRels(data)
    Jhtrans._dataPropRelDic[data._rid] = _dprs;

    return _dprs;
  }

  Jhtrans.prototype._preparePropInputRels = function (dataPropRels, propName) {
    let _pers = dataPropRels._propElemRelDic[propName];
    if (_pers) {
      return _pers;
    }

    _pers = new PropInputRels(dataPropRels, propName);

    dataPropRels._propElemRelDic[propName] = _pers;

    return _pers;
  }

  /**
   * Set bidirection data binding between object property and input.
   */
  Jhtrans.prototype.withValue = function (data, propName, input, eventType) {

    if (!isObject(data)) {
      throw Error("The data was not an object.");
    }

    if (!isString(propName)) {
      throw Error("The propName was not a string.");
    }

    if (!Object.prototype.hasOwnProperty.call(data, propName)) {
      throw Error("The propName was not a property of object.");
    }

    if (!isInputFamily(input)) {
      throw Error("The input was not an input, select nor textarea.");
    }

    if (isNullOrUndefined(eventType)) {
      eventType = "change";
    }

    const dprs = this._prepareDataPropRels(data);
    const pers = this._preparePropInputRels(dprs, propName);
    pers._bindInput(eventType, input);
  };

  Jhtrans.prototype.toText = function (data, propName, element) {

    if (!isObject(data)) {
      throw Error("The data was not an object.");
    }

    if (!isString(propName)) {
      throw Error("The propName was not a string.");
    }

    if (!Object.prototype.hasOwnProperty.call(data, propName)) {
      throw Error("The propName was not a property of object.");
    }

    if (!isElementNode(element)) {
      throw Error("The element was not an ElementNode.");
    }

    const dprs = this._prepareDataPropRels(data);
    const pers = this._preparePropInputRels(dprs, propName);
    pers._bindElement(element);
  };

  Jhtrans.prototype.each = function (data, propName, element, callback) {

    if (!isObject(data)) {
      throw Error("The data was not an object.");
    }

    if (!isString(propName)) {
      throw Error("The propName was not a string.");
    }

    if (!isArray(data[propName])) {
      throw Error("The propName was not a string.");
    }

    if (!Object.prototype.hasOwnProperty.call(data, propName)) {
      throw Error("The propName was not a property of object.");
    }

    if (!isElementNode(element)) {
      throw Error("The element was not an ElementNode.");
    }

    if (!isFunction(callback)) {
      throw Error("The callback was not a function.");
    }

    const dprs = this._prepareDataPropRels(data);
    const pers = this._preparePropInputRels(dprs, propName);
    pers._bindEachElement(callback, element);

  };

  const DataPropRels = function DataPropRels(data) {
    this._data = data;
    this._propElemRelDic = {};
    this._isPropergating = false;
  };

  const PropInputRels = function PropInputRels(dataPropRels, propName) {
    this._dataPropRels = dataPropRels;
    this._propName = propName;
    this._value = dataPropRels._data[propName];

    (function (self) {
      Object.defineProperty(dataPropRels._data, propName, {
        get: function () {
          return self._value;
        },
        set: function (value) {
          self._value = value;
          self._propagate(self, value);
        },
      });

    })(this);

    // Holding contents are:
    // key = eventType
    // value = {
    //    listener: <function>,
    //    inputs: [<input>]
    // }
    this._listenerContexts = {};

    this._elements = [];

    this._eachContexts = [];
  };

  /**
   * It adds a single event listener for an event among number of inputs.
   * The listener delivers the value of event target to other inputs and
   * property value of related object. 
   */
  PropInputRels.prototype._bindInput = function (eventType, input) {

    let ctx = this._listenerContexts[eventType];
    if (isNullOrUndefined(ctx)) {
      ctx = {
        listener: (function (self) {
          return function (event) {
            self._propagate(event.target, event.target.value);
          };
        })(this),
        inputs: [],
      };
      this._listenerContexts[eventType] = ctx;
    }

    const index = ctx.inputs.indexOf(input);

    // The input of argument has been bound.
    if (index >= 0) {
      return;
    }

    ctx.inputs.push(input);
    input.value = this._value;
    input.addEventListener(eventType, ctx.listener);
  }

  PropInputRels.prototype._bindElement = function (element) {

    const index = this._elements.indexOf(element);

    // The input of argument has been bound.
    if (index >= 0) {
      return;
    }

    this._elements.push(element);
    element.textContent = this._value;
  }

  PropInputRels.prototype._bindEachElement = function (callback, element) {
    this._eachContexts.push({
      callback: callback,
      element: element
    });
    this._propagate(null, this._value);
  }

  /**
   * It propergates value to among the inputs and related object property.
   */
  PropInputRels.prototype._propagate = function (source, value) {

    if (this._dataPropRels._isPropergating) {
      return;
    }

    this._dataPropRels._isPropergating = true;
    try {
      if (source !== this) {
        this._value = value;
      }

      for (let eventType in this._listenerContexts) {
        const ctx = this._listenerContexts[eventType];
        const inputs = ctx.inputs;
        for (let i = 0; i < inputs.length; ++i) {
          const input = inputs[i];
          if (input === source) {
            continue;
          }
          input.value = value;
        }
      }

      for (let i = 0; i < this._elements.length; ++i) {
        const element = this._elements[i];
        if (element === source) {
          continue;
        }
        element.textContent = value;
      }

      for (let i = 0; i < this._eachContexts.length; ++i) {
        const ctx = this._eachContexts[i];
        for (let j = 0; j < value.length; ++j) {
          if (false === ctx.callback.call(this, ctx.element, value[j])) {
            break;
          }
        }
      }

    } finally {
      this._dataPropRels._isPropergating = false;
    }
  }

  return Jhtrans;
});