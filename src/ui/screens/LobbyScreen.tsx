import { StyleSheet, Text, View } from 'react-native';

import { featuredGames, lobbyHighlights, onlineFriends } from '../../data/mockData';
import type { UserProfile } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, spacing, typography } from '../theme';

type LobbyScreenProps = {
  profile: UserProfile;
  onCreateRoom: () => void;
  onQuickPlay: () => void;
};

export function LobbyScreen({ profile, onCreateRoom, onQuickPlay }: LobbyScreenProps) {
  return (
    <AppScreen title={`Good evening, ${profile.name}`} subtitle="Rooms are built for quick starts, easy invites, and clean transitions into play.">
      <SurfaceCard>
        <Badge label="Tonight's lobby" tone="accent" />
        <Text style={styles.heroTitle}>Start a private room and pull your crew in fast.</Text>
        <Text style={styles.copy}>
          Keep the focus on the table: create a room, lock the lineup, and move straight into a social game stack.
        </Text>
        <View style={styles.actionRow}>
          <AppButton label="Create Private Room" onPress={onCreateRoom} />
          <AppButton label="Quick Play Preview" onPress={onQuickPlay} variant="secondary" />
        </View>
        <View style={styles.pillRow}>
          <Badge label="4 friends online" tone="success" />
          <Badge label="Featured: Mentiroso Profesional" tone="neutral" />
        </View>
      </SurfaceCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured tonight</Text>
        <SurfaceCard>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredMeta}>
              <Text style={styles.itemTitle}>Mentiroso Profesional</Text>
              <Text style={styles.itemSubtitle}>A bluffing round built for fast social reads, clean answers, and loud reactions.</Text>
            </View>
            <Badge label="5 min" tone="accent" />
          </View>
        </SurfaceCard>
        {featuredGames.slice(0, 2).map((game) => (
          <SurfaceCard key={game.id}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredMeta}>
                <Text style={styles.itemTitle}>{game.name}</Text>
                <Text style={styles.itemSubtitle}>{game.description}</Text>
              </View>
              <Badge label={game.category} />
            </View>
          </SurfaceCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room pulse</Text>
        {lobbyHighlights.map((item) => (
          <SurfaceCard key={item.id}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </SurfaceCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends around tonight</Text>
        {onlineFriends.map((item) => (
          <SurfaceCard key={item.id}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </SurfaceCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.8
  },
  copy: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  actionRow: {
    gap: spacing.sm
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  featuredHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start'
  },
  featuredMeta: {
    flex: 1,
    gap: spacing.xs
  },
  itemSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  }
});
