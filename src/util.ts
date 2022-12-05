import { readFileSync } from "node:fs";

export const read = (filename: string, preserveWhiteSpace?: boolean) => {
  if (preserveWhiteSpace) {
    return readFileSync(filename, { encoding: "utf8" });
  } else {
    return readFileSync(filename, { encoding: "utf8" }).trim();
  }
};
