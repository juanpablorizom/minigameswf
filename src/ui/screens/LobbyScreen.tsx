import { StyleSheet, Text, View } from 'react-native';

import { featuredGames } from '../../data/mockData';
import type { LobbyActionId, LobbyScenario } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, radius, spacing, typography } from '../theme';

type LobbyScreenProps = {
  displayName: string;
  scenario: LobbyScenario;
  onAction: (actionId: LobbyActionId) => void;
};

export function LobbyScreen({ displayName, scenario, onAction }: LobbyScreenProps) {
  const availableModes = featuredGames.filter((game) => scenario.modeIds.includes(game.id));

  return (
    <AppScreen title={`${scenario.greeting}, ${displayName}`} subtitle={scenario.statusLabel}>
      <SurfaceCard>
        <View style={styles.heroTopRow}>
          <Badge label={scenario.statusLabel} tone="accent" />
          <Text style={styles.stateHint}>Home</Text>
        </View>
        <Text style={styles.heroTitle}>{scenario.title}</Text>
        <Text style={styles.copy}>{scenario.subtitle}</Text>
        <View style={styles.actionRow}>
          <AppButton
            label={scenario.primaryAction.label}
            onPress={() => onAction(scenario.primaryAction.id)}
            variant={scenario.primaryAction.variant}
          />
          {scenario.secondaryAction ? (
            <AppButton
              label={scenario.secondaryAction.label}
              onPress={() => onAction(scenario.secondaryAction!.id)}
              variant={scenario.secondaryAction.variant}
            />
          ) : null}
        </View>
        <View style={styles.pillRow}>
          <Badge label={`${scenario.socialItems.length} live updates`} tone="success" />
          <Badge label={`${availableModes.length} modes ready`} tone="neutral" />
          {(scenario.key === 'guest' || scenario.key === 'noRoom') ? (
            <AppButton label="Quick play" onPress={() => onAction('quickPlay')} variant="ghost" />
          ) : null}
        </View>
      </SurfaceCard>

      {scenario.roomSummary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current room</Text>
          <SurfaceCard>
            <View style={styles.detailHeader}>
              <View style={styles.detailMeta}>
                <Text style={styles.itemTitle}>{scenario.roomSummary.title}</Text>
                <Text style={styles.itemSubtitle}>{scenario.roomSummary.subtitle}</Text>
              </View>
              <View style={styles.codePill}>
                <Text style={styles.codeLabel}>{scenario.roomSummary.code}</Text>
              </View>
            </View>
            <Text style={styles.supportingCopy}>{scenario.roomSummary.meta}</Text>
            <AppButton
              label={scenario.roomSummary.ctaLabel}
              onPress={() => onAction(scenario.roomSummary!.ctaAction)}
              variant="secondary"
            />
          </SurfaceCard>
        </View>
      ) : null}

      {scenario.invite ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite waiting</Text>
          <SurfaceCard>
            <View style={styles.detailHeader}>
              <View style={styles.detailMeta}>
                <Text style={styles.itemTitle}>{scenario.invite.title}</Text>
                <Text style={styles.itemSubtitle}>{scenario.invite.subtitle}</Text>
              </View>
              <View style={styles.codePill}>
                <Text style={styles.codeLabel}>{scenario.invite.code}</Text>
              </View>
            </View>
            <Text style={styles.supportingCopy}>{scenario.invite.fromLabel}</Text>
            <AppButton
              label={scenario.invite.ctaLabel}
              onPress={() => onAction(scenario.invite!.ctaAction)}
              variant="secondary"
            />
          </SurfaceCard>
        </View>
      ) : null}

      {scenario.recentActivity ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <SurfaceCard>
            <Text style={styles.itemTitle}>{scenario.recentActivity.title}</Text>
            <Text style={styles.itemSubtitle}>{scenario.recentActivity.subtitle}</Text>
            <AppButton
              label={scenario.recentActivity.ctaLabel}
              onPress={() => onAction(scenario.recentActivity!.ctaAction)}
              variant="secondary"
            />
          </SurfaceCard>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends and room activity</Text>
        {scenario.socialItems.map((item) => (
          <SurfaceCard key={item.id}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </SurfaceCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modes ready for tonight</Text>
        {availableModes.map((game) => (
          <SurfaceCard key={game.id}>
            <View style={styles.detailHeader}>
              <View style={styles.detailMeta}>
                <Text style={styles.itemTitle}>{game.name}</Text>
                <Text style={styles.itemSubtitle}>{game.description}</Text>
              </View>
              <Badge label={game.duration} tone="neutral" />
            </View>
            <View style={styles.metaRow}>
              <Badge label={game.category} />
              <Badge label={game.energy} tone="success" />
            </View>
          </SurfaceCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Good next move</Text>
        {scenario.recommendationItems.map((item) => (
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
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm
  },
  stateHint: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.1
  },
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
    gap: spacing.sm,
    alignItems: 'center'
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
  detailHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start'
  },
  detailMeta: {
    flex: 1,
    gap: spacing.xs
  },
  itemSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  supportingCopy: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18
  },
  codePill: {
    minWidth: 74,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  codeLabel: {
    color: colors.accentSoft,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  }
});
