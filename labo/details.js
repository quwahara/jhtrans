(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");

    const contents = jht.translate({
        "#": "div", "@class": "pnw14", "@": [
            {
                "#": "row", "@class": "", "@": {
                    "#": "labeled", "@label": "Fullname", "@": { "#": "input@text", "@name": "fullname", "value": "Alice Cooper" }
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "labeled", "@label": "States", "@": { "#": "select", "@name": "states", "@": "" }
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "labeled", "@label": "Check", "@": { "#": "input@checkbox", "@name": "check", "@": "" }
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "checkbox-caption", "@name": "checkbox1", "@value": "checkbox1", "@caption": "checkbox1"
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "radio-caption", "@name": "radio1", "@value": "radio1", "@caption": "radio1"
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "labeled", "@label": "Textarea", "@": { "#": "textarea", "@name": "textarea1" }
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "labeled", "@label": "Date", "@": { "#": "input@date", "@name": "date1" }
                }
            },
            {
                "#": "row", "@class": "", "@": {
                    "#": "labeled", "@label": "Time", "@": { "#": "input@time", "@name": "time1" }
                }
            },
            {
                "#": "row", "@class": "", "@":
                {
                    "#": "pse14", "@":
                        [
                            { "#": "button@button", "@name": "button_button1", "@": "Button button" },
                            { "#": "button@submit", "@name": "button_submit1", "@": "Button submit", "disabled": "" },
                            { "#": "input@button", "@name": "input_button1", "@value": "Input button" },
                            { "#": "input@reset", "@name": "reset1", "@value": "Input reset" },
                            { "#": "input@submit", "@name": "submit1", "@value": "Input submit" },
                        ]
                }
            },
            {
                "#": "row", "@class": "", "@":
                {
                    "#": "pse14", "@class": "col-12", "@":
                        { "#": "button@button", "@name": "button_button1", "@": "Button button", "@class": "col-1" },
                }
            },
            {
                "#": "row", "@class": "", "@":
                {
                    "#": "pse14", "@class": "col-12", "@":
                        { "#": "button@button", "@name": "button_button1", "@": "Button button", "@class": "w100pc" },
                }
            },
            {
                "#": "row", "@class": "", "@":
                {
                    "#": "pse14", "@class": "col-12", "@":
                    {
                        "#": jht.declarationToElement(["div", { "data-abc": "ABC", "data-def": "DEF" }, "XXX"]),
                        "- data-def": null,
                        "+ data-ghi": "GHI",
                    },
                }
            },
        ]
    });

    document.querySelector(".prime").appendChild(contents);

    const schemas = {
        states: {
            columns: [
                { name: "id", type: "number", dstType: "textContent", caption: "ID" },
                { name: "name", type: "string", dstType: "textContent", caption: "Name" },
                { name: "postal_abbr", type: "string", dstType: "textContent", caption: "postal abbreviation" },
                { name: "capital", type: "string", dstType: "textContent", caption: "Capital" },
                { name: "largest", type: "string", dstType: "textContent", caption: "Largest" },
                { name: "established", type: "string", dstType: "textContent", caption: "Established" },
            ]
        }
    }

    // Data source: https://simple.wikipedia.org/wiki/List_of_U.S._states
    const data = {
        states: [
            { id: "1", name: "Alabama", postal_abbr: "AL", capital: "Montgomery", largest: "Birmingham", established: "1819-12-14" },
            { id: "2", name: "Alaska", postal_abbr: "AK", capital: "Juneau", largest: "Anchorage", established: "1959-01-03" },
            { id: "3", name: " Arizona", postal_abbr: "AZ", capital: "Phoenix", largest: "Phoenix", established: "1912-02-14" },
        ],
        dows: [
            { id: "1", name: "Monday", abbr: "Mon" },
            { id: "2", name: "Tuesday", abbr: "Tue" },
            { id: "3", name: "Wednesday", abbr: "Wed" },
            { id: "4", name: "Thursday", abbr: "Thu" },
            { id: "5", name: "Friday", abbr: "Fri" },
            { id: "6", name: "Saturday", abbr: "Sat" },
            { id: "7", name: "Sunday", abbr: "Sun" },
        ]
    }

    jht.stage(data)
        .states.select("select[name='states']").each(function (elem, item) {
            const option = jht.translate({ "#": "option", "@value": item["postal_abbr"], "@": item["name"] });
            elem.appendChild(option);
        })
        ;

})();