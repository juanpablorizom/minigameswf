import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { LobbyActionId, LobbyScenario } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { layout } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

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
    <AppScreen>
      <SurfaceCard>
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
        {(scenario.key === 'guest' || scenario.key === 'noRoom') ? (
          <View style={styles.pillRow}>
            <AppButton label={t('lobby.quickPlay')} onPress={() => onAction('quickPlay')} variant="ghost" />
            <AppButton label={t('lobby.scanQr')} onPress={() => onAction('scanQr')} variant="ghost" />
          </View>
        ) : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  heroTitle: {
    color: theme.colors.textPrimary,
    ...textStyles.hero,
    maxWidth: 680
  },
  copy: {
    color: theme.colors.textSecondary,
    ...textStyles.body,
    maxWidth: 720
  },
  actionRow: {
    gap: layout.controlGap
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.controlGap,
    alignItems: 'center'
  },
  notice: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    lineHeight: 18
  }
  });
}
