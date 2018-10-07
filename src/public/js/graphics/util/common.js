var LEFT = "<",
    RIGHT = ">",
    UP = "+",
    DOWN = "-",
    DIRS = "<>+-";

var ANIM_STEPS = 10;

function ctr(c) {
    var a = 'ABCDE'.indexOf(c);
    if (a == -1) {
        return 'abcde'.indexOf(c);
    }
    return a;
}

function rtc(r) {
    return 'ABCDE'.charAt(r);
}

function flip_color(c) {
    return c==WHITE?BLACK:WHITE;
}

module.exports = [LEFT, RIGHT, UP, DOWN, DIRS, ANIM_STEPS, ctr, rtc, flip_color];