import { readFileSync } from "node:fs";

export const read = (filename: string) => {
  return readFileSync(filename, { encoding: "utf8" });
};
