import { chainFrom } from "transducist";

import { read } from "./util";

const dataFilePath = "data/day05-prod.txt";

/* note: probably buggy if the last stack starts empty */
export const day05Part1 = () => {
  const data = read(dataFilePath, true);

  const [stackWithNumbersDrawing, instructions] = data.split("\n\n");

  const [stackDrawing, _] = stackWithNumbersDrawing.split("\n 1");

  const stackLines = stackDrawing.split("\n");

  const stacks: string[][] = [];

  for (const stackLine of stackLines) {
    const arr = Array.from(stackLine);
    arr.splice(0, 1);

    const pre = chainFrom(arr).takeNth(4).toArray();

    let i = 0;
    for (const crate of pre) {
      if (crate !== " ") {
        let stack = stacks[i] || [];
        stack.unshift(crate);
        stacks[i] = stack;
      }
      i++;
    }
  }

  for (const instruction of instructions.trim().split("\n")) {
    const [_f, amount, _g, origin, _h, destination] = instruction.split(" ");

    const times = Number.parseInt(amount);
    const originIndex = Number.parseInt(origin) - 1;
    const destIndex = Number.parseInt(destination) - 1;

    for (let i = 0; i < times; i++) {
      const crate = stacks[originIndex].pop();
      stacks[destIndex].push(crate!);
    }
  }

  return stacks.map((s) => s[s.length - 1]).join("");
};

export const day05Part2 = () => {
  const data = read(dataFilePath, true);

  const [stackWithNumbersDrawing, instructions] = data.split("\n\n");

  const [stackDrawing, _] = stackWithNumbersDrawing.split("\n 1");

  const stackLines = stackDrawing.split("\n");

  const stacks: string[][] = [];

  for (const stackLine of stackLines) {
    const arr = Array.from(stackLine);
    arr.splice(0, 1);

    const pre = chainFrom(arr).takeNth(4).toArray();

    let i = 0;
    for (const crate of pre) {
      if (crate !== " ") {
        let stack = stacks[i] || [];
        stack.unshift(crate);
        stacks[i] = stack;
      }
      i++;
    }
  }

  for (const instruction of instructions.trim().split("\n")) {
    const [_f, amount, _g, origin, _h, destination] = instruction.split(" ");

    const times = Number.parseInt(amount);
    const originIndex = Number.parseInt(origin) - 1;
    const destIndex = Number.parseInt(destination) - 1;

    const intermodal: string[] = [];
    for (let i = 0; i < times; i++) {
      const crate = stacks[originIndex].pop();

      intermodal.unshift(crate!);
    }
    stacks[destIndex] = stacks[destIndex].concat(intermodal);
  }

  return stacks.map((s) => s[s.length - 1]).join("");
};
