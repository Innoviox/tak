const CLOSE_ANIM_LENGTH = 500;

$("#chat-close").click(function(e) {
    if ($("#chat-close").val() === "<") {
        $("#comments").animate({left: "-=255px", height: "toggle"}, CLOSE_ANIM_LENGTH, function() {
            $("#chat-close").html(">");
            $("#chat-close").val(">");
        });
        $("#chat-close").animate({left: "-=255px"}, CLOSE_ANIM_LENGTH);
    } else {
        $("#comments").animate({left: "+=255px", height: "toggle"}, CLOSE_ANIM_LENGTH, function() {
            $("#chat-close").html("<");
            $("#chat-close").val("<");
        });
        $("#chat-close").animate({left: "+=255px"}, CLOSE_ANIM_LENGTH);
    }
});

$("#notation-close").click(function(e) {
    if ($("#notation-close").val() === ">") {
        $("#notation").animate({right: "-=255px", height: "toggle"}, CLOSE_ANIM_LENGTH, function() {
            $("#notation-close").html("<");
            $("#notation-close").val("<");
        });
        $("#notation-close").animate({right: "-=255px"}, CLOSE_ANIM_LENGTH);
    } else {
        $("#notation").animate({right: "+=255px", height: "toggle"}, CLOSE_ANIM_LENGTH, function() {
            $("#notation-close").html(">");
            $("#notation-close").val(">");
        });
        $("#notation-close").animate({right: "+=255px"}, CLOSE_ANIM_LENGTH);
    }
});

function toggle() {
    $("#notation-close").click();
    $("#chat-close").click();
}