import { chainFrom } from "transducist";

import { read } from "./util";

const dataFilePath = "data/day06-prod.txt";

const detectUniqeWindow = (data: string, numChars: number) => {
  /* split by character */
  const chars = Array.from(data);

  let markerIndicator = -1;
  for (let i = numChars; i < chars.length; i++) {
    const window = chars.slice(i - numChars, i);

    if (new Set(window).size === numChars) {
      markerIndicator = i;
      break;
    }
  }

  return markerIndicator;
};

export const day06Part1 = () => {
  return detectUniqeWindow(read(dataFilePath), 4);
};

export const day06Part2 = () => {
  return detectUniqeWindow(read(dataFilePath), 14);
};
