import { read } from "./util";

import { chainFrom } from "transducist";

const dataFilePath = "data/day10-prod.txt";

const run = ({ program }: { program: string[] }) => {
  let cycleCount = 1;
  let register = 1;
  let cyclesRemaining = 1;

  const iterator = chainFrom(program).toIterator();

  let instruction = undefined;
  let value = 0;

  let result = 0;

  let crtLine = "";
  let correction = 1;
  do {
    cyclesRemaining--;
    if (cyclesRemaining === -1) {
      break;
    } else if (cyclesRemaining === 0) {
      /* perform instruction */
      if (instruction === undefined) {
        /* first case. do nothing */
      } else if (instruction === "noop") {
        /* do nothing */
      } else if (instruction === "addx") {
        register += value;
      } else {
        throw new Error("unknown instruction");
      }

      /* read instruction */
      const next = iterator.next();
      if (next.done) {
        /* do nothing */
      } else {
        const line: string = next.value;
        const [rawInstruction, rawValue] = line.split(" ");
        instruction = rawInstruction;
        value = rawValue === undefined ? 0 : Number.parseInt(rawValue);

        /* set cycles remaining appropriately */
        if (instruction === "noop") {
          cyclesRemaining = 1;
        } else if (instruction === "addx") {
          cyclesRemaining = 2;
        }
      }
    }

    const pixelIndex = cycleCount - correction;
    if (
      pixelIndex === register - 1 ||
      pixelIndex === register ||
      pixelIndex === register + 1
    ) {
      crtLine += "#";
    } else {
      crtLine += ".";
    }

    if (cycleCount % 40 === 0) {
      correction += 40;
      console.log(crtLine);
      crtLine = "";
    }

    if (
      cycleCount === 20 ||
      cycleCount === 60 ||
      cycleCount === 100 ||
      cycleCount === 140 ||
      cycleCount === 180 ||
      cycleCount === 220
    ) {
      const signalStrength = cycleCount * register;
      result += signalStrength;
      /*       console.log(cycleCount, register, signalStrength, result); */
    }

    cycleCount++;
  } while (true);

  return result;
};

export const day10Part1 = () => {
  return run({ program: read(dataFilePath).split("\n") });
};

export const day10Part2 = () => {
  return run({ program: read(dataFilePath).split("\n") });
};
