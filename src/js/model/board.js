var Tile = /** @class */ (function () {
    function Tile() {
    }
    return Tile;
}());
var Square = /** @class */ (function () {
    function Square() {
    }
    return Square;
}());
var Board = /** @class */ (function () {
    function Board(s) {
        this.s = s;
        this.size = s;
        this.board = Square[s][s];
    }
    return Board;
}());
