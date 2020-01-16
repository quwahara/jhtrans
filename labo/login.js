(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    jht.setGlobalReplacement("@class", "");
    const contents = jht.translate({
        "#": "div", "@": [
            {
                "#": "row", "@": [
                    { "#": "col-4", "@": "" },
                    {
                        "#": "col-4", "@class": "w14", "@": [
                            {
                                "#": "row", "@": {
                                    "#": "col-12", "@": {
                                        "#": "h1", "@": "Log in"
                                    }
                                }
                            },
                            {
                                "#": "row", "@": {
                                    "#": "labeled", "@label": "Username", "@target":
                                        { "#": "input@text", "@name": "username" }
                                }
                            },
                            {
                                "#": "row", "@": {
                                    "#": "labeled", "@label": "Password", "@target":
                                        { "#": "input@password", "@name": "password" }
                                }
                            },
                            {
                                "#": "row", "@": [
                                    {
                                        "#": "col-sm-6", "@class": "se14", "@":
                                            { "#": "button@button", "@": "Log in", "@name": "login" }
                                    },
                                    {
                                        "#": "col-sm-6", "@class": "se14", "@":
                                            { "#": "button@button", "@": "Cancel", "@name": "cancel" }
                                    },
                                ]
                            },
                        ]
                    },
                    { "#": "col-4", "@": "" },
                ]
            },
            {
                "#": "center-max320", "@class-inner": "w14", "@": [
                    { "#": "h1", "@": "Log in" },
                    { "#": "labeled", "@label": "Username", "@target": { "#": "input@text", "@name": "username" } },
                    { "#": "labeled", "@label": "Password", "@target": { "#": "input@password", "@name": "password" } },
                    {
                        "#": "row", "@": [
                            {
                                "#": "col-sm-6", "@class": "se14", "@":
                                    { "#": "button@button", "@": "Log in", "@name": "login" }
                            },
                            {
                                "#": "col-sm-6", "@class": "se14", "@":
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