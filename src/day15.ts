import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day15-prod.txt";

type Coordinate = {
  x: number;
  y: number;
};

type Reading = {
  sensor: Coordinate;
  closestBeacon: Coordinate;
  manhattanDistance: number;
  covered?: Coordinate[];
};

const containedWithin = (r: Reading, testCoord: Coordinate) => {
  const mTest = manhattanDistance(r.sensor, testCoord);

  if (
    mTest <= r.manhattanDistance ||
    JSON.stringify(testCoord) === JSON.stringify(r.sensor) ||
    JSON.stringify(testCoord) === JSON.stringify(r.closestBeacon)
  ) {
    return true;
  }

  return false;
};

const nextCoordToEastWithFixedY = (
  fromReading: Reading,
  testCoord: Coordinate
) => {
  if (!containedWithin(fromReading, testCoord)) {
    return undefined;
  }

  /* we are stuck with this much y direction */
  const verticalM = Math.abs(testCoord.y - fromReading.sensor.y);

  /* xtranslation */
  const horizontalM = fromReading.manhattanDistance - verticalM;

  const nextCoord = {
    x:
      fromReading.sensor.x +
      horizontalM +
      1 /* add 1 to be outside the range */,
    y: testCoord.y,
  };

  return nextCoord;
};

const manhattanDistance = (c1: Coordinate, c2: Coordinate) => {
  const d1 = Math.abs(c2.x - c1.x);
  const d2 = Math.abs(c2.y - c1.y);

  return d1 + d2;
};

const parseInput = ({ filePath }: { filePath: string }) => {
  return chainFrom(read(filePath).split("\n"))
    .map((line) => {
      const hunks = line.split(" ");
      const sensorXHunk = hunks[2].split("=")[1].split(",")[0];
      const sensorYHunk = hunks[3].split("=")[1].split(":")[0];

      const beaconXHunk = hunks[8].split("=")[1].split(",")[0];
      const beaconYHunk = hunks[9].split("=")[1];

      const sensor = {
        x: Number.parseInt(sensorXHunk),
        y: Number.parseInt(sensorYHunk),
      };

      const closestBeacon = {
        x: Number.parseInt(beaconXHunk),
        y: Number.parseInt(beaconYHunk),
      };

      return {
        sensor: sensor,
        closestBeacon: closestBeacon,
        manhattanDistance: manhattanDistance(sensor, closestBeacon),
      };
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
  readings: Reading[];
  bounds: Bounds;
  offsetX: number;
  offsetY: number;

  constructor({ readings }: { readings: Reading[] }) {
    this.grid = new Array<string[]>();
    this.readings = readings;
    this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    this.offsetX = 0;
    this.offsetY = 0;
  }

  create() {
    this.bounds = this.readings
      .flatMap((reading) => {
        const mDistance = manhattanDistance(
          reading.sensor,
          reading.closestBeacon
        );

        return [
          reading.sensor,
          reading.closestBeacon,
          {
            x: reading.sensor.x,
            y: reading.sensor.y - mDistance,
          },
          {
            x: reading.sensor.x,
            y: reading.sensor.y + mDistance,
          },
          {
            x: reading.sensor.x - mDistance,
            y: reading.sensor.y,
          },
          {
            x: reading.sensor.x + mDistance,
            y: reading.sensor.y,
          },
        ];
      })
      .reduce(
        (bounds, c) => {
          bounds.minX = c.x < bounds.minX ? c.x : bounds.minX;
          bounds.maxX = bounds.maxX < c.x ? c.x : bounds.maxX;
          bounds.minY = c.y < bounds.minY ? c.y : bounds.minY;
          bounds.maxY = bounds.maxY < c.y ? c.y : bounds.maxY;

          return bounds;
        },
        {
          minX: Number.MAX_SAFE_INTEGER,
          maxX: Number.MIN_SAFE_INTEGER,
          minY: Number.MAX_SAFE_INTEGER,
          maxY: Number.MIN_SAFE_INTEGER,
        }
      );

    this.offsetX = this.bounds.minX;
    this.offsetY = this.bounds.minY;
  }

  noBeaconPositions(y: number) {
    /* generate a list of test coordinates from the x bounds of our board with
    the fixed y */
    const testCoords = [];
    for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
      testCoords.push({
        x: x,
        y: y,
      });
    }

    return chainFrom(testCoords)
      .filter((testCoord) => {
        /* return true if the testCoord falls within a reading. a beacon could not be here */
        return !!chainFrom(this.readings)
          .filter((r) => {
            const mTest = manhattanDistance(r.sensor, testCoord);

            return (
              JSON.stringify(testCoord) !== JSON.stringify(r.sensor) &&
              JSON.stringify(testCoord) !== JSON.stringify(r.closestBeacon) &&
              mTest <= r.manhattanDistance
            );
          })
          .first();
      })
      .count();
  }

  findBeacon(max: number) {
    let y = 0;

    let testCoord = { x: 0, y: y };
    let prevTestCoord = { x: testCoord.x, y: testCoord.y };

    /* the idea here is to increment y and advance x by jumping to the edge + 1
    of any intersecting sesson. stop when you have read through the readings
    and confirmed there is no match. */
    while (y <= max) {
      /* search through readings */
      for (const r of this.readings) {
        const maybeCoord = nextCoordToEastWithFixedY(r, testCoord);

        if (maybeCoord === undefined) {
          /* do nothing: this reading does not contain */
          continue;
        }

        if (maybeCoord.x < testCoord.x) {
          /* we got caught in a reading further west */
          continue;
        }

        testCoord = maybeCoord;
        break;
      }

      /* we are out of the zone */
      if (max <= testCoord.x) {
        y++;
        testCoord = { x: 0, y: y };
      } else if (JSON.stringify(testCoord) === JSON.stringify(prevTestCoord)) {
        /* we have not advanced and found our candidate */
        break;
      } else {
        /* we have advanced. go through readings again */
        prevTestCoord = { x: testCoord.x, y: testCoord.y };
      }
    }

    return testCoord.x * 4000000 + testCoord.y;
  }
}

export const day15Part1 = () => {
  const readings = parseInput({ filePath: dataFilePath });

  const cave = new Cave({ readings: readings });
  cave.create();
  /* note: this should be rewritten to make use of manhattan distance to
  eliminate candidates */
  return cave.noBeaconPositions(2000000);
  /*   return cave.noBeaconPositions(10); */
};

export const day15Part2 = () => {
  const readings = parseInput({ filePath: dataFilePath });

  const cave = new Cave({ readings: readings });
  cave.create();
  /* note: this still runs very slowly. not sure at the moment how to best
  reduce the search space */
  return cave.findBeacon(4000000);
  /*     return cave.findBeacon(20); */
};
