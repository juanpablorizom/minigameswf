import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { AppButton } from '../components/AppButton';
import { GameCard } from '../components/GameCard';
import { AppScreen } from '../components/AppScreen';
import { layout, spacing } from '../system/layout';
import { textStyles } from '../system/typography';
import { useTheme } from '../theme';

const impostorArtwork = require('../assets/impostor-catalog-cover.png');

type GamesCatalogScreenProps = {
  embedded?: boolean;
  onSelectImpostor: () => void;
};

export function GamesCatalogScreen({ embedded = false, onSelectImpostor }: GamesCatalogScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWide = width >= 860;
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const content = (
    <View style={styles.catalogShell}>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        {featuredGames.map((game) => (
          <View key={game.id} style={[styles.cell, isWide && styles.cellWide]}>
            <GameCard
              title={t(`gameMeta.names.${game.id}`)}
              imageSource={impostorArtwork}
              onPress={onSelectImpostor}
              onHelpPress={() => setIsHelpOpen(true)}
            />
          </View>
        ))}

        {Array.from({ length: 3 }).map((_, index) => (
          <View key={`future-slot-${index}`} style={[styles.cell, isWide && styles.cellWide]}>
            <GameCard
              inactive
              showHelpButton={false}
              title={t('gamesCatalog.futureSlot')}
              placeholderLabel={t('gamesCatalog.futureSlot')}
              onPress={() => {}}
            />
          </View>
        ))}
      </View>
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embedded}>
        {content}
        <HowToPlayModal visible={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </View>
    );
  }

  return (
    <AppScreen title="Juegos" subtitle="Explora los minijuegos disponibles y elige el modo para tu grupo.">
      {content}
      <HowToPlayModal visible={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </AppScreen>
  );
}

function HowToPlayModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlayBackdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.helpPanel}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpTitle}>{t('gamesCatalog.howToPlayTitle')}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel={t('auth.modalClose')}>
              <Text style={styles.closeLabel}>{t('auth.modalClose')}</Text>
            </Pressable>
          </View>
          <View style={styles.helpBody}>
            <Text style={styles.helpCopy}>{t('gamesCatalog.howToPlayIntro')}</Text>
            <Text style={styles.helpStep}>{t('gamesCatalog.howToPlayStepOne')}</Text>
            <Text style={styles.helpStep}>{t('gamesCatalog.howToPlayStepTwo')}</Text>
            <Text style={styles.helpStep}>{t('gamesCatalog.howToPlayStepThree')}</Text>
          </View>
          <AppButton label={t('auth.modalClose')} onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    embedded: {
      width: '100%',
      maxWidth: layout.maxWidth,
      alignSelf: 'center',
      paddingHorizontal: layout.screenPaddingX,
      paddingTop: layout.screenPaddingTop,
      paddingBottom: layout.screenPaddingBottom,
      gap: layout.sectionGap
    },
    catalogShell: {
      width: '100%',
      maxWidth: layout.maxWidth,
      alignSelf: 'center',
      gap: spacing.lg
    },
    grid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.md
    },
    gridWide: {
      justifyContent: 'flex-start'
    },
    cell: {
      width: '100%'
    },
    cellWide: {
      width: '48%'
    },
    overlayBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(10, 10, 12, 0.42)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg
    },
    helpPanel: {
      width: '100%',
      maxWidth: 520,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      padding: spacing.lg,
      gap: spacing.lg
    },
    helpHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    helpTitle: {
      color: theme.colors.textPrimary,
      flex: 1,
      ...textStyles.section
    },
    closeButton: {
      minHeight: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface
    },
    closeLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    helpBody: {
      gap: spacing.sm
    },
    helpCopy: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    },
    helpStep: {
      color: theme.colors.textPrimary,
      ...textStyles.body
    }
  });
}
