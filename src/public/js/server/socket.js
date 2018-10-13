console.log("socket loaded!");
const socket = io();
var user = "guest-" + (
Math.floor(Math.random() * 90000) + 10000);
var old_user;
var current_color = WHITE;
var turn = 1, move = 1;
var in_game = false;

function get_current_color() {
    return turn===1?flip_color(current_color):current_color;
}

function logout() {
    $.ajax({
        type: "GET",
        url: "/logout/?username="+user,
        dataType: "json",
        success: function() {
            alert("something!");
        }, catch  : function() {
            alert("Looks like that user isn't registered.");
        }
    });
    user = "guest-" + (
        Math.floor(Math.random() * 90000) + 10000);
    $("#btn-login").attr("onclick", "login(); return false;");
    $("#btn-login").html("Login");
}

function get_user() {
    if (user) {
        old_user = user;
    }
    if (Cookies.get("username")) {
        user = Cookies.get("username");
        $("#btn-login").attr("onclick", "logout(); return false;");
        $("#btn-login").html("Logout");
    }
    socket.emit('remove-user', old_user);
    socket.emit('add-user', user);

    $("#username").text(user);
}

get_user();


function set_current_board(tps) {
    if (tps) {
        Board.board = board_from_tps(tps);
        scene.children = [];
        Board.objects = [];
        Board.tiles = [];
        Board.inner = [];
        Board.moving = [];
        Board.animating = [];
        Board.lifted = [];
        Board.hud_tiles = [];
        Board.create();
        for (idx in Board.objects) {
            var obj = Board.objects[idx];
            obj.receiveShadow = true;
            obj.castShadow = true;
            scene.add(obj);
        }
    }
}

socket.on('update-chat', function(username, data) {
    $('#chat').append('<b>' + username + ':</b> ' + data + '<br>');
    // $("#chat").outerHeight( $("#comments").innerHeight() -  $("#chat").position().top);
});

socket.on('update-players', function(data) {
    console.log("updating players");
    $('#players').empty();
    $.each(data, function(key, value) {
        $('#players').append('<div>' + key + '</div>');
    });
});

socket.on('reload-players', get_user);

socket.on("update-board", function(tps) {
    console.log("recieved tps", tps);
    set_current_board(tps);
});

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

function do_move() {
    console.log("making move");
    socket.emit("made-move", user, Board.create_held().str(), board_to_tps());
}

$("#btn-submit").attr("onclick", "do_move(); return false;");
$("#btn-submit").click(do_move);

socket.on("make-move", function(username, move, tps) {
    if (username !== user) {
        Board.move(Move.create(move));
        Toastify({
            text: username + " made move " + move,
            backgroundColor: "linear-gradient(to right, #a8c0ff, #3f2b96);",
            className: "front",
            duration: 3000,
            close: true
        }).showToast();
        set_current_board(tps);
    } else {
        Toastify({
            text: "Move " + move + " made successfully!",
            backgroundColor: "linear-gradient(to right, #a8c0ff, #3f2b96);",
            className: "front",
            duration: 3000,
            close: true
        }).showToast();
    }
    Board.reset_held();
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