import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day14-prod.txt";

type Coordinate = {
  x: number;
  y: number;
};

const parseInput = ({ filePath }: { filePath: string }) => {
  return chainFrom(read(filePath).split("\n"))
    .flatMap((line) => {
      const lineCoordinates = line.split(" -> ").map((c) => {
        const [x, y] = c.split(",");

        return { x: Number.parseInt(x), y: Number.parseInt(y) };
      });

      let stoneStartAndEndCoordinates = [];

      for (let i = 0; i < lineCoordinates.length - 1; i++) {
        const start = lineCoordinates[i];
        const end = lineCoordinates[i + 1];

        /* just so math below works out for adding */
        if (start.x === end.x) {
          /* y must be different */
          if (start.y < end.y) {
            stoneStartAndEndCoordinates.push([start, end]);
          } else {
            stoneStartAndEndCoordinates.push([end, start]);
          }
        } else {
          /* x must be different */
          if (start.x < end.x) {
            stoneStartAndEndCoordinates.push([start, end]);
          } else {
            stoneStartAndEndCoordinates.push([end, start]);
          }
        }
      }

      return chainFrom(stoneStartAndEndCoordinates)
        .flatMap((pair) => {
          const [start, end] = pair;

          if (start.x === end.x) {
            return [...Array(end.y - start.y + 1).keys()].map((_, i) => {
              return {
                x: start.x,
                y: start.y + i,
              };
            });
          } else {
            return [...Array(end.x - start.x + 1).keys()].map((_, i) => {
              return {
                x: start.x + i,
                y: start.y,
              };
            });
          }
        })
        .toArray();
    })
    .toArray();
};

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

class Cave {
  grid: string[][];
  stones: Coordinate[];
  isFull: boolean;
  unitsSandAtRest: number;
  offset: number;
  bounds: Bounds;
  includeFloor: boolean;

  constructor({
    stones,
    includeFloor,
  }: {
    stones: Coordinate[];
    includeFloor?: boolean;
  }) {
    this.grid = new Array<string[]>();
    this.stones = stones;
    this.isFull = false;
    this.unitsSandAtRest = 0;
    this.offset = 0;
    this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    this.includeFloor = !!includeFloor;
  }

  create() {
    this.bounds = this.stones.reduce(
      (bounds, c) => {
        bounds.minX = c.x < bounds.minX ? c.x : bounds.minX;
        bounds.maxX = bounds.maxX < c.x ? c.x : bounds.maxX;
        bounds.maxY = bounds.maxY < c.y ? c.y : bounds.maxY;

        return bounds;
      },
      { minX: Number.MAX_SAFE_INTEGER, maxX: 0, minY: 0, maxY: 0 }
    );

    if (this.includeFloor) {
      this.bounds.maxY = this.bounds.maxY + 2;
      this.bounds.minX = this.bounds.minX - this.bounds.maxY * 3;
      this.bounds.maxX = this.bounds.maxX + this.bounds.maxY * 3;
    }

    this.offset = this.bounds.minX;

    for (let y = 0; y <= this.bounds.maxY; y++) {
      const row = [...Array(this.bounds.maxX - this.offset + 1).keys()].map(
        (_) => "."
      );
      this.grid[y] = row;
    }

    this.grid[0][500 - this.offset] = "+";

    for (const coord of this.stones) {
      this.grid[coord.y][coord.x - this.offset] = "#";
    }

    if (this.includeFloor) {
      for (let x = 0; x < this.bounds.maxX - this.offset + 1; x++) {
        this.grid[this.bounds.maxY][x] = "#";
      }
    }
  }

  dropSand() {
    if (this.isFull) {
      return;
    }

    const sandCoordinate = { x: 500 - this.offset, y: -1 };

    while (true) {
      const nextCoordinate = { x: sandCoordinate.x, y: sandCoordinate.y + 1 };

      if (this._isOffGrid({ coordinate: nextCoordinate })) {
        this.isFull = true;
        break;
      }

      const nextObstacle = this._objectAt({ coordinate: nextCoordinate });

      if (nextObstacle === "." || nextObstacle === "+") {
        /* free to move */
        sandCoordinate.y++;
      } else if (nextObstacle === "#" || nextObstacle === "o") {
        if (nextCoordinate.x === 500 - this.offset && nextCoordinate.y === 0) {
          this.isFull = true;
          break;
        }
        /* blocked! look diagonal left */
        const leftDiag = { x: sandCoordinate.x - 1, y: sandCoordinate.y + 1 };

        const leftObj = this._objectAt({ coordinate: leftDiag });

        if (leftObj === undefined) {
          /* off grid */
          this.isFull = true;
          break;
        } else if (leftObj === ".") {
          /* continue */
          sandCoordinate.x = leftDiag.x;
          sandCoordinate.y = leftDiag.y;
        } else {
          /* blocked, try right */
          const rightDiag = {
            x: sandCoordinate.x + 1,
            y: sandCoordinate.y + 1,
          };

          const rightObj = this._objectAt({ coordinate: rightDiag });

          if (rightObj === undefined) {
            this.isFull = true;
            break;
          } else if (rightObj === ".") {
            /* continue */
            sandCoordinate.x = rightDiag.x;
            sandCoordinate.y = rightDiag.y;
          } else {
            /* this is our home now */
            this.grid[sandCoordinate.y][sandCoordinate.x] = "o";
            this.unitsSandAtRest++;
            break;
          }
        }
      }
    }
  }

  flow(
    { numberOfGrains }: { numberOfGrains: number } = {
      numberOfGrains: Number.MAX_SAFE_INTEGER,
    }
  ) {
    let i = 0;
    while (!this.isFull && i < numberOfGrains) {
      this.dropSand();
      i++;
    }
  }

  render() {
    for (const row of this.grid) {
      console.log(row.join(""));
    }
  }

  _objectAt({ coordinate }: { coordinate: Coordinate }) {
    let object = undefined;
    if (!this._isOffGrid({ coordinate: coordinate })) {
      object = this.grid[coordinate.y][coordinate.x];
    }
    return object;
  }

  _isOffGrid({ coordinate }: { coordinate: Coordinate }) {
    return (
      this.grid.length <= coordinate.y ||
      coordinate.x < 0 ||
      this.grid[0].length <= coordinate.x
    );
  }
}

export const day14Part1 = () => {
  const stones = parseInput({ filePath: dataFilePath });
  const cave = new Cave({ stones: stones });
  cave.create();
  cave.flow();

  return cave.unitsSandAtRest;
};

export const day14Part2 = () => {
  const stones = parseInput({ filePath: dataFilePath });
  const cave = new Cave({ stones: stones, includeFloor: true });
  cave.create();
  cave.flow();

  return cave.unitsSandAtRest;
};
