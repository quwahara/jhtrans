(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    const contents = jht.translate({
        "#": "row", "@": [
            {
                "#": "row", "@": [
                    { "#": "col-4", "@": "" },
                    {
                        "#": "col-4", "@": [
                            {
                                "#": "row", "@": {
                                    "#": "col-12", "@": {
                                        "#": "h1", "@": "Log in", "@class": ""
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
                                        "#": "col-6", "@":
                                            { "#": "button@button", "@": "Log in", "@name": "login" }
                                    },
                                    {
                                        "#": "col-6", "@":
                                            { "#": "button@button", "@": "Cancel", "@name": "cancel" }
                                    },
                                ]
                            },
                        ]
                    },
                    { "#": "col-4", "@": "" },
                ]
            },
        ]
    });

    document.querySelector(".prime").appendChild(contents);
})();