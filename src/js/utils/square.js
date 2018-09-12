class Square {
    constructor(pos) {
        this.pos = pos;
        this.tiles = new Array();
        this.upped = 0;
        this.clicked = 0;
    }

    add(tile) {
        if (this.tiles.length == 0 || (this.tiles.length > 0 && this.tiles[this.tiles.length - 1].stone == FLAT)) {
            this.tiles.push(tile);
            tile.pos = this.pos;
        } else {
            //TODO: tile is not flat
        }
    }

    next(dir) {
        return Board.tile_at(this.pos.next(dir));
    }

    up() {
        if (this.upped < this.tiles.length) {
            return ++this.upped;
        }
        return --this.upped;
    }

    click() {
        this.clicked = (++this.clicked) % (this.tiles.length + 1);
        return this.clicked;
    }

    equals(sq) {
        return this.pos.equals(sq.pos);
    }
}
