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
    var Jhtrans = function Jhtrans(templates) {
      console.log('Hello World2');
    };





    return Jhtrans;
  })();

});