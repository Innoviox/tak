function create() {
    vex.closeTop();
    controls.enabled = false;
    vex.dialog.open({
        message: 'Enter your username and password:',
        input: ['<input name="username" type="text" placeholder="Username" required />', '<input name="password" type="password" placeholder="Password" required />'].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {text: 'Create Account'}), $.extend({}, vex.dialog.buttons.NO, {text: 'Back'})
        ],
        callback: function(data) {
            console.log(data);
            if (controls.enabled) {
                console.log("not creating!");
                return;
            }
            controls.enabled = true;
            if (!data) {
                console.log('Cancelled')
            } else {
                $.ajax({
                    type: "GET",
                    url: "/create/",
                    data: data,
                    dataType: "json",
                    success: function() {
                        alert("something!");
                    }, catch  : function() {
                        alert("Looks like that user isn't registered.");
                    }
                });
            }
        },
        className: 'vex-theme-flat-attack'
    });
}

function login() {
    controls.enabled = false;
    vex.dialog.open({
        message: 'Enter your username and password:',
        input: ['<input name="username" type="text" placeholder="Username" required />', '<input name="password" type="password" placeholder="Password" required />'].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {text: 'Login'}), $.extend({}, vex.dialog.buttons.YES, {
                text: 'Create Account',
                click: create,
                className: "vex-dialog-button"
            }), $.extend({}, vex.dialog.buttons.NO, {text: 'Back'})
        ],
        callback: function(data) {
            controls.enabled = true;
            if (!data) {
                console.log('Cancelled')
            } else {
                $.ajax({
                    type: "GET",
                    url: "/login/",
                    data: data,
                    dataType: "json",
                    success: function() {
                        alert("something!");
                    }, catch  : function() {
                        alert("Looks like that user isn't registered.");
                    }
                });
            }
        },
        className: 'vex-theme-flat-attack'
    });
}
