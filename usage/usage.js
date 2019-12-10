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
    "div": ["div", null, "@"],

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

    "row--c-12--pad6": ["div", {
      "class": "row"
    }, [
        ["div", {
          "class": "c-12"
        }, [
            ["div", {
              "class": "pad6"
            }, "@"]
          ]]
      ]
    ],

    //
    // lablel
    //
    "label": ["label", null, "@"],

    //
    // inputs
    //
    "i-text": ["input", {
      "type": "text"
    }, ""],
    "i-password": ["input", {
      "type": "password"
    }, ""],

    //
    // buttons
    //
    "b-button": ["button", {
      "type": "button"
    }, "@"],
  });

  const translated = jht.translate("div", [
    {
      "#": "row", "rs": [
        "c-3",
        {
          "#": "c-6", "rs": [
            {
              "#": "row--c-12--pad6", "rs": [
                { "#": "label", "rs": "Username" },
                "i-text",
              ]
            },
            {
              "#": "row--c-12--pad6", "rs": [
                { "#": "label", "rs": "Password" },
                "i-password",
              ]
            },
            {
              "#": "row--c-12--pad6", "rs": [
                {
                  "#": "c-6", "rs": [
                    { "#": "b-button", "rs": "Login" },
                  ]
                },
                {
                  "#": "c-6", "rs": [
                    { "#": "b-button", "rs": "Cancel" },
                  ]
                },
              ]
            },
          ]
        },
        "c-3",
      ]
    }
  ]);

  document.querySelector(".mount").appendChild(translated);

});