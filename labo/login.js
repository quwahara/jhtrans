(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");
    const contents = jht.translate({
        "#": "center-max320", "@class-inner": "pw14", "@": [
            { "#": "h1", "@": "Log in", "class +": "pse14" },
            { "#": "labeled", "@label": "Username", "@": { "#": "input@text", "name": "username" } },
            { "#": "labeled", "@label": "Password", "@": { "#": "input@password", "name": "password" } },
            {
                "#": "row", "@": [
                    {
                        "#": "col-sm-6", "class +": "pse14", "@":
                            { "#": "button@button", "class +": "w100pc", "@": "Log in", "name": "login" }
                    },
                    {
                        "#": "col-sm-6", "class +": "pse14", "@":
                            { "#": "button@button", "class +": "w100pc", "@": "Cancel", "name": "cancel" }
                    },
                ]
            }
        ]
    });

    document.querySelector(".prime").appendChild(contents);
})();