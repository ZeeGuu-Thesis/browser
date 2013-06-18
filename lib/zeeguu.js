var API_URL = "http://localhost:5000/";
API_URL = "http://sla.unibe.ch/";
var state,
    stateChangeListeners = {};

/* Any calls to the functions below require the state to be loaded */
function loadState(callback) {
    browser.sendMessage("get_state", function(message) {
        state = message;
        console.log(state);
        callback(state);
        browser.addMessageListener("state", function(message, sender) {
            for (var i in message.state) {
                if (message.state[i] != state[i] && stateChangeListeners[i]) {
                    stateChangeListeners[i](message.state[i]);
                }
            }
            state = message.state;
            console.log(message, sender);
        });
    });
}

function addStateChangeListener(item, callback) {
    stateChangeListeners[item] = callback;
}

function translationURL(term) {
    var url = state.dict.replace("{from}", state.from).replace("{to}", state.to).replace("{query}", encodeURIComponent(term));
    if (!state.links) {
        url = url + (url.indexOf("?") == -1 ? "?" : "&") + "__ZEEGUU_DISABLE_LINKS__";
    }
    return url;
}

function log_search(term) {
    $.post(API_URL + "lookup/" + state.from + "/" + term + "/" + state.to + "?session=" + state.session);
}

function contribute(from_term, to_term) {
    $.post(API_URL + "contribute/" + state.from + "/" + from_term + "/" + state.to + "/" + to_term + "?session=" + state.session);
}

function is_logged_in() {
    return state.session !== null;
}

function login(email, password, callback) {
    $.post(API_URL + "session/" + encodeURIComponent(email), {
        password: password
    })
    .done(function(data) {
        var sessionID = parseInt(data, 10);
        browser.sendMessage("update_state", {
            "session": sessionID
        });
        callback(true);
    })
    .fail(function() {
        callback(false);
    });
}

function register(email, password, callback) {
    $.post(API_URL + "adduser/" + encodeURIComponent(email), {password: password})
    .done(function(data) {
        SESSION_ID = parseInt(data, 10);
        browser.setSettings({"session": SESSION_ID});
        callback(true);
    })
    .fail(function() {
        callback(false);
    });
}
