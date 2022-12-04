import { chainFrom } from "transducist";

import { read } from "./util";

const dataFilePath = "data/day04-prod.txt";

export const day04Part1 = () => {
  const data = read(dataFilePath);

  return chainFrom(data.split("\n"))
    .map((assignments) => {
      /* split */
      const [assignmentA, assignmentB] = assignments.split(",");

      const [assignmentAStart, assignmentAEnd] = assignmentA.split("-");
      const [assignmentBStart, assignmentBEnd] = assignmentB.split("-");

      const assignmentAStartSectionNumber = Number.parseInt(assignmentAStart);
      const assignmentAEndSectionNumber = Number.parseInt(assignmentAEnd);

      const assignmentBStartSectionNumber = Number.parseInt(assignmentBStart);
      const assignmentBEndSectionNumber = Number.parseInt(assignmentBEnd);

      /* complete overlap happens when the start and end is fully contained
      within the other */

      /* check if A is fully contained */
      if (
        assignmentBStartSectionNumber <= assignmentAStartSectionNumber &&
        assignmentAEndSectionNumber <= assignmentBEndSectionNumber
      ) {
        return 1;
      }

      /* check if B is fully contained */
      if (
        assignmentAStartSectionNumber <= assignmentBStartSectionNumber &&
        assignmentBEndSectionNumber <= assignmentAEndSectionNumber
      ) {
        return 1;
      }

      return 0;
    })
    .sum();
};

export const day04Part2 = () => {
  const data = read(dataFilePath);

  return chainFrom(data.split("\n"))
    .map((assignments) => {
      /* split */
      const [assignmentA, assignmentB] = assignments.split(",");

      const [assignmentAStart, assignmentAEnd] = assignmentA.split("-");
      const [assignmentBStart, assignmentBEnd] = assignmentB.split("-");

      const assignmentAStartSectionNumber = Number.parseInt(assignmentAStart);
      const assignmentAEndSectionNumber = Number.parseInt(assignmentAEnd);

      const assignmentBStartSectionNumber = Number.parseInt(assignmentBStart);
      const assignmentBEndSectionNumber = Number.parseInt(assignmentBEnd);

      /* any overlap happens when the end of one is greater or equal to the
      start and less than or equal to the end of the other. test both */

      if (
        assignmentBStartSectionNumber <= assignmentAEndSectionNumber &&
        assignmentAEndSectionNumber <= assignmentBEndSectionNumber
      ) {
        return 1;
      }

      if (
        assignmentAStartSectionNumber <= assignmentBEndSectionNumber &&
        assignmentBEndSectionNumber <= assignmentAEndSectionNumber
      ) {
        return 1;
      }

      return 0;
    })
    .sum();
};
