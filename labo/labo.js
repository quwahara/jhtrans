define(function (require) {

  var Jhtrans = require('../libs/jhtrans');
  const jht = new Jhtrans();

  const gridTemplates = {

    // row

    "row": ["div", { "class": "row" }, "@"],

    // col-1 to col-12

    "col-1": ["div", { "class": "col-1" }, "@"],
    "col-2": ["div", { "class": "col-2" }, "@"],
    "col-3": ["div", { "class": "col-3" }, "@"],
    "col-4": ["div", { "class": "col-4" }, "@"],
    "col-5": ["div", { "class": "col-5" }, "@"],
    "col-6": ["div", { "class": "col-6" }, "@"],
    "col-7": ["div", { "class": "col-7" }, "@"],
    "col-8": ["div", { "class": "col-8" }, "@"],
    "col-9": ["div", { "class": "col-9" }, "@"],
    "col-10": ["div", { "class": "col-10" }, "@"],
    "col-11": ["div", { "class": "col-11" }, "@"],
    "col-12": ["div", { "class": "col-12" }, "@"],
  };

  const layoutTemplates = {
    "pad3": ["div", { "class": "pad3" }, "@"],
    "pad6": ["div", { "class": "pad6" }, "@"],
    "row{col-3.col-6.col-3}": {
      "#": "row", "@": [
        { "#": "col-3", "@": "@1" },
        { "#": "col-6", "@": "@2" },
        { "#": "col-3", "@": "@3" }
      ]
    }
  };

  const componentTemplates = {
    "button@button": ["button", { "type": "button" }, "@"],
    "input@text": ["input", { "type": "text", "name": "@name" }],
    "input@password": ["input", { "type": "password" }],
    "labeled": {
      "#": "pad6", "@": [
        ["lable", null, "@label"],
        "@target"
      ]
    }
  };

  jht.putTemplateAll(gridTemplates);
  jht.putTemplateAll(layoutTemplates);
  jht.putTemplateAll(componentTemplates);

  const contents = jht.translate({
    "#": "row", "@": [
      { "#": "input@text", "@name": "xxx" },
      {
        "#": "row{col-3.col-6.col-3}",
        "@1": "",
        "@3": "",
        "@2": [
          {
            "#": "row", "@": {
              "#": "labeled",
              "@label": "Username",
              "@target": "input@text",
            }
          },
          {
            "#": "row", "@": {
              "#": "labeled",
              "@label": "Password",
              "@target": "input@password",
            }
          },
          {
            "#": "row", "@": [
              { "#": "col-6", "@": { "#": "button@button", "@": "Login" }, },
              { "#": "col-6", "@": { "#": "button@button", "@": "Cancel" }, },
            ]
          },
        ],
      }
    ]
  });

  document.querySelector("body").appendChild(contents);


  let data = {
    user: {
      username: "",
      password: ""
    }
  };

  // jht.withValue(data.user, "username", document.querySelector(""));
});