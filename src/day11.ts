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
  boredom: (worryLevel: number, modAmount: number) => number
) => {
  const monkeyCount = [...Array(monkeyBarrel.length).keys()].map((_) => 0);

  for (let roundNumber = 1; roundNumber <= rounds; roundNumber++) {
    let monkeyIndex = 0;
    for (const monkey of monkeyBarrel) {
      /* inspect each item */
      let count = 0;
      for (const item of monkey.startingItems) {
        /* calc worry */
        let worryLevel = monkey.operation(item);

        /* boredom */
        worryLevel = boredom(worryLevel, monkey.modAmount);

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

  console.log(monkeyBarrel);

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
  /* need to normalize worry level such that: test(x) and test(normalize(x)) are the same */
  /* and somehow make it such that x and normalize(x) have the same effect on all other tests? */
  /* need boredom such that remainder(test(operation(x))) is the same across values of x  */

  const boredom = (worryLevel: number, modAmount: number) => {
    /* need function `norm` such that op_i(norm(w)) % mod_i === op_i(w) % mod_i for each monkey i */

    const remainder = worryLevel % modAmount;
    return remainder;
  };

  return calculateMonkeyBusiness(20, testMonkeyBarrel(), boredom);
};
