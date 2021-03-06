define(function (require) {

  var Jhtrans = require('../libs/jhtrans');
  const jht = new Jhtrans();

  //
  // definitionToElement test
  //

  function ac(query, elm) {
    document.querySelector(query).appendChild(elm);
  }
  ac(".dte-1", jht.definitionToElement(["div"]));
  ac(".dte-2", jht.definitionToElement(["div", {
    "class": "sub-dte-2"
  }]));
  ac(".dte-3", jht.definitionToElement(["div", null, "sub-dte-3"]));
  ac(".dte-4", jht.definitionToElement(
    ["div", null, [
      ["div", null, "sub-sub-dte-4"],
      ["div", null, "sub-sub-dte-4"],
      ["div", null, "sub-sub-dte-4"]
    ]]));

  //
  // putTemplate test
  //

  jht.putTemplate("pt-1", ["div", {
    "class": "sub-pt-1"
  }, "sub-pt-1"]);
  ac(".pt-1", jht.getTemplate("pt-1"));

  //
  // translate test
  //

  jht.putTemplate("tr-1-main", ["div", {
      "class": "sub-tr-1-main"
    },
    [
      ["div", null, "~#tr-1-sub"]
    ]
  ]);
  jht.putTemplate("tr-1-sub", ["div", {
    "class": "sub-tr-1-sub"
  }, "tr-1-sub"]);
  ac(".tr-1", jht.translate("tr-1-main"));

  jht.putTemplate("tr-2-main", ["div", {
      "class": "sub-tr-2-main"
    },
    [
      ["div", null, "~@holder"]
    ]
  ]);
  jht.putTemplate("tr-2-sub", ["div", {
    "class": "sub-tr-2-sub"
  }, "tr-2-sub"]);
  ac(".tr-2", jht.translate("tr-2-main", {
    "holder": "tr-2-sub"
  }));

  //
  // putTemplateAll test
  //

  jht.putTemplateAll({
    "pta-1-main": ["div", {
        "class": "sub-pta-1-main"
      },
      [
        ["div", null, [
          ["div", null, "~@holder-1"]
        ]],
        ["div", null, [
          ["div", null, "~@holder-2"]
        ]],
      ]
    ],
    "pta-1-sub-1": ["div", {
      "class": "sub-pta-1-sub-1"
    }, "pta-1-sub-1"],
    "pta-1-sub-2": ["div", {
      "class": "sub-pta-1-sub-2"
    }, "pta-1-sub-2"],
  });
  ac(".pta-1", jht.translate("pta-1-main", {
    "holder-1": "pta-1-sub-1",
    "holder-2": "pta-1-sub-2"
  }));

});