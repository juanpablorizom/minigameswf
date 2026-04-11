import type { ScreenName } from './types';

export const screenOrder: ScreenName[] = ['welcome', 'lobby', 'room', 'chooseGames', 'roomSettings', 'gameplay', 'results'];

export const progressScreens = screenOrder.slice(1);
