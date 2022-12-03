import { chainFrom } from "transducist";

import { read } from "./util";

export const day01Part1 = () => {
  const data = read("data/day01-prod.txt");

  return chainFrom(data.split("\n\n"))
    .map((backpack) =>
      chainFrom(backpack.split("\n"))
        .map((x) => Number.parseInt(x))
        .filter((x) => !isNaN(x))
        .reduce((acc, x) => {
          return acc + x;
        }, 0)
    )
    .max();
};

export const day01Part2 = () => {
  const data = read("data/day01-prod.txt");

  return chainFrom(
    chainFrom(data.split("\n\n"))
      .map((backpack) =>
        chainFrom(backpack.split("\n"))
          .map((x) => Number.parseInt(x))
          .filter((x) => !isNaN(x))
          .reduce((acc, x) => {
            return acc + x;
          }, 0)
      )
      .toArray()
      .sort((a, b) => {
        return b - a;
      })
  )
    .take(3)
    .sum();
};
