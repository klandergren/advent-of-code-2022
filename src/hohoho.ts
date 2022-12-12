import { day01Part1, day01Part2 } from "./day01";
import { day02Part1, day02Part2 } from "./day02";
import { day03Part1, day03Part2 } from "./day03";
import { day04Part1, day04Part2 } from "./day04";
import { day05Part1, day05Part2 } from "./day05";
import { day06Part1, day06Part2 } from "./day06";
import { day07Part1, day07Part2 } from "./day07";
import { day08Part1, day08Part2 } from "./day08";
import { day09Part1, day09Part2 } from "./day09";
import { day10Part1, day10Part2 } from "./day10";
import { day11Part1, day11Part2 } from "./day11";
import { day12Part1, day12Part2 } from "./day12";

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
  shouldSkip: true,
});

run({
  dayNum: 7,
  part1Function: day07Part1,
  part2Function: day07Part2,
  shouldSkip: true,
});

run({
  dayNum: 8,
  part1Function: day08Part1,
  part2Function: day08Part2,
  shouldSkip: true,
});

run({
  dayNum: 9,
  part1Function: day09Part1,
  part2Function: day09Part2,
  shouldSkip: true,
});

run({
  dayNum: 10,
  part1Function: day10Part1,
  part2Function: day10Part2,
  shouldSkip: true,
});

run({
  dayNum: 11,
  part1Function: day11Part1,
  part2Function: day11Part2,
  shouldSkip: true,
});

run({
  dayNum: 12,
  part1Function: day12Part1,
  part2Function: day12Part2,
});
