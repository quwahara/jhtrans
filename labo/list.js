(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");
    const contents = jht.translate({
        "#": "div", "class +": "pw14", "@": [
            { "#": "h1", "@": "List" },
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
        musicians: [
            { id: "1", name: "Alice Cooper", birthday: "1948-02-04", birthplace: "Detroit, Michigan, U.S.", wikipedia: "https://en.wikipedia.org/wiki/Alice_Cooper" },
            { id: "2", name: "Billy Joel", birthday: "1949-05-09", birthplace: "The Bronx, New York, U.S.", wikipedia: "https://en.wikipedia.org/wiki/Billy_Joel" },
            { id: "3", name: "Chuck Berry", birthday: "1926-10-18", birthplace: "St. Louis, Missouri, U.S.", wikipedia: "https://en.wikipedia.org/wiki/Chuck_Berry" },
            { id: "4", name: "David Bowie", birthday: "1947-01-08", birthplace: "Brixton, London, England", wikipedia: "https://en.wikipedia.org/wiki/David_Bowie" },
            { id: "5", name: "Elton John", birthday: "1947-05-25", birthplace: "Pinner, Middlesex, England", wikipedia: "https://en.wikipedia.org/wiki/Elton_John" },
        ]
    }

    document.querySelector(".prime").appendChild(contents);

    const musicianCols = schemas.musicians.columns;
    jht.stage(schemas)
        .musicians.columns.select("thead>tr").each(function (elem, item) {
            const th = jht.translate({ "#": "th", "class +": "pnews6", "@": item.caption });
            elem.appendChild(th);
        });

    jht.stage(data)
        .musicians.select("tbody").each(function (elem, item) {
            const tds = [];
            for (let i = 0; i < musicianCols.length; ++i) {

                const col = musicianCols[i];
                const value = item[col.name];
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
            elem.appendChild(tr);
        })
        ;

})();