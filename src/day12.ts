import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day12-prod.txt";

type Coordinate = {
  x: number;
  y: number;
};

type Grid = number[][];

type Board = {
  grid: Grid;
  possibleStarts: Coordinate[];
  start: Coordinate;
  end: Coordinate;
};

const loadBoard = (): Board => {
  const lines = read(dataFilePath).split("\n");

  let grid = new Array<number[]>();

  for (let y = 0; y < lines.length; y++) {
    grid[y] = [...Array(lines[0].split("").length).keys()].map((_) => -1);
  }

  let possibleStarts = [];
  let start = { x: -1, y: -1 };
  let end = { x: -1, y: -1 };
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    const row = line.split("");
    for (let x = 0; x < row.length; x++) {
      const indicator = row[x];

      let height = -1;
      if (indicator === "S") {
        start.x = x;
        start.y = y;
        height = 1;
        possibleStarts.push(start);
      } else if (indicator === "E") {
        end.x = x;
        end.y = y;
        height = 26;
      } else {
        height = indicator.charCodeAt(0) - 96;

        if (height === 1) {
          possibleStarts.push({ x: x, y: y });
        }
      }

      grid[y][x] = height;
    }
  }

  return {
    grid: grid,
    possibleStarts: possibleStarts,
    start: start,
    end: end,
  };
};

/* implementation derived from psuedo-code at https://en.wikipedia.org/wiki/A*_search_algorithm */
const aStar = (board: Board) => {
  const reconstructPath = (
    cameFrom: Map<string, Coordinate>,
    fromCoordinate: Coordinate
  ) => {
    const totalPath: Coordinate[] = [];

    let currentCoordinate: Coordinate | undefined = fromCoordinate;

    while (currentCoordinate) {
      totalPath.unshift(currentCoordinate);
      currentCoordinate = cameFrom.get(JSON.stringify(currentCoordinate));
    }

    return totalPath;
  };

  const neighbors = (c: Coordinate) => {
    const cHeight = board.grid[c.y][c.x];

    return [
      { x: c.x, y: c.y - 1 },
      { x: c.x + 1, y: c.y },
      { x: c.x, y: c.y + 1 },
      { x: c.x - 1, y: c.y },
    ].filter((n) => {
      return (
        0 <= n.x &&
        n.x < board.grid[0].length &&
        0 <= n.y &&
        n.y < board.grid.length &&
        board.grid[n.y][n.x] <= cHeight + 1 /* height requirement */
      );
    });
  };

  const heuristic = (coordinate: Coordinate) => {
    const d1 = Math.abs(board.end.x - coordinate.x);
    const d2 = Math.abs(board.end.y - coordinate.y);

    return d1 + d2;
  };

  const openSet = [board.start];

  const cameFrom = new Map<string, Coordinate>();

  const gScore = new Map<string, number>();
  gScore.set(JSON.stringify(board.start), 0);

  const getGScore = (coordinate: Coordinate) => {
    const score = gScore.get(JSON.stringify(coordinate));
    return score === undefined ? Number.MAX_SAFE_INTEGER : score;
  };

  const fScore = new Map<string, number>();
  fScore.set(JSON.stringify(board.start), heuristic(board.start));

  const getFScore = (coordinate: Coordinate) => {
    const score = fScore.get(JSON.stringify(coordinate));
    return score === undefined ? Number.MAX_SAFE_INTEGER : score;
  };

  while (openSet.length !== 0) {
    const current = chainFrom(openSet).min((c) => getFScore(c));

    if (current === null) {
      throw new Error("current is null");
    }

    if (current.x === board.end.x && current.y === board.end.y) {
      return reconstructPath(cameFrom, current);
    }

    const indexOfCurrent = openSet.findIndex(
      (c) => c.x === current.x && c.y === current.y
    );

    if (indexOfCurrent === -1) {
      throw new Error("index of current not found");
    }

    /* delete */
    openSet.splice(indexOfCurrent, 1);

    for (const neighbor of neighbors(current)) {
      const tentativeGScore = getGScore(current);

      if (tentativeGScore < getGScore(neighbor)) {
        cameFrom.set(JSON.stringify(neighbor), current);
        gScore.set(JSON.stringify(neighbor), tentativeGScore);
        fScore.set(
          JSON.stringify(neighbor),
          tentativeGScore + heuristic(neighbor)
        );

        const indexOfNeighbor = openSet.findIndex(
          (c) => c.x === neighbor.x && c.y === neighbor.y
        );

        if (indexOfNeighbor === -1) {
          openSet.push(neighbor);
        }
      }
    }
  }

  /* do not assume that every starting point has a valid path. choose some
     value higher than our current upper bound from part 1 */
  return [...Array(1000).keys()].map((_) => {
    return {
      x: -1,
      y: -1,
    };
  });
};

export const day12Part1 = () => {
  const b = loadBoard();

  const path = aStar(b);

  return path.length - 1;
};

export const day12Part2 = () => {
  const b = loadBoard();

  return chainFrom(b.possibleStarts)
    .map((start) => {
      const newB = b;
      newB.start = start;

      return aStar(newB).length - 1;
    })
    .min();
};
