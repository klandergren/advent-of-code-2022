type Monkey = {
  startingItems: number[];
  operation: (x: number) => number;
  modAmount: number;
  consequent: number;
  alternate: number;
};

const createMonkey = ({
  startingItems,
  operation,
  modAmount,
  consequent,
  alternate,
}: Monkey) => {
  return {
    startingItems: startingItems,
    operation: operation,
    modAmount: modAmount,
    consequent: consequent,
    alternate: alternate,
  };
};

/* test */
const testMonkeyBarrel = () => {
  return [
    createMonkey({
      startingItems: [79, 98],
      operation: (x) => x * 19,
      modAmount: 23,
      consequent: 2,
      alternate: 3,
    }),
    createMonkey({
      startingItems: [54, 65, 75, 74],
      operation: (x) => x + 6,
      modAmount: 19,
      consequent: 2,
      alternate: 0,
    }),
    createMonkey({
      startingItems: [79, 60, 97],
      operation: (x) => x * x,
      modAmount: 13,
      consequent: 1,
      alternate: 3,
    }),
    createMonkey({
      startingItems: [74],
      operation: (x) => x + 3,
      modAmount: 17,
      consequent: 0,
      alternate: 1,
    }),
  ];
};

const prodMonkeyBarrel = () => {
  return [
    createMonkey({
      startingItems: [92, 73, 86, 83, 65, 51, 55, 93],
      operation: (x) => x * 5,
      modAmount: 11,
      consequent: 3,
      alternate: 4,
    }),
    createMonkey({
      startingItems: [99, 67, 62, 61, 59, 98],
      operation: (x) => x * x,
      modAmount: 2,
      consequent: 6,
      alternate: 7,
    }),
    createMonkey({
      startingItems: [81, 89, 56, 61, 99],
      operation: (x) => x * 7,
      modAmount: 5,
      consequent: 1,
      alternate: 5,
    }),
    createMonkey({
      startingItems: [97, 74, 68],
      operation: (x) => x + 1,
      modAmount: 17,
      consequent: 2,
      alternate: 5,
    }),
    createMonkey({
      startingItems: [78, 73],
      operation: (x) => x + 3,
      modAmount: 19,
      consequent: 2,
      alternate: 3,
    }),
    createMonkey({
      startingItems: [50],
      operation: (x) => x + 5,
      modAmount: 7,
      consequent: 1,
      alternate: 6,
    }),
    createMonkey({
      startingItems: [95, 88, 53, 75],
      operation: (x) => x + 8,
      modAmount: 3,
      consequent: 0,
      alternate: 7,
    }),
    createMonkey({
      startingItems: [50, 77, 98, 85, 94, 56, 89],
      operation: (x) => x + 2,
      modAmount: 13,
      consequent: 4,
      alternate: 0,
    }),
  ];
};

const calculateMonkeyBusiness = (
  rounds: number,
  monkeyBarrel: Monkey[],
  boredom: (worryLevel: number, modAmounts: number[]) => number
) => {
  const monkeyCount = [...Array(monkeyBarrel.length).keys()].map((_) => 0);

  for (let roundNumber = 1; roundNumber <= rounds; roundNumber++) {
    let monkeyIndex = 0;
    const modAmounts = monkeyBarrel.map((m) => m.modAmount);
    for (const monkey of monkeyBarrel) {
      /* inspect each item */
      let count = 0;
      for (const item of monkey.startingItems) {
        /* calc worry */
        let worryLevel = monkey.operation(item);

        /* boredom */
        worryLevel = boredom(worryLevel, modAmounts);

        /* test */
        if (worryLevel % monkey.modAmount === 0) {
          monkeyBarrel[monkey.consequent].startingItems.push(worryLevel);
        } else {
          monkeyBarrel[monkey.alternate].startingItems.push(worryLevel);
        }
        count++;
      }
      monkeyCount[monkeyIndex] += count;

      monkeyIndex++;
      monkey.startingItems = [];
    }
  }

  console.log("round:", rounds, "monkeyCount:", monkeyCount);

  monkeyCount.sort((a, b) => {
    return b - a; /* sort desc */
  });

  const monkeyBusinessLevel = monkeyCount[0] * monkeyCount[1];

  return monkeyBusinessLevel;
};

export const day11Part1 = () => {
  const boredom = (worryLevel: number) => {
    return Math.floor(worryLevel / 3);
  };

  return calculateMonkeyBusiness(20, prodMonkeyBarrel(), boredom);
};

export const day11Part2 = () => {
  const boredom = (worryLevel: number, modAmounts: number[]) => {
    /* need function `norm` such that op_i(norm(w)) % mod_i === op_i(w) % mod_i for each monkey i */

    /* (2 days later...) talked with dphilipson at climbing and learned about
    modulo arithmetic. the product of all mod amounts gives us a common
    factor. when that common factor is used on worry level w_i, the remainder
    r_i has the property such that: */

    /* w_i % mod_i = (w_i % common_factor) % mod_i */

    /* which effectively ensures that w_i never gets larger than cf */
    return worryLevel % modAmounts.reduce((acc, x) => acc * x, 1);
  };

  return calculateMonkeyBusiness(10000, prodMonkeyBarrel(), boredom);
};
