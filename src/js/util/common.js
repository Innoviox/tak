var LEFT = "<",
    RIGHT = ">",
    UP = "+",
    DOWN = "-",
    DIRS = "<>+-";

var ANIM_STEPS = 10;

var colors = {
    white_piece: new THREE.MeshBasicMaterial({color: 0xd4b375}),
    black_piece: new THREE.MeshBasicMaterial({color: 0x573312}),
    white_cap: new THREE.MeshBasicMaterial({color: 0xd4b375}),
    black_cap: new THREE.MeshBasicMaterial({color: 0x573312}),
    white_sqr: new THREE.MeshBasicMaterial({color: 0xe6d4a7}),
    black_sqr: new THREE.MeshBasicMaterial({color: 0xba6639}),
    inner: new THREE.MeshBasicMaterial({color: 0xc48d44}),
    outer: new THREE.MeshBasicMaterial({color: 0x6f4734}),
    letter: new THREE.MeshBasicMaterial({color: 0xFFF5B5}),
    highlighter: new THREE.LineBasicMaterial({color: 0x0000f0})
};

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
