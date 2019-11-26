define(function (require) {

  var Jhtrans = require('../libs/jhtrans');
  const jht = new Jhtrans();



  //
  // putTemplateAll test
  //

  jht.putTemplateAll({

    //
    // row
    //
    "row": ["div", {
      "class": "row"
    }, "@"],

    //
    // c-1 to c-12
    //
    "c-1": ["div", {
      "class": "c-1"
    }, "@"],
    "c-2": ["div", {
      "class": "c-2"
    }, "@"],
    "c-3": ["div", {
      "class": "c-3"
    }, "@"],
    "c-4": ["div", {
      "class": "c-4"
    }, "@"],
    "c-5": ["div", {
      "class": "c-5"
    }, "@"],
    "c-6": ["div", {
      "class": "c-6"
    }, "@"],
    "c-7": ["div", {
      "class": "c-7"
    }, "@"],
    "c-8": ["div", {
      "class": "c-8"
    }, "@"],
    "c-9": ["div", {
      "class": "c-9"
    }, "@"],
    "c-10": ["div", {
      "class": "c-10"
    }, "@"],
    "c-11": ["div", {
      "class": "c-11"
    }, "@"],
    "c-12": ["div", {
      "class": "c-12"
    }, "@"],

    //
    // lablel
    //
    "label": ["label", null, "@"],

    //
    // inputs
    //
    "i-text": ["input", {
      "type": "text"
    }],
    "i-password": ["input", {
      "type": "password"
    }],

  });

  const row = jht.getTemplate("row");

  document.querySelector(".mount").appendChild(row);

  jht.acceptElementNode(row, {
    "0x0-1x0": [
      "#c-6",
      "#c-6",
    ],
  }, "", 0, 0);


  //
  // crearte a row that has three columns
  //
  // var row = jht.translate("row", {
  //   "1": [
  //     "#c-6",
  //     "#c-6",
  //   ],
  //   // "0-1x0-2": [
  //   //   "#label",
  //   //   "#i-text",
  //   // ],
  //   // "0-1x0-2-3x0-4": "Username",
  // });

  // var row = jht.translate("row", {
  //   "@0": [
  //     "#c-12",
  //   ],
  //   "@1-0": "#i-text",
  // });

  // var row = jht.translate("row", {
  //   "@0": [
  //     "#c-6",
  //     "#c-6",
  //   ],
  //   "@1-0": "CCC",
  //   "@1-1": "111",
  //   "@1-2": "222",
  // });




  /*
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
    */

});