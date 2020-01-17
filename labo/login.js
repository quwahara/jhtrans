(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");
    const contents = jht.translate({
        "#": "div", "@": [
            {
                "#": "center-max320", "@class-inner": "pw14", "@": [
                    { "#": "h1", "@": "Log in", "@class": "pse14" },
                    { "#": "labeled", "@label": "Username", "@target": { "#": "input@text", "@name": "username" } },
                    { "#": "labeled", "@label": "Password", "@target": { "#": "input@password", "@name": "password" } },
                    {
                        "#": "row", "@": [
                            {
                                "#": "col-sm-6", "@class": "pse14", "@":
                                    { "#": "button@button", "@": "Log in", "@name": "login" }
                            },
                            {
                                "#": "col-sm-6", "@class": "pse14", "@":
                                    { "#": "button@button", "@": "Cancel", "@name": "cancel" }
                            },
                        ]
                    }
                ]
            }
        ]
    });

    document.querySelector(".prime").appendChild(contents);
})();