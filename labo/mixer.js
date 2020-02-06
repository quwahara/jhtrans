(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");

    const contents = jht.translate({
        "#": "div", "class": "pnw14", "@": [
            {
                "#": "row", "@":
                {
                    "#": "col-12", "@":
                        [
                            { "#": "button@button", "name": "incBtn", "@": "Inc" },
                            { "#": "button@button", "name": "decBtn", "@": "Dec" },
                        ]
                },
            },
            {
                "#": "row", "@":
                {
                    "#": "col-12", "@":
                        [
                            { "#": "input@text", "name": "fontSizeTxt" },
                        ]
                },
            },
        ]
    });

    document.querySelector(".prime").appendChild(contents);

    const data = {
        style: {
            fontSize: "14px",
        }
    };

    distlink(data)
        .style
        .fontSize.selectRule(jht.endsWithPred("/basic.css"), jht.csvContainsPred("html")).toStyleOf("fontSize")
        .fontSize.select("input[name='fontSizeTxt']").withValue()
        ;

    document.querySelector("button[name='incBtn']").onclick = function () {
        data.style.fontSize = parseInt(data.style.fontSize, 10) + 1 + "px";
    }

    document.querySelector("button[name='decBtn']").onclick = function () {
        data.style.fontSize = parseInt(data.style.fontSize, 10) - 1 + "px";
    }
})();
