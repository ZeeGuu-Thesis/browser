$(function() {
    loadState(function() {
        $("#dict").val(state.dict);
        $("#from_lang").val(state.from);
        $("#to_lang").val(state.to);
    });

    $("#save").click(function() {
        browser.sendMessage("update_state", {
            dict: $("#dict").val(),
            from: $("#from_lang").val(),
            to: $("#to_lang").val()
        });
        $("#success").show();
        return false;
    });

    $("#reset").click(function() {
        browser.sendMessage("reset_state");
        $("#success").show();
        return false;
    });
});
