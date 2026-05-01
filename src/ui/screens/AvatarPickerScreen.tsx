import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AVATAR_CATALOG, FRAME_CATALOG } from '../../data/avatarCatalog';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Avatar } from '../components/Avatar';
import { MinimalIcon } from '../components/MinimalIcon';
import { SurfaceCard } from '../components/SurfaceCard';
import { layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type AvatarPickerScreenProps = {
  embedded?: boolean;
  avatarId?: string | null;
  frameId?: string | null;
  isBusy?: boolean;
  notice?: string | null;
  onSave: (avatarId: string, frameId: string) => void;
};

export function AvatarPickerScreen({
  embedded = false,
  avatarId = 'default',
  frameId = 'plain',
  isBusy = false,
  notice = null,
  onSave
}: AvatarPickerScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatarId ?? 'default');
  const [selectedFrameId, setSelectedFrameId] = useState(frameId ?? 'plain');
  const hasChanges = selectedAvatarId !== (avatarId ?? 'default') || selectedFrameId !== (frameId ?? 'plain');

  const content = useMemo(
    () => (
      <>
        <SurfaceCard>
          <View style={styles.previewRow}>
            <Avatar avatarId={selectedAvatarId} frameId={selectedFrameId} size={104} />
            <View style={styles.previewCopy}>
              <Text style={styles.sectionTitle}>{t('profile.avatarPicker')}</Text>
              <Text style={styles.helper}>{t('profile.avatarPickerHint')}</Text>
            </View>
          </View>
        </SurfaceCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.avatar')}</Text>
          <View style={styles.avatarGrid}>
            {AVATAR_CATALOG.map((avatar) => {
              const isActive = selectedAvatarId === avatar.id;
              return (
                <Pressable
                  key={avatar.id}
                  onPress={() => setSelectedAvatarId(avatar.id)}
                  style={({ pressed, hovered }) => [
                    styles.avatarOption,
                    hovered && styles.optionHover,
                    isActive && styles.optionActive,
                    pressed && styles.optionPressed
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t(`avatars.${avatar.id}`, { defaultValue: avatar.label })}
                >
                  <Avatar avatarId={avatar.id} frameId={selectedFrameId} size={62} />
                  {isActive ? (
                    <View style={styles.optionCheck}>
                      <MinimalIcon name="check" size={14} color={theme.colors.primaryText} strokeWidth={3} />
                    </View>
                  ) : null}
                  <Text style={styles.optionLabel}>{t(`avatars.${avatar.id}`, { defaultValue: avatar.label })}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.frame')}</Text>
          <View style={styles.frameRow}>
            {FRAME_CATALOG.map((frame) => {
              const isActive = selectedFrameId === frame.id;
              return (
                <Pressable
                  key={frame.id}
                  onPress={() => setSelectedFrameId(frame.id)}
                  style={({ pressed, hovered }) => [
                    styles.frameOption,
                    hovered && styles.optionHover,
                    isActive && styles.optionActive,
                    pressed && styles.optionPressed
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t(`frames.${frame.id}`, { defaultValue: frame.label })}
                >
                  <View
                    style={[
                      styles.framePreview,
                      frame.borderColor
                        ? {
                            borderColor: frame.borderColor,
                            borderWidth: frame.borderWidth,
                            borderStyle: frame.borderStyle ?? 'solid'
                          }
                        : null
                    ]}
                  />
                  <Text style={styles.frameLabel}>{t(`frames.${frame.id}`, { defaultValue: frame.label })}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <AppButton label={t('common.save')} onPress={() => onSave(selectedAvatarId, selectedFrameId)} disabled={isBusy || !hasChanges} />
      </>
    ),
    [frameId, hasChanges, isBusy, notice, onSave, selectedAvatarId, selectedFrameId, styles, t, theme.colors.primaryText, avatarId]
  );

  if (embedded) {
    return <View style={styles.embedded}>{content}</View>;
  }

  return (
    <AppScreen title={t('profile.avatarPicker')} subtitle={t('profile.avatarPickerHint')}>
      {content}
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    embedded: {
      gap: layout.sectionGap
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg
    },
    previewCopy: {
      flex: 1,
      gap: spacing.xs
    },
    helper: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    },
    section: {
      gap: spacing.md
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md
    },
    avatarOption: {
      width: 112,
      minHeight: 126,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      position: 'relative'
    },
    frameRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm
    },
    frameOption: {
      width: 108,
      minHeight: 86,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs
    },
    optionHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceMuted,
      transform: [{ translateY: -2 }]
    },
    optionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    optionPressed: {
      transform: [{ scale: 0.98 }]
    },
    optionCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    optionLabel: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontSize: typography.caption,
      fontWeight: '800'
    },
    framePreview: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.backgroundElevated
    },
    frameLabel: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontSize: typography.caption,
      fontWeight: '700'
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18
    }
  });
}
