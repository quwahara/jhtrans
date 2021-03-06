let data, data2;
define(function (require) {

  const Jhtrans = require('../libs/jhtrans');
  const distlink = require('../node_modules/distlink/libs/distlink.js');
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
    "div": ["div", { "class": "@class" }, "@"],
    "span": ["span", { "class": "@class" }, "@"],
    "a": ["a", { "class": "@class", "href": "@href" }, "@"],
    "button@button": ["button", { "type": "button", "name": "@name" }, "@"],
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
      { "#": "row", "@": { "#": "a", "@class": "to-attr", "@href": "", "@": "Yahoo!" } },
      { "#": "row", "@": { "#": "span", "@class": "to-text", "@": "xxx" } },
      {
        "#": "row", "@": {
          "#": "div", "@class": "each", "@": "ttt"
        }
      },
      {
        "#": "row{col-3.col-6.col-3}",
        "@1": "",
        "@3": "",
        "@2": [
          {
            "#": "row", "@": {
              "#": "labeled",
              "@label": "Username",
              "@target": {
                "#": "input@text", "@name": "name"
              },
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
              { "#": "col-6", "@": { "#": "button@button", "@": "Login", "@name": "ok" }, },
              { "#": "col-6", "@": { "#": "button@button", "@": "Cancel", "@name": "cancel" }, },
            ]
          },
        ],
      },

      { "#": "row", "@": { "#": "input@text", "@name": "username2" } },
      { "#": "row", "@": { "#": "a", "@": "link", "@class": "to-attr2", "@href": "" } },
      {
        "#": "row", "@": {
          "#": "div", "@class": "each2", "@": "222"
        }
      },
    ]
  });

  document.querySelector("body").appendChild(contents);


  data = {
    user: {
      username: "",
      password: ""
    },
    list: [
      { name: "Alice", href: "#alice" },
      { name: "Bob", href: "#bob" },
    ],
    href: "http://www.yahoo.co.jp",
    toClass: "aaa",
    turnClassOn: true
  };

  document.querySelector("button[name='ok']").onclick = function (event) {
    console.log("data.user.username", data.user.username);
  }

  document.querySelector("button[name='cancel']").onclick = function (event) {
    data.user.username = (new Date()).toISOString();
  }

  distlink(data)
    .href.select("a.to-attr").toHref()
    .toClass.select("a.to-attr").toClass()
    .turnClassOn.select("a.to-attr").turnClassOn("here")
    .list.select("div.each").each(function (item, childElement, index, selectedElement) {
      const rowElm = jht.translate({
        "#": "div", "@class": "row", "@": [
          { "#": "a", "@class": "name", "@": "" }
        ]
      });
      selectedElement.appendChild(rowElm);
      const a = rowElm.querySelector("a");
      item
        .name.select(a).toText()
        .href.select(a).toAttr("href")
        ;
    })
    .user
    .username.select("input[name='name']").withValue()
    .and.select("span.to-text").toText()
    ;

  let elms = document.querySelectorAll(".row, [class*='col-']");
  for (let i = 0; i < elms.length; ++i) {
    elms.item(i).classList.add("debug");
  }

});