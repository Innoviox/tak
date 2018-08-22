"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_collections_1 = require("typescript-collections");
;
;
class Square {
    constructor(pos, tiles) {
        this.pos = pos;
        this.tiles = tiles && new typescript_collections_1.LinkedList();
    }
    add(tile) {
        if (this.tiles && this.tiles.last().stone == "F") {
            this.tiles.add(tile);
        }
        else {
        }
    }
}
class Board {
    constructor(s) {
        this.s = s;
        this.size = s;
        this.board = Square[s][s];
    }
    addTile(pos, tile) {
        this.board[pos.x][pos.y].add(tile);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1FQUFrRDtBQUVYLENBQUM7QUFDYSxDQUFDO0FBYXRELE1BQU0sTUFBTTtJQUlWLFlBQVksR0FBYSxFQUFFLEtBQXdCO1FBQ2pELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxtQ0FBVSxFQUFRLENBQUM7SUFDL0MsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFVO1FBQ1osSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxPQUFjLEVBQUU7WUFDdkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEI7YUFBTTtTQUVOO0lBQ0gsQ0FBQztDQUNGO0FBRUQsTUFBTSxLQUFLO0lBSVQsWUFBbUIsQ0FBUztRQUFULE1BQUMsR0FBRCxDQUFDLENBQVE7UUFDMUIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQWEsRUFBRSxJQUFVO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUNGIn0=