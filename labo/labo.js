define(function (require) {

  var Jhtrans = require('../libs/jhtrans');
  const jht = new Jhtrans();

  const gridTemplates = {
    //
    // row
    //
    "row": ["div", {
      "class": "row"
    }, "@"],

    //
    // col-1 to col-12
    //
    "col-1": ["div", {
      "class": "col-1"
    }, "@"],
    "col-2": ["div", {
      "class": "col-2"
    }, "@"],
    "col-3": ["div", {
      "class": "col-3"
    }, "@"],
    "col-4": ["div", {
      "class": "col-4"
    }, "@"],
    "col-5": ["div", {
      "class": "col-5"
    }, "@"],
    "col-6": ["div", {
      "class": "col-6"
    }, "@"],
    "col-7": ["div", {
      "class": "col-7"
    }, "@"],
    "col-8": ["div", {
      "class": "col-8"
    }, "@"],
    "col-9": ["div", {
      "class": "col-9"
    }, "@"],
    "col-10": ["div", {
      "class": "col-10"
    }, "@"],
    "col-11": ["div", {
      "class": "col-11"
    }, "@"],
    "col-12": ["div", {
      "class": "col-12"
    }, "@"],
  };

  jht.putTemplateAll(gridTemplates);

  const layoutTemplates = {
    "row__col-3--col-6--col-3": jht.translate({
      "#": "row", "@": ["col-3", "col-6", "col-3"]
    })
  };

  jht.putTemplateAll(layoutTemplates);

  const contents = jht.translate({
    "#": "row", "@": "xxx"
  })

  document.querySelector("body").appendChild(contents);

});