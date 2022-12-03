import { chainFrom } from "transducist";

import { read } from "./util";

const dataFilePath = "data/day03-prod.txt";

const priority = (item: string) => {
  if (item === item.toLocaleLowerCase()) {
    return item.charCodeAt(0) - 96;
  } else {
    return item.charCodeAt(0) - 38;
  }
};

const score = (items: Set<string>) => {
  return chainFrom([...items])
    .map((x) => priority(x))
    .sum();
};

export const day03Part1 = () => {
  const data = read(dataFilePath);

  return chainFrom(data.split("\n"))
    .map((inv) => {
      /* split */
      const [compartment1, compartment2] = [
        inv.slice(0, inv.length / 2),
        inv.slice(inv.length / 2),
      ];

      /* determine duplicated */
      const compartment1Items = new Set([...compartment1]);
      const compartment2Items = new Set([...compartment2]);

      const intersection = new Set(
        [...compartment1Items].filter((x) => compartment2Items.has(x))
      );

      /* return priority */
      return score(intersection);
    })
    .sum();
};

export const day03Part2 = () => {
  const data = read(dataFilePath);

  return chainFrom(data.split("\n"))
    .partitionAll(3)
    .map((inventories) => {
      const elfInv1 = new Set([...inventories[0]]);
      const elfInv2 = new Set([...inventories[1]]);
      const elfInv3 = new Set([...inventories[2]]);

      const intersection = new Set(
        [...elfInv1].filter((x) => elfInv2.has(x) && elfInv3.has(x))
      );

      return score(intersection);
    })
    .sum();
};
