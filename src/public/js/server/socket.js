var socket = io();
var user = "guest-" + (
Math.floor(Math.random() * 90000) + 10000);

if (Cookies.get("username")) {
    user = Cookies.get("username");
}

socket.on('connect', function() {
    socket.emit('add-user', user);
});

$("#username").text(user);

socket.on('update-chat', function(username, data) {
    $('#chat').append('<b>' + username + ':</b> ' + data + '<br>');
});

socket.on('update-players', function(data) {
    $('#players').empty();
    $.each(data, function(key, value) {
        $('#players').append('<div>' + key + '</div>');
    });
});

$(function() {
    $('#submit').click(function() {
        var message = $('#message').val();
        $('#message').val('');

        if (message != "" && message != null) {
            socket.emit('send', message);
        }
    });

    $('#message').keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            $('#submit').focus().click();
        }
    });
});
