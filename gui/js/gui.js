/* This file doesn't follow the naming scheme to avoid confusion with /lib/zeeguu.js */

var term;
var context;
var contributed = false;

loadState(function() {
    if(is_logged_in()) {
        var query = decodeURIComponent(window.location.search);
        var space_pos = query.indexOf(" ");
        if (space_pos < 0) {
            window.location = "error.html";
            return;
        }
        term = query.substr(1, space_pos - 1);
        context = query.substr(space_pos + 1);
        console.log("Term: '" + term + "'");
        console.log("Context: '" + context + "'");
        $("#zeeguu").append('<iframe src="' + translationURL(term) + '" name="zeeguu" />');
        log_search(term);
        if (!state.links) {
            $("#toggle-links").addClass("enabled");
        }
    } else {
        window.location = "login.html" + window.location.search;
    }
});

browser.addMessageListener("contribute", function(message) {
    if (contributed) {
        return;
    }
    $("#contribute-text").val(message.term);
});

addStateChangeListener("links", function(links) {
    $("#toggle-links").toggleClass("enabled", !links);
});

function contributeAction() {
    if (contributed) {
        return;
    }
    var translation = $("#contribute-text").val();
    if (translation.length === 0) {
        return;
    }
    contribute(term, translation);
    $("#contribute-text").val("Thanks for contributing!").prop("disabled", true).addClass("success");
    $("#contribute-btn").addClass("disabled");
    contributed = true;
}

$(function() {
    $("#contribute-btn").click(contributeAction);
    $("#contribute-text").keypress(function (e) {
      if (e.which == 13) {  // The return key
        contributeAction();
      }
    });

    $("#toggle-links").click(function() {
        browser.sendMessage("update_state", {
            links: !state.links
        });
    });

    $("#contribute-text").focus();
});
