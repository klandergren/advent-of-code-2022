import { read } from "./util";

const dataFilePath = "data/day09-prod.txt";

type Coordinate = {
  x: number;
  y: number;
};

/* the sequence of coordinates represent the position of the head and any
subsequent knots */
type Rope = Coordinate[];

const isKnotWithinOneBlockPerimeter = ({
  headCoordinate,
  knotCoordinate,
}: {
  headCoordinate: Coordinate;
  knotCoordinate: Coordinate;
}) => {
  const pointsToCheck = [
    {
      x: headCoordinate.x - 1,
      y: headCoordinate.y - 1,
    },
    {
      x: headCoordinate.x,
      y: headCoordinate.y - 1,
    },
    {
      x: headCoordinate.x + 1,
      y: headCoordinate.y - 1,
    },
    {
      x: headCoordinate.x - 1,
      y: headCoordinate.y,
    },
    {
      x: headCoordinate.x,
      y: headCoordinate.y,
    },
    {
      x: headCoordinate.x + 1,
      y: headCoordinate.y,
    },
    {
      x: headCoordinate.x - 1,
      y: headCoordinate.y + 1,
    },
    {
      x: headCoordinate.x,
      y: headCoordinate.y + 1,
    },
    {
      x: headCoordinate.x + 1,
      y: headCoordinate.y + 1,
    },
  ];

  const possiblePoints = new Set(pointsToCheck.map((c) => JSON.stringify(c)));

  /* use JSON.stringify() to avoid object reference comparison */
  return possiblePoints.has(JSON.stringify(knotCoordinate));
};

const generateCoordinatesFrom = (fileContents: string) => {
  const instructions = fileContents.split("\n");

  let coords: Coordinate[] = [];

  let startingCoordinate = { x: 0, y: 0 };

  for (const instruction of instructions) {
    const [direction, steps] = instruction.split(" ");
    const numSteps = Number.parseInt(steps);

    let nextSequence: Coordinate[] = [];
    switch (direction) {
      case "R":
        nextSequence = [...Array(numSteps).keys()].map((_, i) => {
          return {
            x: startingCoordinate.x + i + 1,
            y: startingCoordinate.y,
          };
        });
        break;
      case "U":
        nextSequence = [...Array(numSteps).keys()].map((_, i) => {
          return {
            x: startingCoordinate.x,
            y: startingCoordinate.y - i - 1,
          };
        });
        break;

      case "L":
        nextSequence = [...Array(numSteps).keys()].map((_, i) => {
          return {
            x: startingCoordinate.x - i - 1,
            y: startingCoordinate.y,
          };
        });
        break;
      case "D":
        nextSequence = [...Array(numSteps).keys()].map((_, i) => {
          return {
            x: startingCoordinate.x,
            y: startingCoordinate.y + i + 1,
          };
        });
        break;
    }

    startingCoordinate = nextSequence[nextSequence.length - 1];
    coords = coords.concat(nextSequence);
  }

  return coords;
};

