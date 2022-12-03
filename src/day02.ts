import { chainFrom } from "transducist";

import { read } from "./util";

const dataFilePath = "data/day02-prod.txt";

enum RPSShape {
  "ROCK" = 1,
  "PAPER",
  "SCISSORS",
}

const opponentShape = (letter: string) => {
  switch (letter) {
    case "A":
      return RPSShape.ROCK;
    case "B":
      return RPSShape.PAPER;
    case "C":
      return RPSShape.SCISSORS;
    default:
      throw new Error(letter);
  }
};

const yourShape = (letter: string) => {
  switch (letter) {
    case "X":
      return RPSShape.ROCK;
    case "Y":
      return RPSShape.PAPER;
    case "Z":
      return RPSShape.SCISSORS;
    default:
      throw new Error(letter);
  }
};

const yourShape2 = (opponentShape: RPSShape, letter: string) => {
  switch (letter) {
    case "X":
      /* we lose */
      switch (opponentShape) {
        case RPSShape.ROCK:
          return RPSShape.SCISSORS;
        case RPSShape.PAPER:
          return RPSShape.ROCK;
        case RPSShape.SCISSORS:
          return RPSShape.PAPER;
      }
    case "Y":
      /* we draw */
      return opponentShape;
    case "Z":
      /* we win */
      switch (opponentShape) {
        case RPSShape.ROCK:
          return RPSShape.PAPER;
        case RPSShape.PAPER:
          return RPSShape.SCISSORS;
        case RPSShape.SCISSORS:
          return RPSShape.ROCK;
      }
    default:
      throw new Error(letter);
  }
};

const scoreGame = (opponentPlay: RPSShape, yourPlay: RPSShape) => {
  let roundScore = 0;
  switch (opponentPlay) {
    case RPSShape.ROCK:
      switch (yourPlay) {
        case RPSShape.ROCK:
          roundScore = 3;
          break;
        case RPSShape.PAPER:
          roundScore = 6;
          break;
        case RPSShape.SCISSORS:
          roundScore = 0;
          break;
      }
      break;
    case RPSShape.PAPER:
      switch (yourPlay) {
        case RPSShape.ROCK:
          roundScore = 0;
          break;
        case RPSShape.PAPER:
          roundScore = 3;
          break;
        case RPSShape.SCISSORS:
          roundScore = 6;
          break;
      }
      break;
    case RPSShape.SCISSORS:
      switch (yourPlay) {
        case RPSShape.ROCK:
          roundScore = 6;
          break;
        case RPSShape.PAPER:
          roundScore = 0;
          break;
        case RPSShape.SCISSORS:
          roundScore = 3;
          break;
      }
      break;
  }

  return roundScore + yourPlay;
};

export const day02Part1 = () => {
  const data = read(dataFilePath);

  return chainFrom(data.split("\n"))
    .map((strategyGuide) => {
      const [opponentShapeLetter, yourShapeLetter] = strategyGuide.split(" ");

      return scoreGame(
        opponentShape(opponentShapeLetter),
        yourShape(yourShapeLetter)
      );
    })
    .sum();
};

export const day02Part2 = () => {
  const data = read(dataFilePath);

  return chainFrom(data.split("\n"))
    .map((strategyGuide) => {
      const [opponentShapeLetter, yourShapeLetter] = strategyGuide.split(" ");

      const opponentShapePlay = opponentShape(opponentShapeLetter);
      return scoreGame(
        opponentShapePlay,
        yourShape2(opponentShapePlay, yourShapeLetter)
      );
    })
    .sum();
};
