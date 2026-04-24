import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import type { RoomMemberView } from '../../data/rooms';
import { podium } from '../../data/mockData';
import type { ImpostorRoundSetup } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';
import { textStyles } from '../system/typography';

type ResultsScreenProps = {
  members?: RoomMemberView[];
  round?: ImpostorRoundSetup | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
};

export function ResultsScreen({ members = [], round = null, onPlayAgain, onBackToLobby }: ResultsScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const revealValue = useRef(new Animated.Value(0)).current;
  const impostorMembers = members.filter((member) => round?.impostorIds.includes(member.userId));
  const revealedNames = impostorMembers.length ? impostorMembers.map((member) => member.displayName).join(', ') : podium[0]?.name ?? 'Impostor';
  const civiliansWon = round?.outcome === 'impostors_caught';
  const impostorsWon = round ? !civiliansWon : false;
  const rows = members.length
    ? members.map((member) => {
        const isImpostor = Boolean(round?.impostorIds.includes(member.userId));
        const won = isImpostor ? impostorsWon : civiliansWon;

        return {
          id: member.id,
          name: member.displayName,
          role: isImpostor ? 'Impostor' : 'Tripulante',
          result: won ? 'Gano' : 'Perdio',
          tone: won ? 'success' : 'neutral'
        } as const;
      })
    : podium.map((entry, index) => ({
        id: entry.id,
        name: entry.name,
        role: index === 0 ? 'Impostor' : 'Tripulante',
        result: index === 0 ? 'Perdio' : 'Gano',
        tone: index === 0 ? 'neutral' : 'success'
      } as const));

  useEffect(() => {
    revealValue.setValue(0);
    Animated.spring(revealValue, {
      toValue: 1,
      friction: 7,
      tension: 72,
      useNativeDriver: true
    }).start();
  }, [revealValue, revealedNames]);

  const revealStyle = {
    opacity: revealValue,
    transform: [
      {
        translateY: revealValue.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0]
        })
      },
      {
        scale: revealValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1]
        })
      }
    ]
  };

  return (
    <AppScreen>
      <Animated.View style={revealStyle}>
        <SurfaceCard>
          <View style={styles.revealHeader}>
            <Badge label="Impostor revelado" tone="accent" />
            <Text style={styles.revealTitle}>{revealedNames}</Text>
            <Text style={styles.revealCopy}>
              {civiliansWon
                ? 'El grupo encontro al impostor y cerro la ronda.'
                : 'El impostor sobrevivio la votacion y se llevo la ronda.'}
            </Text>
          </View>
        </SurfaceCard>
      </Animated.View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Resultados</Text>
        {rows.map((entry) => (
          <View key={entry.id} style={styles.scoreRow}>
            <AvatarSilhouette size={46} />
            <View style={styles.scoreMeta}>
              <Text style={styles.scoreName}>{entry.name}</Text>
              <Text style={styles.scoreBadge}>{entry.role}</Text>
            </View>
            <Badge label={entry.result} tone={entry.tone} />
          </View>
        ))}
      </SurfaceCard>

      <View style={styles.actions}>
        <AppButton label="Jugar de nuevo" onPress={onPlayAgain} />
        <AppButton label="Salir" onPress={onBackToLobby} variant="secondary" />
      </View>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    revealHeader: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md
    },
    revealTitle: {
      color: theme.colors.highlight,
      fontSize: 44,
      lineHeight: 50,
      fontWeight: '800',
      textAlign: 'center'
    },
    revealCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 24,
      textAlign: 'center',
      maxWidth: 520
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
    scoreMeta: {
      flex: 1,
      gap: 2
    },
    scoreName: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    scoreBadge: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    actions: {
      gap: spacing.sm
    }
  });
}
