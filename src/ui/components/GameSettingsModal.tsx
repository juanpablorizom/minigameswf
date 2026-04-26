import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { GameId, RoomSettings } from '../../navigation/types';
import { controls, layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';
import { AppButton } from './AppButton';
import { RoomSettingsScreen } from '../screens/RoomSettingsScreen';

type GameSettingsModalProps = {
  visible: boolean;
  gameLabel: string;
  selectedGameIds?: GameId[];
  settings: RoomSettings;
  onChangeSettings: (next: RoomSettings) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function GameSettingsModal({
  visible,
  gameLabel,
  selectedGameIds = ['impostor'],
  settings,
  onChangeSettings,
  onCancel,
  onSave
}: GameSettingsModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancel} />
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{t('roomSettings.modalTitle', { game: gameLabel })}</Text>
            </View>
            <Pressable onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeLabel}>{t('auth.modalClose')}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            <RoomSettingsScreen
              embedded
              settings={settings}
              selectedGameIds={selectedGameIds}
              onChangeSettings={onChangeSettings}
              onSave={onSave}
            />
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label={t('common.cancel')} variant="secondary" onPress={onCancel} />
            <AppButton label={t('roomSettings.save')} onPress={onSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg
    },
    panel: {
      width: '100%',
      maxWidth: 760,
      maxHeight: '88%',
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      flexShrink: 1,
      minHeight: 0
    },
    header: {
      paddingHorizontal: layout.screenPaddingX,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    headerCopy: {
      flex: 1
    },
    title: {
      color: theme.colors.textPrimary,
      ...textStyles.title
    },
    closeButton: {
      minHeight: controls.minHeight,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    bodyScroll: {
      flexGrow: 1,
      flexShrink: 1,
      minHeight: 0
    },
    body: {
      paddingHorizontal: layout.screenPaddingX,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      flexGrow: 1
    },
    actions: {
      paddingHorizontal: layout.screenPaddingX,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'flex-end'
    }
  });
}
