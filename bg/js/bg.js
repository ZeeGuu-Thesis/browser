var PERSITENT_STATE_KEYS = ["dict", "from", "to", "links", "fast", "session"];

var zeeguu_window = null,
    state;

function getState(callback) {
    if (state) {
        if (callback) {
            callback(state);
        }
        return;
    }
    browser.getSettings(PERSITENT_STATE_KEYS, function(items) {
        state = {
            dict: items.dict || "http://{from}-{to}.syn.dict.cc/?s={query}",
            from: items.from || "de",
            to: items.to || "en",
            session: items.session || -1,
            links: items.links,
            fast: items.fast || false,  // translate with double-click
            selectionMode: false
        };
        if (callback) {
            callback(state);
        }
    });
}

function storeState() {
    var persitentState = {};
    $.each(state, function(i, v) {
        if (PERSITENT_STATE_KEYS.indexOf(i) >= 0) {
            persitentState[i] = v;
        }
    });
    browser.setSettings(persitentState);
    console.log(persitentState);
}

browser.addMessageListener("window", function(message, sender) {
    if (zeeguu_window) {
        chrome.windows.remove(zeeguu_window.id);
    }
    chrome.windows.create({
        url: message.url,
        width: 734,
        height: 500,
        focused: true,
        type: "popup"
    }, function(window) {
        zeeguu_window = window;
  });
});

browser.addMessageListener("get_state", function(message, sender, response) {
    getState(function(state) {
        response(state);
    });
}, true);

browser.addMessageListener("update_state", function(message) {
    console.log(message);
    $.extend(true, state, message);
    browser.broadcast("state", {
        state: state
    });
    browser.setToolbarBadge(state.selectionMode ? "!" : "");
    storeState();
});

chrome.extension.onMessage.addListener(function(message, sender) {
    if (message.name != "window" && message.name != "update_state" && message.name != "get_state") {
        chrome.tabs.sendMessage(sender.tab.id, message);
    }
});

browser.contextMenu("translate", "Translate %s", "selection", function(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        name: "translate",
        term: info.selectionText,
        context: ""
    });
});

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});

getState();
