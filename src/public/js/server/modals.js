function login() {
    vex.dialog.open({
        message: 'Enter your username and password:',
        input: ['<input name="username" type="text" placeholder="Username" required />', '<input name="password" type="password" placeholder="Password" required />'].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {text: 'Login'}), $.extend({}, vex.dialog.buttons.NO, {text: 'Back'})
        ],
        callback: function(data) {
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
                    },
                    catch: function() {
                        alert("Looks like that user isn't registered.");
                    }
                });
            }
        },
        className: 'vex-theme-flat-attack'
    })
}