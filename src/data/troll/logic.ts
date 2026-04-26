import type { TrollRole } from '../../navigation/types';

export type TrollPlayerSeed = {
  userId: string;
};

export type TrollAssignmentSeed = {
  userId: string;
  role: TrollRole;
};

export type TrollOutcome = 'troll_eliminated' | 'impostor_eliminated' | 'innocent_eliminated' | 'continue';

export function assignTrollRoles(players: TrollPlayerSeed[]) {
  const shuffled = [...players];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.map((player, index) => ({
    userId: player.userId,
    role: index === 0 ? 'impostor' : index === 1 ? 'troll' : 'innocent'
  })) satisfies TrollAssignmentSeed[];
}

export function resolveTrollOutcome(eliminatedRole: TrollRole) {
  if (eliminatedRole === 'troll') {
    return 'troll_eliminated';
  }

  if (eliminatedRole === 'impostor') {
    return 'impostor_eliminated';
  }

  return 'innocent_eliminated';
}

export function calculateTrollScores(
  assignments: Array<{ userId: string; role: TrollRole; isEliminated: boolean }>,
  outcome: TrollOutcome
) {
  if (outcome === 'troll_eliminated') {
    return assignments.map((assignment) => ({ userId: assignment.userId, points: 1 }));
  }

  if (outcome !== 'impostor_eliminated') {
    return [];
  }

  return assignments
    .map((assignment) => {
      if (assignment.role === 'troll' && !assignment.isEliminated) {
        return { userId: assignment.userId, points: 4 };
      }

      if (assignment.role === 'innocent' && !assignment.isEliminated) {
        return { userId: assignment.userId, points: 1 };
      }

      return { userId: assignment.userId, points: 0 };
    })
    .filter((score) => score.points > 0);
}
