var ANIMATION_SPEED = 100,
    HEIGHT = 541,
    WIDTH = 740;

var highlight_when_unhighlighting = false,
    zeeguu_active = false,
    selection_mode = false;


loadState(function() {
    // The dictionary frame
    if (window.name == "zeeguu") {
        $(document).mouseup(function() {
            var selection = browser.getSelection();
            var message = selected_term(selection);
            if (message === null) {
                return;
            }
            browser.sendMessage("contribute", message);
        });

        addStateChangeListener("links", function(links) {
            toggle_selection_mode(!links);
        });

        toggle_selection_mode(!state.links);


    // Any frame
    } else {
        var translate_selection = function() {
            var selection = browser.getSelection();
            var message = selected_term(selection);
            if (message === null) {
                return;
            }
            highlight_when_unhighlighting = true;
            browser.sendMessage("translate", message);
        };

        $(document).mouseup(function() {
            if (state.selectionMode) {
                translate_selection();
            }
        }).click(function() {
            if (zeeguu_active) {
                browser.sendMessage("close");
            }
        }).dblclick(function() {
            if (state.fast) {
                translate_selection();
            }
        });

        $(function() {
            if (state.selectionMode) {
                toggle_selection_mode(true);
            }
        });

        browser.addMessageListener("translate", function(data) {
            zeeguu_active = true;
            if (selected_term(browser.getSelection()) !== null) {
                highlight_when_unhighlighting = true;
            }
        });

        addStateChangeListener("selectionMode", function(selectionMode) {
            toggle_selection_mode(selectionMode);
        });

        browser.addMessageListener("unhighlight", function(data) {
            unhighlight();
        });


    // The top frame
        if (window.top == window.self) {
            var closingTimer;
            var dont_close = false;
            var zeeguu_open = false;

            browser.addMessageListener("translate", function(data) {
                dont_close = true;  // Abort the closing timer if it was started before this interaction
                var url = browser.zeeguuUrl(data.term, data.context);
                if (!is_frameset()) {
                    if ($("#zeeguu").size()) {
                        $("#zeeguu").attr("src", url);
                    } else {
                        $("body").append('<iframe src="' + url + '" id="zeeguu" scrolling="no" />');
                        $("#zeeguu").animate({bottom: "0px"}, ANIMATION_SPEED);
                    }
                } else {
                    browser.sendMessage("window", {
                        url: url
                    });
                }
                zeeguu_open = true;
                browser.sendMessage("unhighlight");
                browser.sendMessage("update_state", {
                    selectionMode: false
                });
                window.setTimeout(function() {
                    dont_close = true;  // Abort the closing timer if it was started after this interaction
                }, 200);
            });

            browser.addMessageListener("close", function(data) {
                if (zeeguu_open && !closingTimer) {
                    dont_close = false;
                    window.setTimeout(function() {
                        if (!dont_close) {
                            closingTimer = null;
                            hide_zeeguu();
                            zeeguu_open = false;
                        }
                    }, 200);
                }
            });

            browser.addMessageListener("browser_action", function(data) {
                toggleSelectionModeBox(!selection_mode);
                browser.sendMessage("selection_mode", {
                    enabled: !selection_mode
                });
            });
        }
    }
});

function is_frameset() {
    return !$("body").length;
}

function selected_term(selection) {
    if (!selection.baseNode || selection.baseNode.nodeType != 3) {
        return null;
    }
    var term = selection.toString();
    if (term.length < 1) {
        return null;
    }
    var context = $(selection.baseNode.parentNode).text();
    return {
        term: term,
        context: context
    };
}

function hide_zeeguu(callback) {
    browser.sendMessage("unhighlight");
    if (!is_frameset()) {
        $("#zeeguu").animate({bottom: -HEIGHT}, ANIMATION_SPEED, function() {
            $(this).detach();
            if (callback) {
                callback();
            }
        });
    } else {
        close_zeeguu_window();
    }
}

function scroll_to(element) {
    var offset = $(element).offset().top + $(element).height();
    var scroll = $(document).scrollTop();
    var height = $(window).height();
    var left_offset = $(element).offset().left;
    var body_height = $(document).height();
    if (offset - scroll > height - HEIGHT && left_offset < WIDTH) {
        var target_scroll = offset - height + HEIGHT;
        if (target_scroll > body_height - height) {
            var missing = target_scroll - body_height + height + 100;
            $("body").append('<div style="height:' + missing + 'px;"></div>');
        }
        $('html, body').animate({scrollTop: target_scroll}, ANIMATION_SPEED * 4);
    }
}

function highlight() {
    highlight_when_unhighlighting = false;
    var span = document.createElement("span");
    span.className = "zeeguu-highlight";
    /*
    var wordNode = element.splitText(start);
    wordNode.splitText(end - start);
    span.appendChild(wordNode.cloneNode(true));
    parent.replaceChild(span, wordNode);
    */
    try {
        browser.getSelection().getRangeAt(0).surroundContents(span);
        scroll_to(span);
    } catch (e) {

    }
}

function unhighlight() {
    $(".zeeguu-highlight").addClass("zeeguu-remove");
    if (highlight_when_unhighlighting) {
        highlight();
    }
    $(".zeeguu-remove").each(function() {
        var parent = this.parentNode,
            lastChild = this.lastChild,
            nextlastChild;
        parent.replaceChild(lastChild, this);
        while(this.lastChild) {
            nextlastChild = this.lastChild;
            parent.insertBefore(nextlastChild, lastChild);
            lastChild = nextlastChild;
        }
        parent.normalize();
    });
}

function toggle_selection_mode(new_selection_mode) {
    if (selection_mode == new_selection_mode) {
        return;
    }
    if (new_selection_mode) {
        $("a").each(function(i, e) {
            e = $(e);
            e.attr("data-zeeguu-href", e.attr("href"));
            e.removeAttr("href");
        });
    } else {
        $("a").each(function(i, e) {
            e = $(e);
            e.attr("href", e.attr("data-zeeguu-href"));
            e.removeAttr("data-zeeguu-href");
        });
    }
    selection_mode = new_selection_mode;
}
