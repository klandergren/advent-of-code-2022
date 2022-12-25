import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day20-test.txt";

/* 7144 too low */
/* 14045 too low */

type MovableNumber = {
  value: number;
  hasMoved: boolean;
};

class CircularBuffer {
  backingArray: MovableNumber[];

  constructor(initialArray: number[]) {
    this.backingArray = Object.assign([], initialArray).map((x) => {
      return { value: x, hasMoved: false };
    });
    console.log(this.backingArray);
  }

  findIndex(num: number, hasMoved?: boolean) {
    /*     console.log("findIndex", num, hasMoved); */
    const index = this.backingArray.findIndex((x) => {
      const valueMatches = x.value === num;
      const hasMovedMatches =
        hasMoved === undefined ? true : x.hasMoved === hasMoved;

      return valueMatches && hasMovedMatches;
    });

    return index;
  }

  itemAt(index: number) {
    console.log("itemAt, index:", index);
    const normalizedIndex = index % this.backingArray.length;
    console.log("itemAt, normalizedIndex:", normalizedIndex);

    return this.backingArray[normalizedIndex];
  }

  advanceItem({ atIndex, numSteps }: { atIndex: number; numSteps: number }) {
    console.log("");
    console.log(
      "advance before:",
      this.backingArray.map((x) => x.value).join(", ")
    );
    const item = this.backingArray[atIndex];

    if (item.hasMoved) {
      console.log("error");
    }

    item.hasMoved = true;

    const normalizedNumSteps = numSteps % (this.backingArray.length - 1);

    if (normalizedNumSteps === 0) {
      return;
    }

    let toIndex = atIndex + normalizedNumSteps + 1;
    toIndex = toIndex % this.backingArray.length;

    const deleteIndex = atIndex;

    if (toIndex < deleteIndex) {
      /* we have wrapped all the way around and are now behind us. no change necessary */
    } else {
      /* we are ahead of us. because we delete first, we do not need to make any changes */
    }

    console.log("toIndex:", toIndex);
    console.log("deleteIndex:", deleteIndex);

    this.backingArray.splice(deleteIndex, 1);
    this.backingArray.splice(toIndex, 0, item);
    console.log(
      "advance after:",
      this.backingArray.map((x) => x.value).join(", ")
    );
  }

  retreatItem({ atIndex, numSteps }: { atIndex: number; numSteps: number }) {
    console.log("");
    console.log(
      "retreat before:",
      this.backingArray.map((x) => x.value).join(", ")
    );
    const item = this.backingArray[atIndex];

    if (item.hasMoved) {
      console.log("error");
    }

    item.hasMoved = true;

    const normalizedNumSteps = numSteps % (this.backingArray.length - 1);

    if (normalizedNumSteps === 0) {
      return;
    }

    let toIndex = atIndex - normalizedNumSteps - 1;

    toIndex = 0 < toIndex ? toIndex : this.backingArray.length + toIndex;

    const deleteIndex = atIndex;

    if (toIndex < deleteIndex) {
      /* we are moving "backward". no change necessary */
    } else {
      /* we have wrapped all around and are adding the item */
    }

    this.backingArray.splice(deleteIndex, 1);
    this.backingArray.splice(toIndex, 0, item);
    console.log(
      "retreat after:",
      this.backingArray.map((x) => x.value).join(", ")
    );
  }
}

class EncryptedFile {
  originalArray: number[];

  circularBuffer: CircularBuffer;

  constructor(initialArray: number[]) {
    this.originalArray = initialArray;

    this.circularBuffer = new CircularBuffer(initialArray);
  }

  decrypt() {
    for (const num of this.originalArray) {
      const i = this.circularBuffer.findIndex(num, false);

      if (num < 0) {
        this.circularBuffer.retreatItem({
          atIndex: i,
          numSteps: Math.abs(num),
        });
      } else if (num === 0) {
        /* do nothing */
      } else {
        this.circularBuffer.advanceItem({ atIndex: i, numSteps: num });
      }
    }
  }

  answer() {
    console.log(
      "should be 0:",
      this.circularBuffer.backingArray.filter((x) => x === undefined).length
    );

    const zeroIndex = this.circularBuffer.findIndex(0);

    console.log("zeroIndex", zeroIndex);

    const indices = [1000, 2000, 3000].map((i) => i + zeroIndex);

    return indices.reduce((acc, index) => {
      console.log("index", index);
      console.log(this.circularBuffer.itemAt(index));
      return acc + this.circularBuffer.itemAt(index).value;
    }, 0);
  }
}

export const day20Part1 = () => {
  const initialArray = read(dataFilePath)
    .split("\n")
    .map((l) => Number.parseInt(l));

  const encryptedFile = new EncryptedFile(initialArray);

  encryptedFile.decrypt();

  return encryptedFile.answer();
};

export const day20Part2 = () => {
  return -1;
};
