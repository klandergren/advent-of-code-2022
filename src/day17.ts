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

  advanceUntil(numberOfRocks: number) {
    while (this.numberOfStoppedShapes < numberOfRocks) {
      this.advance();
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
}

export const day17Part1 = () => {
  const chamber = new Chamber();
  chamber.advanceUntil(2022);
  chamber.render();
  return chamber.answer();
};

export const day17Part2 = () => {
  return -1;
};
