import type { ImpostorCategoryId } from '../../navigation/types';

import animals from './animals';
import countries from './countries';
import objects from './objects';

export const impostorThemeWords: Record<ImpostorCategoryId, string[]> = {
  animals,
  countries,
  objects
};
