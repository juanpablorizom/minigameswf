import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { LobbyActionId, LobbyScenario } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type LobbyScreenProps = {
  displayName: string;
  scenario: LobbyScenario;
  onAction: (actionId: LobbyActionId) => void;
  notice?: string | null;
};

export function LobbyScreen({ displayName, scenario, onAction, notice = null }: LobbyScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const activeRoomBadge = scenario.roomSummary ? t('lobby.roomActive') : t('lobby.noActiveRoom');
  const actionLabels: Record<LobbyActionId, string> = {
    createRoom: t('lobby.createRoom'),
    joinByCode: t('lobby.joinByCode'),
    scanQr: t('lobby.scanQr'),
    continueRoom: t('lobby.continueRoom'),
    inviteFriends: t('lobby.shareCode'),
    resumeActivity: t('lobby.resume'),
    quickPlay: t('lobby.quickPlay')
  };

  return (
    <AppScreen title={`${scenario.greeting}, ${displayName}`} subtitle={scenario.statusLabel}>
      <SurfaceCard>
        <View style={styles.heroTopRow}>
          <Badge label={scenario.statusLabel} tone="accent" />
          <Text style={styles.stateHint}>{t('lobby.home')}</Text>
        </View>
        <Text style={styles.heroTitle}>{scenario.title}</Text>
        <Text style={styles.copy}>{scenario.subtitle}</Text>
        <View style={styles.actionRow}>
          <AppButton
            label={actionLabels[scenario.primaryAction.id] ?? scenario.primaryAction.label}
            onPress={() => onAction(scenario.primaryAction.id)}
            variant={scenario.primaryAction.variant}
          />
          {scenario.secondaryAction ? (
            <AppButton
              label={actionLabels[scenario.secondaryAction.id] ?? scenario.secondaryAction.label}
              onPress={() => onAction(scenario.secondaryAction!.id)}
              variant={scenario.secondaryAction.variant}
            />
          ) : null}
        </View>
        <View style={styles.pillRow}>
          <Badge label={activeRoomBadge} tone={scenario.roomSummary ? 'success' : 'neutral'} />
          <Badge label={t('lobby.modesReady', { count: scenario.modeIds.length })} tone="neutral" />
          {(scenario.key === 'guest' || scenario.key === 'noRoom') ? (
            <AppButton label={t('lobby.quickPlay')} onPress={() => onAction('quickPlay')} variant="ghost" />
          ) : null}
          {(scenario.key === 'guest' || scenario.key === 'noRoom') ? (
            <AppButton label={t('lobby.scanQr')} onPress={() => onAction('scanQr')} variant="ghost" />
          ) : null}
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>

      {scenario.roomSummary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lobby.currentRoom')}</Text>
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
              label={t('lobby.openRoom')}
              onPress={() => onAction(scenario.roomSummary!.ctaAction)}
              variant="secondary"
            />
          </SurfaceCard>
        </View>
      ) : null}

      {scenario.invite ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lobby.inviteWaiting')}</Text>
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
          <Text style={styles.sectionTitle}>{t('lobby.resume')}</Text>
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

      {scenario.socialItems.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lobby.roomActivity')}</Text>
          {scenario.socialItems.map((item) => (
            <SurfaceCard key={item.id}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </SurfaceCard>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lobby.roomActivity')}</Text>
          <SurfaceCard>
            <Text style={styles.itemTitle}>{t('lobby.roomActivityEmptyTitle')}</Text>
            <Text style={styles.itemSubtitle}>{t('lobby.roomActivityEmptySubtitle')}</Text>
          </SurfaceCard>
        </View>
      )}

      {scenario.recommendationItems.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lobby.goodNextMove')}</Text>
          {scenario.recommendationItems.map((item) => (
            <SurfaceCard key={item.id}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </SurfaceCard>
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm
  },
  stateHint: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.1
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.8
  },
  copy: {
    color: theme.colors.textSecondary,
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
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  itemTitle: {
    color: theme.colors.textPrimary,
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
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  supportingCopy: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18
  },
  codePill: {
    minWidth: 74,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center'
  },
  codeLabel: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  notice: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    lineHeight: 18
  }
  });
}
