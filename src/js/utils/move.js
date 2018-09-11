class Move {
    constructor(total, stone, pos, moves, dir) {
        this.total = total;
        this.stone = stone;
        this.pos = pos;
        this.moves = moves;
        this.dir = dir;
    }

    static create(str) {
        var dir = undefined;
        for (i = 0, c = ''; c = DIRS.charAt(i); i++) {
            if (str.includes(c)) {
                dir = c;
                str = str.split(c);
                break;
            }
        }

        if (dir == undefined) {
            var s = str.padStart(3, "F");
            return new Move(1, s.charAt(0), new Position(s.charAt(1), s.charAt(2)), [], undefined);
        }

        if (moves.length == 0) {
            moves.push(str[0][0]);
        }
        var m_str = str[0];
        var total;
        if (m_str.charAt(0).match(/[0-9]/i)) {
            total = parseInt(m_str.charAt(0));
            m_str = m_str.slice(1);
        } else {
            total = 1;
        }
        var pos = new Position(m_str.charAt(0), m_str.charAt(1));
        return new Move(total, undefined, pos, moves, dir);
    }
}
