console.log("socket loaded!");
var socket = io();
var user = "guest-" + (
Math.floor(Math.random() * 90000) + 10000);
var old_user;
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

socket.on('login-correct-toaster', function() {
    Toastify({text: "Logged in successfully!", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", className: "front", duration: 300000}).showToast();
});

/*
background: rgb(253,75,29);
background: linear-gradient(90deg, rgba(253,75,29,1) 34%, rgba(252,248,69,1) 100%);
*/

$(function() {
    $('#submit').click(function() {
        var message = $('#message').val();
        $('#message').val('');

        if (message != "" && message != null) {
            socket.emit('send', message);
        }
        $("#message").focus();
    });

    $('#message').keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            $('#submit').focus().click();
            $("#message").focus();
        }
    });
});
