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
                    "#": "pse14", "@":
                        [
                            { "#": "button@button", "name": "incBtn", "@": "Inc" },
                            { "#": "button@button", "name": "decBtn", "@": "Dec" },
                        ]
                }
            },
        ]
    });

    document.querySelector(".prime").appendChild(contents);


    document.querySelector("button[name='incBtn']").onclick = function () {
        cssCache.html.style.fontSize = parseInt(cssCache.html.style.fontSize, 10) + 1 + "px";
    }

    document.querySelector("button[name='decBtn']").onclick = function () {
        cssCache.html.style.fontSize = parseInt(cssCache.html.style.fontSize, 10) - 1 + "px";
    }




    console.log(document.styleSheets);

    let ssheet = null;
    for (let i = 0; i < document.styleSheets.length; ++i) {
        const href = document.styleSheets[i].href;
        if (href.indexOf("/basic.css") === (href.length - "/basic.css".length)) {
            ssheet = document.styleSheets[i];
            break;
        }
    }

    console.log(ssheet.cssRules);
    window.cssCache = {};

    for (let i = 0; i < ssheet.cssRules.length; ++i) {
        const rule = ssheet.cssRules[i];
        console.log(rule);
        if (!rule.selectorText) { continue; }
        const splits = rule.selectorText.split(",");
        console.log(splits);
        if (!cssCache.html && splits.indexOf("html") >= 0) {
            cssCache.html = rule;
        }
    }

    console.log(cssCache.html);


    // console.log(styleSheet.cssRules);

})();