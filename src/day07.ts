import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day07-prod.txt";

const createFileFrom = (parentPath: string, line: string) => {
  const [sizeString, name] = line.split(" ");
  return {
    name: parentPath + name,
    size: Number.parseInt(sizeString),
  };
};

const createHardDriveFrom = (fileContents: string) => {
  const commandAndOutputs = fileContents.split("$ ");

  /* get rid of '' from split call above */
  commandAndOutputs.shift();

  const files = [];
  const history = ["root/"]; /* just for convenience */
  for (const commandAndOutput of commandAndOutputs.map((cao) => cao.trim())) {
    if (commandAndOutput.startsWith("cd ")) {
      const [_, dirName] = commandAndOutput.split(" ");
      if (dirName === "/") {
        /* do nothing, special case */
      } else if (dirName === "..") {
        history.pop();
      } else {
        history.push(dirName + "/");
      }
    } else if (commandAndOutput.startsWith("ls")) {
      const parentPath = history.join("");
      for (const line of commandAndOutput.split("\n")) {
        if (line.startsWith("ls")) {
          /* ignore */
        } else if (line.startsWith("dir")) {
          /* ignore. directories will be recorded when we traverse to them and if they have files */
        } else {
          const file = createFileFrom(parentPath, line);
          files.push(file);
        }
      }
    } else {
      throw new Error(`unknown command: ${commandAndOutput}`);
    }
  }

  return chainFrom(files).reduce((hardDrive, file) => {
    const directoryNames = file.name.split("/");
    directoryNames.pop(); /* get rid of filename */

    let directoryPath = "";
    for (const directoryName of directoryNames) {
      directoryPath = directoryPath + "/" + directoryName;
      const space = hardDrive.get(directoryPath) || 0;

      hardDrive.set(directoryPath, space + file.size);
    }
    return hardDrive;
  }, new Map<string, number>());
};

export const day07Part1 = () => {
  const hardDrive = createHardDriveFrom(read(dataFilePath));

  return chainFrom(hardDrive.values())
    .filter((x) => x < 100000)
    .sum();
};

const TOTAL_DISK_SPACE = 70000000;
const NEEDED_DISK_SPACE = 30000000;

export const day07Part2 = () => {
  const hardDrive = createHardDriveFrom(read(dataFilePath));

  const rootSpace = hardDrive.get("/root")!;

  const unusedSpace = TOTAL_DISK_SPACE - rootSpace;

  const minimumSpaceToFree = NEEDED_DISK_SPACE - unusedSpace;

  return chainFrom(hardDrive.values())
    .filter((x) => minimumSpaceToFree <= x)
    .min();
};
