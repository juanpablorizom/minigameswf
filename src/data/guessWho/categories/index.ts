import type { GuessWhoCategoryId } from '../../../navigation/types';

import moviesSeries from './moviesSeries';
import popular from './popular';

export const guessWhoCategoryWords: Record<GuessWhoCategoryId, string[]> = {
  'movies-series': moviesSeries,
  popular
};

export const guessWhoCategoryOptions: GuessWhoCategoryId[] = ['popular', 'movies-series'];
