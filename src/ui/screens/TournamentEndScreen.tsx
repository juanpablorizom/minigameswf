import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RoomMemberView } from '../../data/rooms';
import type { TournamentScore } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { Badge } from '../components/Badge';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';
import { textStyles } from '../system/typography';

type TournamentEndScreenProps = {
  members?: RoomMemberView[];
  scores?: TournamentScore[];
  canManageRoom?: boolean;
  onRestartTournament: () => void;
  onBackToRoom: () => void;
  onCloseRoom: () => void;
};

export function TournamentEndScreen({
  members = [],
  scores = [],
  canManageRoom = false,
  onRestartTournament,
  onBackToRoom,
  onCloseRoom
}: TournamentEndScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const rows = members
    .filter((member) => member.isActive)
    .map((member) => ({
      id: member.userId,
      name: member.displayName,
      avatarId: member.avatarId,
      frameId: member.frameId,
      points: scores.find((score) => score.userId === member.userId)?.points ?? 0
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  const podium = rows.slice(0, 3);

  return (
    <AppScreen title={t('tournament.endTitle')} subtitle={t('tournament.endSubtitle')}>
      <CelebrationBurst />
      <SurfaceCard>
        <View style={styles.podiumRow}>
          {podium.map((entry, index) => (
            <View key={entry.id} style={[styles.podiumCard, index === 0 && styles.winnerCard]}>
              <Badge label={t(`tournament.place.${index + 1}`)} tone={index === 0 ? 'accent' : 'neutral'} />
              <AvatarSilhouette size={index === 0 ? 76 : 62} avatarId={entry.avatarId} frameId={entry.frameId} />
              <Text style={styles.podiumName}>{entry.name}</Text>
              <Text style={styles.podiumPoints}>{t('tournament.points', { count: entry.points })}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('tournament.scoreboard')}</Text>
        {rows.map((entry, index) => (
          <View key={entry.id} style={styles.scoreRow}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.scoreName}>{entry.name}</Text>
            <Badge label={t('tournament.points', { count: entry.points })} tone={index === 0 ? 'success' : 'neutral'} />
          </View>
        ))}
      </SurfaceCard>

      <View style={styles.actions}>
        <AppButton label={t('tournament.backToRoom')} onPress={onBackToRoom} variant="secondary" />
        {canManageRoom ? <AppButton label={t('tournament.restartTournament')} onPress={onRestartTournament} /> : null}
        {canManageRoom ? <AppButton label={t('tournament.closeRoom')} onPress={onCloseRoom} variant="ghost" /> : null}
      </View>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    podiumRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'stretch'
    },
    podiumCard: {
      flex: 1,
      minHeight: 190,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm
    },
    winnerCard: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    podiumName: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontSize: typography.body,
      fontWeight: '900'
    },
    podiumPoints: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '800'
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md
    },
    rank: {
      width: 44,
      color: theme.colors.highlight,
      fontSize: typography.body,
      fontWeight: '900'
    },
    scoreName: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    actions: {
      gap: spacing.sm
    }
  });
}
