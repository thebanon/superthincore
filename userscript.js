// ==UserScript==
// @name        TinyScript
// @version     0.0.1
// @description A TinyChat Launcher improving moderation, enabling bots, and sharing themes in a compact userscript.
// @author      thebanon
// @license     Copyright (C) thebanon
// @icon        https://i.imgur.com/_______.png
// @match       https://tinychat.com/room/*
// @match       https://tinychat.com/*
// @exclude     https://tinychat.com/settings/*a
// @exclude     https://tinychat.com/subscription/*
// @exclude     https://tinychat.com/promote/*
// @exclude     https://tinychat.com/coins/*
// @exclude     https://tinychat.com/gifts*
// @grant       none
// @run-at      document-start
// @namespace https://greasyfork.org/users/______
// ==/UserScript==

(function() {
    "use strict";

    //WSS
    window.WSS = {};

    window.WSS.con = {};
    window.WSS.con.open = () => {
        if (window.Proxy === undefined) return;
        var handler = {
            set: function(Target, prop, value) {
                if (prop == "onmessage") {
                    var oldMessage = value;
                    value = function(event) {
                        WSS.msg.recv(JSON.parse(event.data), Target);
                        oldMessage(event);
                    };
                }
                return (Target[prop] = value);
            },
            get: function(Target, prop) {
                var value = Target[prop];
                if (prop == "send") {
                    value = function(event) {
                        WSS.msg[prop](JSON.parse(event), Target);
                        Target.send(event);
                    };
                } else if (typeof value == 'function') {
                    value = value.bind(Target);
                }
                return value;
            }
        };
        var WebSocketProxy = new window.Proxy(window.WebSocket, {
            construct: function(Target, args) {
                APP.SocketTarget = new Target(args[0]);
               console.log("SOCKET::CONNECTING", args[0]);
                return new window.Proxy(APP.SocketTarget, handler);
            }
        });
        window.WebSocket = WebSocketProxy;
    }

    window.WSS.msg = {};
    window.WSS.msg.recv = function({tc}) {
        if (typeof API.server.recv[arguments[0].tc] == "function") {
           console.log(("SERVER::" + arguments[0].tc.toUpperCase()), arguments[0]);
            API.server.recv[arguments[0].tc](arguments[0]);
        }
    }
    window.WSS.msg.send = function({tc}) {
        if (typeof API.server.send[arguments[0].tc] == "function") {
           console.log(("CLIENT::" + arguments[0].tc.toUpperCase()), arguments[0]);
            API.server.send[arguments[0].tc](arguments[0]);
        }
    }
    window.WSS.msg.req = ({tc}) => {
        if (arguments[1] === undefined) arguments[1] = "Open Request";
       console.log(("CLIENT::SEND::" + arguments[0].toUpperCase()), arguments[1]);
    }

    //APP
    window.APP = {}

    window.APP.config = {}
    window.window.APP.config.Message = [
        []
    ]
    window.APP.config.version = {
        Major: 0,
        Minor: 0,
        Patch: 1
    }

    window.APP.view = {}
    window.APP.view.room = (params) => {
        console.log("TinyScript::APP.VIEW.ROOM", params);
        clearInterval(APP.ScriptLoading);
        APP.ScriptInit = true;
    }

    //BOT
    window.BOT = {};

    window.BOT.cmd = {}
    window.BOT.cmd.ver = () => {
       console.log("BOT.cmd.ver", window.Version);
    }

    window.BOT.sys = {}
    window.BOT.sys.prompt = function() {
        var UserCommand = arguments[0].match(/^!([a-z0-9]*)(?: ?)(.*)/i);
        if (UserCommand) {
            if (typeof BOT.cmd[UserCommand[1].toLowerCase()] == "function") {
               console.log("COMMAND::" + ((arguments[1]) ? "PM" : "MAIN"), UserCommand[1] + ":" + UserCommand[2]);
               BOT.cmd[UserCommand[1].toLowerCase()](UserCommand[2], arguments[1]);
            }
        }
    }

    //API
    window.API = {};

    window.API.queue = {};
    window.API.queue.add = function() {
        APP.SendQueue.push(arguments[0]);
        API.queue.run();
    };
    window.API.queue.run = function() {
        if (APP.SendQueue !== undefined && APP.SendQueue.length > 0) {
            setTimeout(function() {
                var temp = new Date();
                var OffsetTime = temp - APP.LastMessage;
                if (OffsetTime >= 1500) {
                    APP.LastMessage = new Date();
                    APP.SocketTarget.send(APP.SendQueue[0]);
                    APP.SendQueue.shift();
                }
                API.queue.run();
            }, 1600);
        }
    };

    window.API.server = {};
    window.API.server.recv = {
        joined: function() {
            APP.SocketConnected = true;
        },
        Users: function() {
           console.log(arguments[0]);
        },
        join: function() {
           console.log(arguments[0]);
3        },
        sysmsg: function() {
           console.log(arguments[0]);
        },
        nick: function() {
           console.log(arguments[0]);
        },
        stream_connected: function() {
           console.log(arguments[0]);
        },
        stream_closed: function() {
           console.log(arguments[0]);
        },
        publish: function() {
           console.log(arguments[0]);
        },
        unpublish: function() {
           console.log(arguments[0]);
        },
        ping: function() {
            window.TinychatApp.getInstance().defaultChatroom._chatlog.items = [];
            window.TinychatApp.getInstance().defaultChatroom.packetWorker.queue = {};
        },
        quit: function() {
           console.log(arguments[0]);
        },
        msg: function() {
           console.log(arguments[0]);
        },
        pvtmsg: function() {
           console.log(arguments[0]);
        },
        gift: function() {
           console.log(arguments[0]);
        },
    };
    window.API.server.send = {
        pvtmsg: function() {
           console.log(arguments[0]);
        },
        msg: function() {
            if (APP.ScriptInit) {
                APP.LastMessage = new Date();
                BOT.cmd.prompt(arguments[0].text, false);
            }
        },
        ban: function() {
           console.log(arguments[0]);
        },
        kick: function() {
           console.log(arguments[0]);
        },
        stream_moder_close: function() {
           console.log(arguments[0]);
        }
    };

    //INIT
    Init();
    function Init() {
        console.log(280, "window.init");
        var err_out = 0;
        APP.ScriptLoading = setInterval(function() {
            err_out++;
            var twa = document.querySelector("tinychat-webrtc-app");
            if (twa) {
                if (twa.shadowRoot) {
                    APP.view.room()
                }
            }
            else {
                err_out++;
            }
            if (err_out == 50) {
                clearInterval(APP.ScriptLoading);
                clearInterval(APP.FullLoad);
            }
        }, 200);

        if (!document.URL.match(/^https:\/\/tinychat\.com\/(?:$|#)/i)) {
           console.log("WSS.hook", document.URL);
            new MutationObserver(function() {
                this.disconnect();
                WSS.con.open();
            }).observe(document, {
                subtree: true,
                childList: true
            });
        }

        APP.FullLoad = setInterval(function() {
            if (APP.ScriptInit && APP.SocketConnected) {
                clearInterval(APP.FullLoad);
            }
        }, 500);
    }
})();