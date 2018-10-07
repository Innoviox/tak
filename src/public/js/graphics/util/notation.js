function board_from_tps(tps) {
    var board = [];
    var rows = tps.split(" ")[1].split("/");
    for (idx in rows) {
        board.push([]);
        var sqs = rows[idx].split(",");
        for (sqi in sqs) {
            var sq = sqs[sqi];
            if (sqs.contains("x")) {
                var x = parseInt(sq.charAt(sq.length - 1));
                for (var i = 0; i < x; i++) {
                    board[idx].push(new Square(new Position(idx, sqi + x)));
                }
            } else {
                var nsq = new Square(new Position(idx, sqi));
                for (tile of sq) {
                    if (tile === '1') {
                        nsq.tiles.push(new Tile(WHITE, FLAT));
                    } else {
                        nsq.tiles.push(new Tile(BLACK, FLAT));
                    }
                }
                var last = sq.charAt(sq.length - 1);
                if (last === STAND || last === CAP) {
                    nsq.tiles[nsq.tiles.length - 1].setStone(last);
                }
                board[idx].push(nsq);
            }
        }
    }
    return board;
}

function board_to_tps(board=Board.board) {
    var tps = '[TPS "';

    for (row of board) {
        var x = 0;
        for (sq of row) {
            if (sq.tiles.length === 0) {
                x++;
            } else {
                if (x !== 0) {
                    tps += "x" + x + ",";
                    for (tile of sq.tiles) {
                        if (tile.color === WHITE) {
                            tps += "1";
                        } else {
                            tps += "2";
                        }
                        if (tile.stone !== FLAT) {
                            tps += tile.stone;
                        }
                    }
                    tps += ",";
                }
            }
        }
        if (x !== 0) {
            tps += "x" + x + ",";
        }
        tps += "/";
    }
    tps += ' 1 1"]';
    return tps;
}