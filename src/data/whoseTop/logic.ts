export type WhoseTopScoreInput = {
  authorUserId: string;
  guesses: Array<{
    userId: string;
    isCorrect: boolean;
  }>;
};

export function validateTopSelection(items: string[], topSize: number) {
  const cleanedItems = items.map((item) => item.trim()).filter(Boolean);
  const uniqueItems = Array.from(new Set(cleanedItems));

  return uniqueItems.length === topSize ? uniqueItems : null;
}

export function shuffleTops<T>(tops: T[]) {
  const shuffled = [...tops];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function shouldAwardWhoseTopAuthorPoint(correctGuessers: number, totalGuessers: number) {
  return correctGuessers > 0 && correctGuessers < totalGuessers;
}

export function calculateWhoseTopScores(tops: WhoseTopScoreInput[]) {
  const scoreMap = new Map<string, number>();

  tops.forEach((top) => {
    const correctGuessers = top.guesses.filter((guess) => guess.isCorrect);

    correctGuessers.forEach((guess) => {
      scoreMap.set(guess.userId, (scoreMap.get(guess.userId) ?? 0) + 1);
    });

    if (shouldAwardWhoseTopAuthorPoint(correctGuessers.length, top.guesses.length)) {
      scoreMap.set(top.authorUserId, (scoreMap.get(top.authorUserId) ?? 0) + 1);
    }
  });

  return Array.from(scoreMap.entries())
    .map(([userId, points]) => ({ userId, points }))
    .sort((left, right) => right.points - left.points);
}
