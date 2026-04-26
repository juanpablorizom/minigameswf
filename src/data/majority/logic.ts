import type { MajorityQuestion } from './questions';
import type { MajorityCategoryId } from '../../navigation/types';

export function selectRandomMajorityQuestions(
  questions: MajorityQuestion[],
  category: MajorityCategoryId,
  roundCount: number
) {
  const filteredQuestions = questions.filter((question) => question.category === category);
  const shuffled = [...filteredQuestions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(1, Math.min(roundCount, shuffled.length)));
}

export function calculateMajorityOptions(answers: string[]) {
  const optionCounts = answers.reduce<Record<string, number>>((counts, answer) => {
    counts[answer] = (counts[answer] ?? 0) + 1;
    return counts;
  }, {});
  const highestCount = Math.max(0, ...Object.values(optionCounts));
  const majorityOptions = Object.entries(optionCounts)
    .filter(([, count]) => count === highestCount && highestCount > 0)
    .map(([option]) => option);

  return { majorityOptions, optionCounts };
}

export function isMajorityPredictionCorrect(prediction: string | null, majorityOptions: string[]) {
  return Boolean(prediction && majorityOptions.includes(prediction));
}

export function calculateMajorityScores(predictions: Array<{ userId: string; predictionOption: string | null }>, majorityOptions: string[]) {
  return predictions
    .filter((prediction) => isMajorityPredictionCorrect(prediction.predictionOption, majorityOptions))
    .map((prediction) => ({ userId: prediction.userId, points: 1 }));
}
