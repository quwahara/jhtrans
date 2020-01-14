(function () {
    "use strict";

    const jht = new Jhtrans();
    jht.putTemplateAll(basicTemplates);

    const contents = jht.translate({
        "#": "row", "@class": "", "@": [
            {
                "#": "row", "@class": "", "@": [
                    { "#": "col-4", "@class": "", "@": "" },
                    {
                        "#": "col-4", "@class": "w14", "@": [
                            {
                                "#": "row", "@class": "", "@": {
                                    "#": "col-12", "@class": "", "@": {
                                        "#": "h1", "@": "Log in", "@class": ""
                                    }
                                }
                            },
                            {
                                "#": "row", "@class": "", "@": {
                                    "#": "labeled", "@label": "Username", "@target":
                                        { "#": "input@text", "@name": "username" }
                                }
                            },
                            {
                                "#": "row", "@class": "", "@": {
                                    "#": "labeled", "@label": "Password", "@target":
                                        { "#": "input@password", "@name": "password" }
                                }
                            },
                            {
                                "#": "row", "@class": "", "@": [
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
                    { "#": "col-4", "@class": "", "@": "" },
                ]
            },
        ]
    });

    document.querySelector(".prime").appendChild(contents);
})();