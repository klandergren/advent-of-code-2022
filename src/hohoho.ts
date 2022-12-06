import { day01Part1, day01Part2 } from "./day01";
import { day02Part1, day02Part2 } from "./day02";
import { day03Part1, day03Part2 } from "./day03";
import { day04Part1, day04Part2 } from "./day04";
import { day05Part1, day05Part2 } from "./day05";
import { day06Part1, day06Part2 } from "./day06";

const run = ({
  dayNum,
  part1Function,
  part2Function,
  shouldSkip,
}: {
  dayNum: number;
  part1Function: () => string | number | null;
  part2Function?: () => string | number | null;
  shouldSkip?: boolean;
}) => {
  const title = `Day ${String(dayNum).padStart(2, "0")}`;
  if (shouldSkip) {
    console.log(`${title} - skipped!`);
  } else {
    console.log(`${title} - Part 1:`);
    console.log(part1Function());

    if (part2Function !== undefined) {
      console.log(`${title} - Part 2:`);
      console.log(part2Function());
    }
  }
};

run({
  dayNum: 1,
  part1Function: day01Part1,
  part2Function: day01Part2,
  shouldSkip: true,
});

run({
  dayNum: 2,
  part1Function: day02Part1,
  part2Function: day02Part2,
  shouldSkip: true,
});

run({
  dayNum: 3,
  part1Function: day03Part1,
  part2Function: day03Part2,
  shouldSkip: true,
});

run({
  dayNum: 4,
  part1Function: day04Part1,
  part2Function: day04Part2,
  shouldSkip: true,
});

run({
  dayNum: 5,
  part1Function: day05Part1,
  part2Function: day05Part2,
  shouldSkip: true,
});

run({
  dayNum: 6,
  part1Function: day06Part1,
  part2Function: day06Part2,
});
