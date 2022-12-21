import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day17-prod.txt";

type Coordinate = {
  x: number;
  y: number;
};

const shapeGenerator = function* () {
  const styles = ["-", "+", "L", "|", "s"];

  const gridFor = (style: string) => {
    const grid = new Array<string[]>();

    switch (style) {
      case "-":
        grid[0] = ["@", "@", "@", "@"];
        break;
      case "+":
        grid[0] = [".", "@", "."];
        grid[1] = ["@", "@", "@"];
        grid[2] = [".", "@", "."];
        break;
      case "L":
        grid[0] = ["@", "@", "@"];
        grid[1] = [".", ".", "@"];
        grid[2] = [".", ".", "@"];
        break;
      case "|":
        grid[0] = ["@"];
        grid[1] = ["@"];
        grid[2] = ["@"];
        grid[3] = ["@"];
        break;
      case "s":
        grid[0] = ["@", "@"];
        grid[1] = ["@", "@"];
        break;
      default:
        throw new Error("huh");
    }

    return grid;
  };

  let i = 0;
  while (true) {
    yield gridFor(styles[i]);
    i++;
    if (i === styles.length) {
      i = 0;
    }
  }
};

const jetGenerator = function* (input: string) {
  let i = 0;
  while (true) {
    yield input[i];
    i++;
    if (i === input.length) {
      i = 0;
    }
  }
};

class Chamber {
  grid: string[][];
  shapeGenerator: Generator<string[][], never, unknown>;
  jetGenerator: Generator<string, never, unknown>;
  numberOfStoppedShapes: number;

  fallingShape: string[][];
  fallingShapeCoordinate: Coordinate;

  offset: number;

  /* there may be cycles within the data, so we need to ensure we read the
  entire jet input at least once before we make assumptions about repeats */
  minJetsToRead: number;
  jetsRead: number;

  records: number[];
  snapshots: string[];

  towerHeight: number;

  /* undefined: off grid */
  /* . open */
  /* # stopped shape */

