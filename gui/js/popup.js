$(function() {
    $("#translate").focus();  // This doesn't do anything due to a bug in Chrome.
                              // Instead the 'tabindex' attribute is used to achieve the same effect.
    var originalHelp = $("#help").text();

    function setHelp(selector, helpText) {
        $(selector).on("mouseover focus", function() {
            $("#help").text(helpText);
        }).on("mouseout blur", function() {
            $("#help").text(originalHelp);
        });
    }

    function translate(term) {
        if (term.length > 0) {
            window.location = browser.zeeguuUrl(term);
        }
    }

    setHelp("#fast-mode", "Translate by double-clicking");
    setHelp("#selection-mode", "Disable links for easier selection");
    setHelp("#options-btn", "Open options");

    loadState(function() {
        $("#fast-mode").toggleClass("enabled", state.fast).click(function() {
            state.fast = !state.fast;
            browser.sendMessage("update_state", {
                fast: state.fast
            });
            $(this).toggleClass("enabled", state.fast);
        });

        $("#selection-mode").toggleClass("enabled", state.selectionMode).click(function() {
            state.selectionMode = !state.selectionMode;
            browser.sendMessage("update_state", {
                selectionMode: state.selectionMode
            });
            $(this).toggleClass("enabled", state.selectionMode);
        });

        $("#translate").keypress(function (e) {
          if (e.which == 13) {  // The return key
            translate($(this).val());
          }
        });

        $("#translate-btn").click(function() {
            translate($("#translate").val());
        });

        $("#options-btn").click(function() {
            browser.newTab("/gui/html/options.html");
        });
    });
});
