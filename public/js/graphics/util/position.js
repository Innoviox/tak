class Position {
    constructor(x, y) {
        this.x = ctr(x);
        if (this.x === -1) {
            this.x = x;
        }
        if (typeof(y) === 'number') {
            this.y = y;
        } else {
            this.y = parseInt(y) - 1;
        }
    }

    next(dir) {
        if (dir == LEFT) {
            return new Position(this.x - 1, this.y);
        } else if (dir == RIGHT) {
            return new Position(this.x + 1, this.y);
        } else if (dir == UP) {
            return new Position(this.x, this.y - 1);
        } else {
            return new Position(this.x, this.y + 1);
        }
    }

    dir_from(next) {
        if (next.y == this.y) {
            if (next.x - 1 == this.x) {
                return RIGHT;
            } else {
                return LEFT;
            }
        } else {
            if (next.y - 1 == this.y) {
                return DOWN;
            } else {
                return UP;
            }
        }
    }

    equals(pos) {
        return this.x == pos.x && this.y == pos.y;
    }

    clone() {
        return new Position(this.x, this.y);
    }
}
