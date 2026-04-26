export type WhoSaidScoreInput = {
  authorUserId: string;
  guesses: Array<{
    userId: string;
    isCorrect: boolean;
  }>;
};

export type WhoSaidScoreResult = {
  userId: string;
  points: number;
};

export function shufflePhrases<T>(phrases: T[]) {
  const shuffled = [...phrases];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function canGuessWhoSaidPhrase(currentUserId: string, authorUserId: string, hasGuessed: boolean) {
  return currentUserId !== authorUserId && !hasGuessed;
}

export function shouldAwardWhoSaidAuthorPoint(correctGuessers: number, totalGuessers: number) {
  return correctGuessers > 0 && correctGuessers < totalGuessers;
}

export function calculateWhoSaidScores(rounds: WhoSaidScoreInput[]) {
  const scoreMap = new Map<string, number>();

  rounds.forEach((round) => {
    const correctGuessers = round.guesses.filter((guess) => guess.isCorrect);

    correctGuessers.forEach((guess) => {
      scoreMap.set(guess.userId, (scoreMap.get(guess.userId) ?? 0) + 1);
    });

    if (shouldAwardWhoSaidAuthorPoint(correctGuessers.length, round.guesses.length)) {
      scoreMap.set(round.authorUserId, (scoreMap.get(round.authorUserId) ?? 0) + 1);
    }
  });

  return Array.from(scoreMap.entries())
    .map(([userId, points]) => ({ userId, points }))
    .sort((left, right) => right.points - left.points);
}
