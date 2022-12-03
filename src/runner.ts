import { day01Part1, day01Part2 } from "./day01";

const run = ({
  dayNum,
  part1Function,
  part2Function,
  shouldSkip,
}: {
  dayNum: number;
  part1Function: () => void;
  part2Function?: () => void;
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
});
