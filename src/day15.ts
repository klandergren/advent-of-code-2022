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

const manhattanDistance = (c1: Coordinate, c2: Coordinate) => {
  const d1 = Math.abs(c2.x - c1.x);
  const d2 = Math.abs(c2.y - c1.y);

  return d1 + d2;
};

const enumerateCoordinates = (coord: Coordinate, mDistance: number) => {
  const minX = coord.x - mDistance;
  const maxX = coord.x + mDistance;

  const minY = coord.y - mDistance;
  const maxY = coord.y + mDistance;

  const coords = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const candidate = { x: x, y: y };
      const distance = manhattanDistance(candidate, coord);

      if (distance <= mDistance) {
        coords.push(candidate);
      }
    }
  }

  return coords;
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

  createOld() {
    const bounds: Bounds = this.readings
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

    this.offsetX = bounds.minX;
    this.offsetY = bounds.minY;

    for (let y = 0; y <= bounds.maxY - this.offsetY; y++) {
      const row = [...Array(bounds.maxX - this.offsetX + 1).keys()].map(
        (_) => "."
      );
      this.grid[y] = row;
    }

    for (const { sensor, closestBeacon } of this.readings) {
      this.grid[sensor.y - this.offsetY][sensor.x - this.offsetX] = "S";
      this.grid[closestBeacon.y - this.offsetY][
        closestBeacon.x - this.offsetX
      ] = "B";
    }
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

  render() {
    let y = 0;
    for (const row of this.grid) {
      console.log(String(y).padStart(2, "0"), row.join(""));
      y++;
    }
  }

  noBeaconPositions(y: number) {
    const testCoords = [];
    for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
      testCoords.push({
        x: x,
        y: y,
      });
    }

    return chainFrom(testCoords)
      .filter((testCoord) => {
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
    for (let x = 0; x <= max; x++) {
      for (let y = 0; y <= max; y++) {
        const test = { x: x, y: y };

        if (this._canContainBeacon(test)) {
          return test.x * 4000000 + test.y;
        }
      }
    }

    return -1;
  }

  _canContainBeacon(testCoord: Coordinate) {
    for (const r of this.readings) {
      const mTest = manhattanDistance(r.sensor, testCoord);

      if (
        mTest <= r.manhattanDistance ||
        JSON.stringify(testCoord) === JSON.stringify(r.sensor) ||
        JSON.stringify(testCoord) === JSON.stringify(r.closestBeacon)
      ) {
        return false;
      }
    }
    return true;
  }
}

export const day15Part1 = () => {
  const readings = parseInput({ filePath: dataFilePath });

  const cave = new Cave({ readings: readings });
  cave.create();
  /*   return cave.noBeaconPositions(2000000); */
  /*   return cave.noBeaconPositions(10); */
  return -1;
};

export const day15Part2 = () => {
  /* note: I feel like there is probably some clue from part 1 which is if you
  can determine an efficient way of finding where the beacon could _not_ be,
  that will allow you to filter out candidates to find where it could be. paths
  I am thinking are involve using the edge bounds of the manhattan distance
  diamonds to eliminate candidates */
  const readings = parseInput({ filePath: dataFilePath });

  const cave = new Cave({ readings: readings });
  cave.create();
  return -1;
  /*   return cave.findBeacon(4000000); */
  /*   return cave.findBeacon(20); */
};