const moveRope = ({
  rope,
  toCoordinate,
  index = 0 /* for debugging */,
}: {
  rope: Rope;
  toCoordinate: Coordinate;
  index?: number;
}): Coordinate[] => {
  /* always move the head */
  rope[0] = toCoordinate;

  if (rope.length === 1) {
    /* our rope is at its destination */
    return rope;
  }

  /* we have at least one trailing knot! */
  let knotCoordinate = { x: rope[1].x, y: rope[1].y };

  /* do we need to move anything else? */
  if (
    isKnotWithinOneBlockPerimeter({
      headCoordinate: rope[0],
      knotCoordinate: knotCoordinate,
    })
  ) {
    /* no additional movement needed */
    return rope;
  }

  /* (at least) the next knot needs to move. figure out the next coordinate */
  let nextToCoordinate = { x: 0, y: 0 };

  if (
    toCoordinate.x === knotCoordinate.x ||
    toCoordinate.y === knotCoordinate.y
  ) {
    /* If the head is ever two steps directly up, down, left, or right from the
      tail, the tail must also move one step in that direction */
    if (toCoordinate.x === knotCoordinate.x) {
      nextToCoordinate = {
        x: toCoordinate.x,
        y: (toCoordinate.y + knotCoordinate.y) / 2,
      };
    } else {
      nextToCoordinate = {
        x: (toCoordinate.x + knotCoordinate.x) / 2,
        y: knotCoordinate.y,
      };
    }
  } else {
    /* Otherwise, if the head and tail aren't touching and aren't in the same
       row or column, the tail always moves one step diagonally to keep up: */
    if (Math.abs(toCoordinate.x - knotCoordinate.x) === 1) {
      nextToCoordinate = {
        x: toCoordinate.x,
        y: (toCoordinate.y + knotCoordinate.y) / 2,
      };
    } else if (Math.abs(toCoordinate.y - knotCoordinate.y) === 1) {
      nextToCoordinate = {
        x: (toCoordinate.x + knotCoordinate.x) / 2,
        y: toCoordinate.y,
      };
    } else {
      /* note: I did not initially handle this condition correctly, leading to
      test data passing but not real data. tore my hair out lol. debugged via
      printing board and comparing. */
      nextToCoordinate = {
        x: (toCoordinate.x + knotCoordinate.x) / 2,
        y: (toCoordinate.y + knotCoordinate.y) / 2,
      };
    }
  }

  /* remove the head (which is already moved) and only focus on moving the
  remaining rope segment */
  rope.shift();

  return [toCoordinate].concat(
    moveRope({ rope: rope, toCoordinate: nextToCoordinate, index: index + 1 })
  );
};

const countUniqueLocations = ({
  ropeLength,
  ofKnotIndex,
}: {
  ropeLength: number;
  ofKnotIndex: number;
}) => {
  /* generate a starting rope with head and knots all at origin */
  let rope = [...Array(ropeLength).keys()].map((_) => {
    return {
      x: 0,
      y: 0,
    };
  });

  /* record all coordinates that a knot passes through */
  const movements = new Map<number, Coordinate[]>();

  /* record the initial coordinates */
  for (let i = 0; i < rope.length; i++) {
    let coordinates = movements.get(i) || [];
    coordinates.push(rope[i]);
    movements.set(i, coordinates);
  }

  /* move the rope through every coordinate enumerated by the instructions */
  for (const coordinate of generateCoordinatesFrom(read(dataFilePath))) {
    rope = moveRope({ rope: rope, toCoordinate: coordinate });

    /* record the new coordinates */
    for (let i = 0; i < rope.length; i++) {
      let coordinates = movements.get(i) || [];
      coordinates.push(rope[i]);
      movements.set(i, coordinates);
    }
  }

  return new Set(
    (movements.get(ofKnotIndex) || []).map((x) => JSON.stringify(x))
  ).size;
};

export const day09Part1 = () => {
  return countUniqueLocations({ ropeLength: 2, ofKnotIndex: 1 });
};

export const day09Part2 = () => {
  return countUniqueLocations({ ropeLength: 10, ofKnotIndex: 9 });
};

const printBoard = ({
  rope,
  maxX,
  maxY,
  zeroZero,
}: {
  rope: Rope;
  maxX: number;
  maxY: number;
  zeroZero: Coordinate;
}) => {
  const board = new Array<string[]>();

  for (let y = 0; y < maxY; y++) {
    board[y] = [...Array(maxX).keys()].map((_) => ".");
  }

  for (let i = rope.length - 1; 0 <= i; i--) {
    let title = i === 0 ? "H" : `${i}`;

    const knotCoordinate = rope[i];

    const translatedX = knotCoordinate.x - zeroZero.x;
    const translatedY = knotCoordinate.y + zeroZero.y;

    board[translatedY][translatedX] = title;
  }

  for (const row of board) {
    console.log(row.join(""));
  }

  console.log("\n");
};
