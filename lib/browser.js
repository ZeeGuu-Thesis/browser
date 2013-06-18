/*
 * This file contains all browser-specific functions.
 * Note that currently only Google Chrome's functions are complete and tested.
 */

var browser,
    NotImplementedError = function() {
        throw Error("NotImplementedError");
    };

/* Safari */
if (typeof safari !== "undefined") {
    // CONCURRENCY !!!
    var settingsCallbacks = [],
        settings;

    safari.self.addEventListener("message", function(e) {
        if (e.name == "settings") {
            settings = e.message;
            for (var i in settingsCallbacks) {
                settingsCallbacks[i](e.message);
            }
            console.log("got");
        }
    }, false);

    browser = {
        getSettings: function(keys, callback) {
            if (settings) {
                callback(settings);
                return;
            } else if (settingsCallbacks.length === 0) {
                safari.self.tab.dispatchMessage("get_settings", keys);
            }
            settingsCallbacks.push(callback);
            console.log("get");
        },
        setSettings: function(map) {
            safari.self.tab.dispatchMessage("set_settings", map);
        },
        sendMessage: NotImplementedError,
        addMessageListener: NotImplementedError,
        getSelection: NotImplementedError,
        zeeguuUrl: NotImplementedError,
        contextMenu: NotImplementedError,
        setToolbarBadge: NotImplementedError,
        newTab: NotImplementedError
    };

/* Chrome */
} else if ( typeof chrome !== "undefined") {
    browser = {
        getSettings: function(key, callback) {
            chrome.storage.sync.get(key, callback);  // This is necessary because of JavaScript's scoping issues
        },
        setSettings: function(map) {
            chrome.storage.sync.set(map);
        },
        sendMessage: function(name, data, response) {
            if (typeof data == "function") {
                response = data;
                data = {};
            } else if (data === undefined) {
                data = {};
            }
            data.name = name;
            if (response) {
                chrome.extension.sendMessage(data, response);
            } else {
                chrome.extension.sendMessage(data);  // Just passing undefined as the second argument results in a argument normalization error.
            }
        },
        addMessageListener: function(name, callback, respond) {
            if (typeof name == "string") {
                name = [name];
            }
            chrome.extension.onMessage.addListener(function(message, sender, response) {
                if (name.indexOf(message.name) >= 0) {
                    callback(message, sender, response);
                }
                return respond !== undefined;
            });
        },
        broadcast: function(name, data) {
            data = data || {};
            data['name'] = name;
            chrome.windows.getAll({
                populate: true
            }, function(windows) {
                for(var i in windows) {
                    for (var j in windows[i].tabs) {
                        chrome.tabs.sendMessage(windows[i].tabs[j].id, data);
                    }
                }
            });
        },
        getSelection: function() {
            return window.getSelection();
        },
        zeeguuUrl: function(term, context) {
            return chrome.extension.getURL("gui/html/zeeguu.html") + '?' + encodeURIComponent(term.replace(" ", "+") + " " + context);
        },
        contextMenu: function(id, label, contexts, callback) {
            if (typeof contexts == "string") {
                contexts = [contexts];
            }
            chrome.contextMenus.create({
                id: id,
                title: label,
                contexts: contexts
            });
            chrome.contextMenus.onClicked.addListener(callback);
        },
        setToolbarBadge: function(text) {
            chrome.browserAction.setBadgeText({
                text: text
            });
        },
        newTab: function(url) {
            chrome.tabs.create({
                url: url
            });
        }
    };
}
