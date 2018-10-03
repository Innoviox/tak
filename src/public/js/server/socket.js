var socket = io();

console.log(Cookies);
console.log(Cookies.get("username"));
if (Cookies.get("username")) {
    $("#username").text(Cookies.get("username"));
}
