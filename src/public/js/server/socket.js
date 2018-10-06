console.log("socket loaded!");
const socket = io();
var user = "guest-" + (
Math.floor(Math.random() * 90000) + 10000);
var old_user;
const CLOSE_ANIM_LENGTH = 500;

function get_user() {
    if (user) {
        old_user = user;
    }
    if (Cookies.get("username")) {
        user = Cookies.get("username");
    }
    socket.emit('remove-user', old_user);
    socket.emit('add-user', user);

    $("#username").text(user);
}

get_user();

socket.on('update-chat', function(username, data) {
    $('#chat').append('<b>' + username + ':</b> ' + data + '<br>');
});

socket.on('update-players', function(data) {
    console.log("updating players");
    $('#players').empty();
    $.each(data, function(key, value) {
        $('#players').append('<div>' + key + '</div>');
    });
});

socket.on('reload-players', get_user);

socket.on('login-toaster', function(username, auth) {
    if (username === user) {
        if (auth === 'true') {
            Toastify({text: "Logged in successfully!", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", className: "front", duration: 3000, close: true}).showToast();
        } else {
            Toastify({text: "Login failed.", backgroundColor: "linear-gradient(to right, #fd4b1d, #f47d41)", className: "front", duration: 3000, close: true}).showToast();
        }
    }
});

socket.on('create-toaster', function(username, auth) {
    if (username === user) {
        if (auth === 'true') {
            Toastify({text: "Account created successfuly!", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", className: "front", duration: 3000, close: true}).showToast();
        } else {
            Toastify({text: "Account creation failed. Please contact a system admin ASAP.", backgroundColor: "linear-gradient(to right, #fd4b1d, #f47d41)", className: "front", duration: 3000, close: true}).showToast();
        }
    }
});

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

$(function() {
    $('#submit').click(function() {
        var message = $('#message').val();
        $('#message').val('');

        if (message !== "" && message != null) {
            socket.emit('send', message);
        }
        $("#message").focus();
    });

    $('#message').keypress(function(e) {
        if (e.which === 13) {
            $(this).blur();
            $('#submit').focus().click();
            $("#message").focus();
        }
    });
});
