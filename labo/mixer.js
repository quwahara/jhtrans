(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");

    const contents = jht.translate({
        "#": "div", "class": "", "@": [
            {
                "#": "row", "@":
                {
                    "#": "col-12", "@":
                        [
                            // { "#": "button@button", "name": "incBtn", "@": "Inc" },
                            // { "#": "button@button", "name": "decBtn", "@": "Dec" },
                        ]
                },
            },
            {
                "#": "row", "@":
                {
                    "#": "col-12", "@":
                        [
                            // { "#": "input@text", "name": "fontSizeTxt" },
                        ]
                },
            },
            {
                "#": "row", "class +": "pse14", "@": [
                    {
                        "#": "table-hb",
                        "@thead": { "#": "tr", "@": "" },
                        "@tbody": "",
                    },
                ]
            },
        ]
    });

    document.querySelector(".prime").appendChild(contents);

    const schemas = {
        musicians: {
            columns: [
                { name: "id", type: "number", dstType: "textContent", caption: "ID" },
                { name: "name", type: "string", dstType: "textContent", caption: "Name" },
                { name: "birthday", type: "string", dstType: "textContent", caption: "Birthday" },
                { name: "birthplace", type: "string", dstType: "textContent", caption: "Birthplace" },
                { name: "wikipedia", type: "string", dstType: "a", caption: "Wikipedia" },
            ]
        }
    }

    // Data source: https://en.wikipedia.org/wiki/List_of_rock_music_performers
    const data = {
        style: {
            fontSize: "14px",
        },
        musicians: [
            { id: "1", name: "Alice Cooper", birthday: "1948-02-04", birthplace: "Detroit, Michigan, U.S.", wikipedia: "https://en.wikipedia.org/wiki/Alice_Cooper" },
            { id: "2", name: "Billy Joel", birthday: "1949-05-09", birthplace: "The Bronx, New York, U.S.", wikipedia: "https://en.wikipedia.org/wiki/Billy_Joel" },
            { id: "3", name: "Chuck Berry", birthday: "1926-10-18", birthplace: "St. Louis, Missouri, U.S.", wikipedia: "https://en.wikipedia.org/wiki/Chuck_Berry" },
            { id: "4", name: "David Bowie", birthday: "1947-01-08", birthplace: "Brixton, London, England", wikipedia: "https://en.wikipedia.org/wiki/David_Bowie" },
            { id: "5", name: "Elton John", birthday: "1947-05-25", birthplace: "Pinner, Middlesex, England", wikipedia: "https://en.wikipedia.org/wiki/Elton_John" },
        ]
    };

    // document.querySelector(".prime").appendChild(contents);

    const musicianCols = schemas.musicians.columns;
    distlink(schemas)
        .musicians.columns.select("thead>tr").each(function (item, childElement, index, selectedElement) {
            const th = jht.translate({ "#": "th", "class +": "pnews6", "@": item.caption._value });
            selectedElement.appendChild(th);
        });

    distlink(data)
        .musicians.select("tbody").each(function (item, childElement, index, selectedElement) {
            const tds = [];
            for (let i = 0; i < musicianCols.length; ++i) {

                const col = musicianCols[i];
                const value = item[col.name]._value;
                let content;

                if (col.dstType === "a") {
                    content = { "#": "a", "target": "_blank", "href": value, "@": value };
                } else if (col.dstType === "textContent") {
                    content = value;
                } else {
                    content = "";
                }

                tds.push({ "#": "td", "class +": "pnews6", "@": content });
            }
            const tr = jht.translate({ "#": "tr", "@": tds });
            selectedElement.appendChild(tr);
        })
        .style
        .fontSize.selectRule(jht.endsWithPred("/basic.css"), jht.csvContainsPred("html")).toStyleOf("fontSize")
        // .fontSize.select("input[name='fontSizeTxt']").withValue()
        .fontSize.select("input[name='fontSizeTxt']").withValue()
        ;

    // distlink(data)
    //     .style
    //     .fontSize.selectRule(jht.endsWithPred("/basic.css"), jht.csvContainsPred("html")).toStyleOf("fontSize")
    //     .fontSize.select("input[name='fontSizeTxt']").withValue()
    //     ;

    document.querySelector("button[name='incBtn']").onclick = function () {
        data.style.fontSize = parseInt(data.style.fontSize, 10) + 1 + "px";
    }

    document.querySelector("button[name='decBtn']").onclick = function () {
        data.style.fontSize = parseInt(data.style.fontSize, 10) - 1 + "px";
    }


    const space = document.querySelector(".control-panel__space");


    const rules = [];
    for (let i = 0; i < document.styleSheets.length; ++i) {
        const sheet = document.styleSheets[i];
        console.log(sheet);

        const hrefDiv = jht.fromHtml("<div></div>");
        hrefDiv.textContent = sheet.href;
        space.appendChild(hrefDiv);

        for (let j = 0; j < sheet.cssRules.length; ++j) {
            const rule = sheet.cssRules[j];
            if (!rule.selectorText) { continue; }

            const selectorTextDiv = jht.fromHtml("<div></div>");
            selectorTextDiv.textContent = rule.selectorText;
            space.appendChild(selectorTextDiv);
        }


        // if (hrefPred(sheet.href)) {
        //     for (let j = 0; j < sheet.cssRules.length; ++j) {
        //         const rule = sheet.cssRules[j];
        //         if (!rule.selectorText) { continue; }
        //         if (ruleSelectorPred(rule.selectorText)) {
        //             rules.push(rule);
        //         }
        //     }
        // }
    }


})();
