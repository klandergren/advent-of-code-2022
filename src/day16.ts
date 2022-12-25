import { chainFrom } from "transducist";
import { read } from "./util";

const dataFilePath = "data/day16-test.txt";

const timeAvailable = 30;

let timeRemaining = timeAvailable;

const startingRoomLabel = "AA";

const timeToOpenValve = 1;

const timeToTraverse = 1;

/* network / graph traversal. greedy alg? */

/* idea: remove nodes that have 0 valves and just make them longer edges */

/* idea: brute force. recalculate total eventual pressure after each movement   */

/* question: how to represent a graph structure w/ edges and nodes? */

const valveFlowRateLookup = new Map<string, number>();
const valveEdgeLookup = new Map<string, string[]>();
const valveEdgeWeights = new Map<string, number>();

const totalEventualPressureRelease = ({
  flowRate,
  timeRemaining,
}: {
  flowRate: number;
  timeRemaining: number;
}) => {
  return flowRate * timeRemaining;
};

type Node = {
  label: string;
  flowRate: number;
};

type Edge = {
  nodeA: Node;
  nodeB: Node;
  weight: number;
};

const build = () => {
  const lines = read(dataFilePath).split("\n");

  for (const line of lines) {
    const [
      _a,
      valveLabel,
      _b,
      _c,
      rawRate,
      _d,
      _e,
      _f,
      _g,
      ...rawRemainingValves
    ] = line.split(" ");

    /* create node */
    valveFlowRateLookup.set(valveLabel, Number.parseInt(rawRate.split("=")[1]));

    /* create edges */
    valveEdgeLookup.set(
      valveLabel,
      rawRemainingValves.map((l) => l.split(",")[0])
    );
  }

  const makeEdge = (v1: string, v2: string) => {
    return `${v1}<->${v2}`;
  };
  for (const [valve, destinations] of valveEdgeLookup.entries()) {
    for (const destination of destinations) {
      valveEdgeWeights.set(makeEdge(valve, destination), 1);
    }
  }
};

export const day16Part1 = () => {
  const matrix = build();
  console.log(valveFlowRateLookup);
  console.log(valveEdgeLookup);
  console.log(valveEdgeWeights);
  return -1;
};

export const day16Part2 = () => {
  return -1;
};
