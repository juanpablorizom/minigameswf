import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type ChooseGamesScreenProps = {
  selectedGameIds: string[];
  onToggleGame: (gameId: string) => void;
  onSave: () => void;
};

export function ChooseGamesScreen({ selectedGameIds, onToggleGame, onSave }: ChooseGamesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const impostor = featuredGames[0];
  const selected = selectedGameIds.includes(impostor.id);

  return (
    <AppScreen title={t('chooseGames.title')} subtitle={t('chooseGames.subtitle')}>
      <SurfaceCard>
        <Text style={styles.selectionTitle}>{t('chooseGames.onlyModeTitle')}</Text>
        <Text style={styles.selectionCopy}>{t('chooseGames.onlyModeCopy')}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.header}>
          <View style={styles.meta}>
            <Text style={styles.title}>{t(`gameMeta.names.${impostor.id}`)}</Text>
            <Text style={styles.subtitle}>{t(`gameMeta.descriptions.${impostor.id}`)}</Text>
          </View>
          <Badge label={selected ? t('chooseGames.selected') : t('chooseGames.tapToAdd')} tone={selected ? 'success' : 'neutral'} />
        </View>
        <AppButton
          label={selected ? t('chooseGames.keepSelected') : t('chooseGames.selectImpostor')}
          onPress={() => onToggleGame(impostor.id)}
          variant={selected ? 'secondary' : 'primary'}
        />
      </SurfaceCard>

      <AppButton label={t('chooseGames.save')} onPress={onSave} disabled={!selected} />
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    selectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    selectionCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    header: {
      flexDirection: 'row',
      gap: spacing.md
    },
    meta: {
      flex: 1,
      gap: spacing.xs
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    }
  });
}
