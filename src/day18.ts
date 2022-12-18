import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day18-prod.txt";

export const day18Part1 = () => {
  /* assume all points are connected */
  const pixelData = chainFrom(read(dataFilePath).split("\n"))
    .map((line) => line.split(","))
    .map((strings) => strings.map((c) => Number.parseInt(c)));

  /* load into 3D grid */
  const grid = pixelData.reduce((acc, [x, y, z]) => {
    if (acc[z] === undefined) {
      acc[z] = new Array<number[]>();
    }

    if (acc[z][y] === undefined) {
      acc[z][y] = new Array<number>();
    }

    acc[z][y][x] = 1;

    return acc;
  }, new Array<number[][]>());

  return pixelData
    .map(([x, y, z]) => {
      /* walk through each checking if they have adjacent neighbors */
      const adjacentNeighbors = [
        [x, y, z - 1],
        [x, y, z + 1],
        [x, y - 1, z],
        [x, y + 1, z],
        [x - 1, y, z],
        [x + 1, y, z],
      ];

      return (
        6 -
        chainFrom(adjacentNeighbors)
          .filter(([nx, ny, nz]) => {
            return (
              grid[nz] !== undefined &&
              grid[nz][ny] !== undefined &&
              grid[nz][ny][nx] === 1
            );
          })
          .count()
      );
    })
    .sum();
};

export const day18Part2 = () => {
  /* assume all points are connected */
  const pixelData = chainFrom(read(dataFilePath).split("\n"))
    .map((line) => line.split(","))
    .map((strings) => strings.map((c) => Number.parseInt(c)))
    .toArray();

  /* add an offset so we can walk and see the outer edges */
  const maxX =
    pixelData
      .map((p) => p[0])
      .sort((a, b) => {
        return b - a;
      })[0] + 5;
  const maxY =
    pixelData
      .map((p) => p[1])
      .sort((a, b) => {
        return b - a;
      })[0] + 5;
  const maxZ =
    pixelData
      .map((p) => p[2])
      .sort((a, b) => {
        return b - a;
      })[0] + 5;

  const initial = [...Array(maxZ + 1).keys()].map((_z) => {
    return [...Array(maxY + 1).keys()].map((_y) => {
      return [...Array(maxX + 1).keys()].map((_x) => {
        return -1;
      });
    });
  });

  /* load into 3D grid */
  const grid = pixelData.reduce((acc, [x, y, z]) => {
    acc[z + 2][y + 2][x + 2] = 1;

    return acc;
  }, initial);

  /* create walker to walk all external empty spaces of the grid. when it bumps
  into an edge, record it */

  let count = 0;

  const startingPoint = { x: 0, y: 0, z: 0 };

  const visited = new Set<string>();
  visited.add(JSON.stringify(startingPoint));

  const seenCand = new Set<string>();
  seenCand.add(JSON.stringify(startingPoint));

  const candidates = [startingPoint];

  while (0 < candidates.length) {
    const candidate = candidates.pop();

    if (candidate === undefined) {
      throw new Error("huh");
    }

    const adjacentNeighbors = [
      { x: candidate.x, y: candidate.y, z: candidate.z - 1 },
      { x: candidate.x, y: candidate.y, z: candidate.z + 1 },
      { x: candidate.x, y: candidate.y - 1, z: candidate.z },
      { x: candidate.x, y: candidate.y + 1, z: candidate.z },
      { x: candidate.x - 1, y: candidate.y, z: candidate.z },
      { x: candidate.x + 1, y: candidate.y, z: candidate.z },
    ];

    /* generate new empty pixels we can move to */
    for (const maybeCandidate of adjacentNeighbors) {
      if (
        0 <= maybeCandidate.x &&
        maybeCandidate.x <= maxX &&
        0 <= maybeCandidate.y &&
        maybeCandidate.y <= maxY &&
        0 <= maybeCandidate.z &&
        maybeCandidate.z <= maxZ &&
        !seenCand.has(JSON.stringify(maybeCandidate)) &&
        grid[maybeCandidate.z][maybeCandidate.y][maybeCandidate.x] === -1
      ) {
        seenCand.add(JSON.stringify(maybeCandidate));
        candidates.push(maybeCandidate);
      }
    }

    /* check all the neighbors: did we run into an edge? */
    for (const neighbor of adjacentNeighbors) {
      if (
        0 <= neighbor.x &&
        neighbor.x <= maxX &&
        0 <= neighbor.y &&
        neighbor.y <= maxY &&
        0 <= neighbor.z &&
        neighbor.z <= maxZ &&
        grid[neighbor.z][neighbor.y][neighbor.x] === 1
      ) {
        count++;
      }
    }

    /* add to visited */
    visited.add(JSON.stringify(candidate));
  }

  return count;
};
