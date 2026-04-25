import type { ImpostorCategoryId } from '../../navigation/types';

import animals from './animals';
import basketball from './basketball';
import cartoonsFictional from './cartoonsFictional';
import countries from './countries';
import f1 from './f1';
import facesGestures from './facesGestures';
import famousPeople from './famousPeople';
import footballPlayers from './footballPlayers';
import moviesSeries from './moviesSeries';
import objects from './objects';
import singers from './singers';
import worldFoods from './worldFoods';
import youtubers from './youtubers';

export const impostorThemeWords: Record<ImpostorCategoryId, string[]> = {
  animals,
  basketball,
  'cartoons-fictional': cartoonsFictional,
  countries,
  f1,
  'faces-gestures': facesGestures,
  'famous-people': famousPeople,
  'football-players': footballPlayers,
  'movies-series': moviesSeries,
  objects,
  singers,
  'world-foods': worldFoods,
  youtubers
};

export const impostorThemeOptions: ImpostorCategoryId[] = [
  'faces-gestures',
  'movies-series',
  'cartoons-fictional',
  'animals',
  'countries',
  'objects',
  'famous-people',
  'football-players',
  'youtubers',
  'basketball',
  'f1',
  'singers',
  'world-foods'
];
