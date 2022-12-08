import { read } from "./util";

const dataFilePath = "data/day08-prod.txt";

type Coordinate = {
  x: number;
  y: number;
};

type Forest = number[][];

enum Direction {
  North,
  East,
  South,
  West,
}

const isOffEdge = (coordinate: Coordinate, forest: Forest) => {
  return (
    coordinate.x < 0 ||
    coordinate.y < 0 ||
    forest.length - 1 < coordinate.x ||
    forest[0].length - 1 < coordinate.y
  );
};

const isEdge = (coordinate: Coordinate, forest: Forest) => {
  return (
    coordinate.x === 0 ||
    coordinate.y === 0 ||
    coordinate.x === forest.length - 1 ||
    coordinate.y === forest[0].length - 1
  );
};

const isClearIn = (
  direction: Direction,
  originalTreeHeight: number,
  coordinate: Coordinate,
  forest: Forest
): boolean => {
  if (isOffEdge(coordinate, forest)) {
    return true;
  }

  let [x, y] = [coordinate.x, coordinate.y];
  switch (direction) {
    case Direction.North:
      y--;
      break;
    case Direction.East:
      x++;
      break;
    case Direction.South:
      y++;
      break;
    case Direction.West:
      x--;
      break;
  }

  if (treeAt({ x: x, y: y }, forest) < originalTreeHeight) {
    return isClearIn(direction, originalTreeHeight, { x: x, y: y }, forest);
  }

  return false;
};

const treesUntilBlocked = (
  direction: Direction,
  originalTreeHeight: number,
  coordinate: Coordinate,
  forest: Forest,
  count: number
): number => {
  if (isOffEdge(coordinate, forest)) {
    return count;
  }

  let [x, y] = [coordinate.x, coordinate.y];
  switch (direction) {
    case Direction.North:
      y--;
      break;
    case Direction.East:
      x++;
      break;
    case Direction.South:
      y++;
      break;
    case Direction.West:
      x--;
      break;
  }

  if (isOffEdge({ x: x, y: y }, forest)) {
    return count;
  }

  const nextTreeHeight = treeAt({ x: x, y: y }, forest);

  if (nextTreeHeight < originalTreeHeight) {
    return treesUntilBlocked(
      direction,
      originalTreeHeight,
      { x: x, y: y },
      forest,
      count + 1
    );
  }

  return count + 1;
};

const scenicScore = (coordinate: Coordinate, forest: Forest) => {
  const originalTreeHeight = treeAt(coordinate, forest);

  const northViewingDistance = treesUntilBlocked(
    Direction.North,
    originalTreeHeight,
    coordinate,
    forest,
    0
  );

  const eastViewingDistance = treesUntilBlocked(
    Direction.East,
    originalTreeHeight,
    coordinate,
    forest,
    0
  );

  const southViewingDistance = treesUntilBlocked(
    Direction.South,
    originalTreeHeight,
    coordinate,
    forest,
    0
  );

  const westViewingDistance = treesUntilBlocked(
    Direction.West,
    originalTreeHeight,
    coordinate,
    forest,
    0
  );

  return (
    northViewingDistance *
    eastViewingDistance *
    southViewingDistance *
    westViewingDistance
  );
};

const isTreeVisible = (coordinate: Coordinate, forest: Forest) => {
  if (isEdge(coordinate, forest)) {
    return true;
  } else if (
    isClearIn(Direction.North, treeAt(coordinate, forest), coordinate, forest)
  ) {
    return true;
  } else if (
    isClearIn(Direction.East, treeAt(coordinate, forest), coordinate, forest)
  ) {
    return true;
  } else if (
    isClearIn(Direction.South, treeAt(coordinate, forest), coordinate, forest)
  ) {
    return true;
  } else if (
    isClearIn(Direction.West, treeAt(coordinate, forest), coordinate, forest)
  ) {
    return true;
  }

  return false;
};

const treeAt = (coordinate: Coordinate, forest: Forest) => {
  if (isOffEdge(coordinate, forest)) {
    return 0;
  }

  return forest[coordinate.x][coordinate.y];
};

const makeForest = (rawData: string) => {
  const rows = rawData.split("\n");

  const xMax = rows[0].length;
  const yMax = rows.length;

  const forest = new Array<number[]>();

  for (let x = 0; x < xMax; x++) {
    forest[x] = [...Array(yMax).keys()]; /* these values will be overwritten */
  }

  let y = 0;
  for (const row of rows) {
    let x = 0;
    const heights = row.split("").map((h) => Number.parseInt(h));
    for (const height of heights) {
      forest[x][y] = height;
      x++;
    }
    y++;
  }

  return forest;
};

export const day08Part1 = () => {
  const forest = makeForest(read(dataFilePath));

  let sum = 0;

  for (let x = 0; x < forest.length; x++) {
    for (let y = 0; y < forest[0].length; y++) {
      sum = isTreeVisible({ x: x, y: y }, forest) ? sum + 1 : sum;
    }
  }

  return sum;
};

export const day08Part2 = () => {
  const forest = makeForest(read(dataFilePath));

  let maxScore = 0;

  for (let x = 0; x < forest.length; x++) {
    for (let y = 0; y < forest[0].length; y++) {
      const score = scenicScore({ x: x, y: y }, forest);

      if (maxScore < score) {
        maxScore = score;
      }
    }
  }

  return maxScore;
};
