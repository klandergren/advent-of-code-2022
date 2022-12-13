import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day13-prod.txt";

type Packet = (number | Packet)[];

const parse = (packetText: string): Packet => {
  let packet = [];

  const chars = packetText.split("");

  /* start at 1 and stop 1 before end because we assume that we are given a fully enclosed packet  */
  let i = 1;
  let packetIndex = 0;
  while (i < chars.length - 1) {
    const char = chars[i];

    if (char === "[") {
      /* we have the start of a new packet */
      const startIndex = i;

      /* find the index of the enclosing bracket  */
      let endIndex = i;
      let counter = 1;
      for (let j = startIndex + 1; j < chars.length - 1; j++) {
        if (chars[j] === "]") {
          counter--;
        } else if (chars[j] === "[") {
          counter++;
        }

        if (counter === 0) {
          endIndex = j;
          break;
        }
      }

      /* we have the bounds */
      const subPacketText = packetText.slice(startIndex, endIndex + 1);
      packet[packetIndex] = parse(subPacketText);

      /* advance our indices */
      i = endIndex;
      packetIndex++;
    } else if (char === "]") {
      /* do nothing */
    } else if (char === ",") {
      /* do nothing */
    } else {
      /* must be digit */

      /* lookahead: is is next also a digit? note: this bit me initially not
      accounting for two digit integers. I manually checked that there were no
      3 digits in the input */
      const next = chars[i + 1];

      let numString = char;
      if (next === "]" || next === ",") {
      } else {
        numString = numString.concat(next);
        i++;
      }

      packet[packetIndex] = Number.parseInt(numString);
      packetIndex++;
    }

    i++;
  }

  return packet;
};

enum Result {
  IN_ORDER,
  OUT_OF_ORDER,
  CONTINUE,
}

const comparePackets = (left: Packet, right: Packet, amount = 0): Result => {
  console.log(
    [...Array(amount).keys()].map((_) => "-").join(""),
    "comparing",
    left,
    "vs",
    right
  );

  let result = Result.CONTINUE;

  for (let i = 0; i < left.length; i++) {
    const l_i = left[i];
    const r_i = right[i];
    console.log("l_i", l_i, "r_i", r_i);

    /* If the right list runs out of items first, the inputs are not in the
         right order.  */
    if (r_i === undefined) {
      result = Result.OUT_OF_ORDER;
      console.log(
        [...Array(amount + 6).keys()].map((_) => "-").join(""),
        "right side out of items. OUT OF ORDER. left was",
        l_i,
        left,
        left.length
      );
      break;
    }

    if (typeof l_i === "number") {
      if (typeof r_i === "number") {
        console.log(
          [...Array(amount + 4).keys()].map((_) => "-").join(""),
          "comparing",
          l_i,
          "vs",
          r_i
        );
        /* both number */
        if (l_i < r_i) {
          result = Result.IN_ORDER;
          console.log(
            [...Array(amount + 6).keys()].map((_) => "-").join(""),
            "IN ORDER"
          );
          break;
        } else if (l_i === r_i) {
          result = Result.CONTINUE;
        } else {
          result = Result.OUT_OF_ORDER;
          console.log(
            [...Array(amount + 6).keys()].map((_) => "-").join(""),
            "OUT OF ORDER"
          );
          break;
        }
      } else {
        /* l_i number, r_i packet */

        console.log(
          [...Array(amount + 4).keys()].map((_) => "-").join(""),
          "MIXED TYPES"
        );

        /* If exactly one value is an integer, convert the integer to a list
         which contains that integer as its only value, then retry the
         comparison. For example, if comparing [0,0,0] and 2, convert the right
         value to [2] (a list containing 2); the result is then found by
         instead comparing [0,0,0] and [2]. */
        const subResult = comparePackets([l_i], r_i, amount + 4);
        if (subResult === Result.CONTINUE) {
          /* continue */
        } else if (subResult === Result.IN_ORDER) {
          result = subResult;
          break;
        } else {
          result = Result.OUT_OF_ORDER;
          break;
        }
      }
    } else {
      if (typeof r_i === "number") {
        /* l_i packet, r_i number */

        console.log(
          [...Array(amount + 4).keys()].map((_) => "-").join(""),
          "MIXED TYPES"
        );
        /* If exactly one value is an integer, convert the integer to a list
         which contains that integer as its only value, then retry the
         comparison. For example, if comparing [0,0,0] and 2, convert the right
         value to [2] (a list containing 2); the result is then found by
         instead comparing [0,0,0] and [2]. */

        const subResult = comparePackets(l_i, [r_i], amount + 4);
        if (subResult === Result.CONTINUE) {
          /* continue */
        } else if (subResult === Result.IN_ORDER) {
          result = subResult;
          break;
        } else {
          result = Result.OUT_OF_ORDER;
          break;
        }
      } else {
        /* both packets */

        /* If both values are lists, compare the first value of each list, then
         the second value, and so on. If the left list runs out of items first,
         the inputs are in the right order. */

        /* If the lists are the same length and no comparison makes a decision
         about the order, continue checking the next part of the input.  */

        const subResult = comparePackets(l_i, r_i, amount + 4);

        if (subResult === Result.CONTINUE) {
          /* continue */
        } else if (subResult === Result.IN_ORDER) {
          result = subResult;
          break;
        } else {
          result = Result.OUT_OF_ORDER;
          break;
        }
      }
    }
  }

  /* note: this is the other case I only uncovered after debugging */
  if (result === Result.CONTINUE && left.length < right.length) {
    result = Result.IN_ORDER;
  }

  return result;
};

const sumCorrectDistressPacketIndices = () => {
  return chainFrom(read(dataFilePath).split("\n\n"))
    .map((rawPair) => {
      const [left, right] = rawPair
        .split("\n")
        .map((packetText) => parse(packetText));

      return comparePackets(left, right, 2);
    })
    .mapIndexed((x, i) => {
      return {
        inRightOrder: x,
        index: i + 1,
      };
    })
    .filter(
      (x) =>
        x.inRightOrder === Result.CONTINUE || x.inRightOrder === Result.IN_ORDER
    )
    .toArray();
};

export const day13Part1 = () => {
  const dp = sumCorrectDistressPacketIndices();
  console.log(dp);
  return dp.reduce((acc, x) => acc + x.index, 0);
};

export const day13Part2 = () => {
  /* manually add the divider packets as if they were input */
  const sortedPackets = chainFrom(
    read(dataFilePath).concat("\n\n[[2]]\n[[6]]").split("\n\n")
  )
    .flatMap((rawPair) => {
      return rawPair.split("\n").map((packetText) => parse(packetText));
    })
    .toArray()
    .sort((a, b) => {
      const result = comparePackets(a, b);

      if (result === Result.CONTINUE) {
        return 0;
      } else if (result === Result.IN_ORDER) {
        return -1;
      } else {
        return 1;
      }
    });

  /* use JSON.stringify to avoid object comparison */
  const indexDivider2 =
    sortedPackets.findIndex(
      (x) => JSON.stringify(x) === JSON.stringify([[2]])
    ) + 1;
  const indexDivider1 =
    sortedPackets.findIndex(
      (x) => JSON.stringify(x) === JSON.stringify([[6]])
    ) + 1;

  return indexDivider1 * indexDivider2;
};