  constructor() {
    const initialGrid = new Array<string[]>();

    /* empty grid */
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));
    initialGrid.push([...Array(7).keys()].map((_) => "."));

    this.grid = initialGrid;
    this.shapeGenerator = shapeGenerator();
    this.jetGenerator = jetGenerator(read(dataFilePath));
    this.numberOfStoppedShapes = 0;

    this.fallingShape = this.shapeGenerator.next().value;
    this.fallingShapeCoordinate = { x: 2, y: 3 };

    this.offset = 0;

    this.minJetsToRead = read(dataFilePath).length;
    this.jetsRead = 0;

    this.records = [0];
    this.snapshots = [""];

    this.towerHeight = 0;
  }

  advance() {
    /* jet rock */
    let maybeNextFallingShapeCoordinate = {
      x: this.fallingShapeCoordinate.x,
      y: this.fallingShapeCoordinate.y,
    };
    switch (this.jetGenerator.next().value) {
      case "<":
        maybeNextFallingShapeCoordinate.x -= 1;
        break;
      case ">":
        maybeNextFallingShapeCoordinate.x += 1;
        break;
      default:
        throw new Error("huh");
    }
    this.jetsRead += 1;

    const canMoveTo = (coordinate: Coordinate) => {
      let canMove = true;
      for (let y = 0; y < this.fallingShape.length; y++) {
        for (let x = 0; x < this.fallingShape[y].length; x++) {
          if (
            this.grid[coordinate.y + y] === undefined ||
            this.grid[coordinate.y + y][coordinate.x + x] === undefined
          ) {
            /* offgrid. do not move */
            return false;
          }

          if (this.grid[coordinate.y + y][coordinate.x + x] === ".") {
            /* the grid has open space here, so we _could_ move if every other position also passes */
            continue;
          }

          if (
            this.grid[coordinate.y + y][coordinate.x + x] === "#" &&
            this.fallingShape[y][x] === "@"
          ) {
            /* the grid is blocked here and we want to move into it. cannot move */
            return false;
          }
        }
      }
      return canMove;
    };

    if (canMoveTo(maybeNextFallingShapeCoordinate)) {
      /* move our shape */
      this.fallingShapeCoordinate = {
        x: maybeNextFallingShapeCoordinate.x,
        y: maybeNextFallingShapeCoordinate.y,
      };
    }

    /* fall */
    maybeNextFallingShapeCoordinate = {
      x: this.fallingShapeCoordinate.x,
      y: this.fallingShapeCoordinate.y - 1,
    };

    /* look ahead */
    if (canMoveTo(maybeNextFallingShapeCoordinate)) {
      /* move our shape */
      this.fallingShapeCoordinate = {
        x: maybeNextFallingShapeCoordinate.x,
        y: maybeNextFallingShapeCoordinate.y,
      };
    } else {
      /* freeze shape */
      for (let y = 0; y < this.fallingShape.length; y++) {
        for (let x = 0; x < this.fallingShape[y].length; x++) {
          if (this.fallingShape[y][x] === "@") {
            this.grid[this.fallingShapeCoordinate.y + y][
              this.fallingShapeCoordinate.x + x
            ] = "#";
          }
        }
      }

      this.numberOfStoppedShapes += 1;

      /* generate new shape */
      this.fallingShape = this.shapeGenerator.next().value;

      this.resizeGridIfNeeded();

      /* place correctly */
      this.fallingShapeCoordinate = {
        x: 2,
        y: this.highestYRock() + 3,
      };
    }
  }

  advanceOneRock() {
    const start = this.numberOfStoppedShapes;

    while (this.numberOfStoppedShapes < start + 1) {
      this.advance();
    }

    this.records.push(this.answer());
  }

  advanceUntil(numberOfRocks: number) {
    while (this.numberOfStoppedShapes < numberOfRocks) {
      this.advanceOneRock();

      const snap = this.snapshot();
      if (
        this.minJetsToRead < this.jetsRead &&
        new Set(this.snapshots).has(snap)
      ) {
        /* we started to repeat and have read all jet data at least once */

        /* find where the corresponding snapshot was first seen */
        const indexOfFirstOccurrence = this.snapshots.findIndex((el) => {
          return el === snap;
        });

        /* what was our height before we started to repeat? */
        const baseline = this.records[indexOfFirstOccurrence - 1];

        /* calculate the length of the repeat interval */
        const intervalLength = this.records.length - 1 - indexOfFirstOccurrence;

        /* we have just detected a repeat, so the last value in `this.records`
        is the _first_ entry in a new interval, so go back one more than
        that. */
        const gainsPerInterval =
          this.records[this.records.length - 2] -
          this.records[indexOfFirstOccurrence - 1];

        const rocksRemaining = numberOfRocks - indexOfFirstOccurrence;

        const quotient = Math.floor(rocksRemaining / intervalLength);

        const remainder = rocksRemaining % intervalLength;

        /* the height we gain by advancing `remainder` number of steps past the
        end of the last interval */
        const remainderGains =
          this.records[indexOfFirstOccurrence + remainder] -
          this.records[indexOfFirstOccurrence - 1];

        console.log("");
        console.log("=========================");
        console.log("minJetsToRead", this.minJetsToRead);
        console.log("jetsRead", this.jetsRead);
        console.log("numberOfRocks", numberOfRocks);
        console.log("numberOfStoppedShapes", this.numberOfStoppedShapes);
        console.log("snapshots.length", this.snapshots.length);
        console.log("records.length", this.records.length);
        console.log("indexOfFirstOccurrence", indexOfFirstOccurrence);
        console.log("baseline", baseline);
        console.log("intervalLength", intervalLength);
        console.log("gainsPerInterval", gainsPerInterval);
        console.log("rocksRemaining", rocksRemaining);
        console.log("quotient", quotient);
        console.log("remainder", remainder);
        console.log("remainderGains", remainderGains);

        this.towerHeight =
          baseline + gainsPerInterval * quotient + remainderGains;
        break;
      } else {
        this.snapshots.push(snap);
      }
    }
  }

  render() {
    const overlaid = new Array<string[]>();

    for (const row of this.grid) {
      overlaid.push(Object.assign([], row));
    }

    for (let y = 0; y < this.fallingShape.length; y++) {
      for (let x = 0; x < this.fallingShape[y].length; x++) {
        if (this.fallingShape[y][x] === ".") {
          /* do nothing */
        } else {
          overlaid[this.fallingShapeCoordinate.y + y][
            this.fallingShapeCoordinate.x + x
          ] = this.fallingShape[y][x];
        }
      }
    }

    for (let y = this.grid.length - 1; 0 <= y; y--) {
      const row = overlaid[y];
      console.log(row.join(""));
    }
  }

  rowsUntilRock(forX?: number) {
    let count = 0;

    for (let y = this.grid.length - 1; 0 <= y; y--) {
      const row = this.grid[y];
      for (let x = 0; x < row.length; x++) {
        const block = row[x];
        if (forX === undefined) {
          /* any x position is fine */
          if (block === "#") {
            return count;
          }
        } else if (forX === x) {
          /* we want a specific x position */
          if (block === "#") {
            return count;
          }
        } else {
          /*  continue */
        }
      }
      count++;
    }
    return count;
  }

  highestYRock() {
    return this.grid.length - this.rowsUntilRock();
  }

  highestBlockedY() {
    return (
      this.grid.length -
      (chainFrom(
        [...Array(7).keys()].map((i) => this.rowsUntilRock(i))
      ).max() || 0)
    );
  }

  resizeGridIfNeeded() {
    /* grid should always be at least 7 higher than the tallest # */
    const headroom = this.rowsUntilRock();

    if (headroom <= 7) {
      for (let i = headroom; 0 <= i; i--) {
        this.grid.push([...Array(7).keys()].map((_) => "."));
      }
    }

    /* if each position is blocked, we can slice off the grid there and record the offset */
    const highest = this.highestBlockedY();
    if (0 < highest) {
      this.offset += highest;
      this.grid.splice(0, highest);
      this.fallingShapeCoordinate.y -= highest;
    }
  }

  answer() {
    return this.highestYRock() + this.offset;
  }

  snapshot() {
    return JSON.stringify({
      grid: this.grid,
      fs: this.fallingShape,
      fsc: this.fallingShapeCoordinate,
    });
  }
}

export const day17Part1 = () => {
  const chamber = new Chamber();
  chamber.advanceUntil(2022);
  return chamber.towerHeight;
};

export const day17Part2 = () => {
  const chamber = new Chamber();
  chamber.advanceUntil(1000000000000);
  return chamber.towerHeight;
};
