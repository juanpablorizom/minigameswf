import type { TournamentScore, TriviaTopicId } from '../../navigation/types';
import type { TriviaQuestion } from './questions';

export type TriviaRankingInput = {
  userId: string;
  correctCount: number;
};

export type TriviaRankingEntry = TriviaRankingInput & {
  rank: number;
  tournamentPoints: number;
};

export function normalizeTriviaAnswer(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function validateTriviaAnswer(question: TriviaQuestion, answer: string) {
  const normalizedAnswer = normalizeTriviaAnswer(answer);
  const acceptedAnswers = [question.answer, ...(question.aliases ?? [])].map(normalizeTriviaAnswer);

  return acceptedAnswers.includes(normalizedAnswer);
}

export function selectRandomTriviaQuestions(
  questions: TriviaQuestion[],
  topics: TriviaTopicId[],
  questionCount: number
) {
  const topicSet = new Set(topics);
  const candidates = questions.filter((question) => topicSet.has(question.topic));
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, Math.max(1, questionCount));
}

export function calculateTriviaRanking(entries: TriviaRankingInput[]): TriviaRankingEntry[] {
  const sortedEntries = [...entries].sort((a, b) => b.correctCount - a.correctCount || a.userId.localeCompare(b.userId));
  let lastCorrectCount: number | null = null;
  let currentRank = 0;

  return sortedEntries.map((entry) => {
    if (lastCorrectCount === null || entry.correctCount < lastCorrectCount) {
      currentRank += 1;
      lastCorrectCount = entry.correctCount;
    }

    return {
      ...entry,
      rank: currentRank,
      tournamentPoints: currentRank === 1 ? 3 : currentRank === 2 ? 2 : currentRank === 3 ? 1 : 0
    };
  });
}

export function calculateTriviaTournamentScores(entries: TriviaRankingInput[]): TournamentScore[] {
  return calculateTriviaRanking(entries).map((entry) => ({
    userId: entry.userId,
    points: entry.tournamentPoints
  }));
}
