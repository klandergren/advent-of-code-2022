import { CircularBuffer } from "./day20";

describe("CircularBuffer", () => {
  test("movement", () => {
    const cb = new CircularBuffer([1, 2, -3, 3, -2, 0, 4]);

    expect(cb.asValueArray()).toStrictEqual([1, 2, -3, 3, -2, 0, 4]);
  });
});
