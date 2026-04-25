import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { guessWhoCategoryOptions } from '../../data/guessWho/categories';
import { impostorThemeOptions } from '../../data/themes';
import type { RoomSettings } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type RoomSettingsScreenProps = {
  settings: RoomSettings;
  onChangeSettings: (next: RoomSettings) => void;
  onSave: () => void;
  embedded?: boolean;
  selectedGameId?: 'impostor' | 'guess-who' | null;
};

const impostorCountOptions = [1, 2, 3, 4];
const turnOptions = [0, 30, 45, 60, 300];
const missBehaviorOptions: RoomSettings['missBehavior'][] = ['repeat', 'end'];

export function RoomSettingsScreen({
  settings,
  onChangeSettings,
  onSave,
  embedded = false,
  selectedGameId = 'impostor'
}: RoomSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  function handleMissBehaviorChange(nextMissBehavior: RoomSettings['missBehavior']) {
    onChangeSettings({
      ...settings,
      missBehavior: nextMissBehavior
    });
  }

  const content = (
    <>
      {selectedGameId === 'guess-who' ? (
        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t('roomSettings.guessWhoCategory')}</Text>
          <View style={styles.optionColumn}>
            {guessWhoCategoryOptions.map((guessWhoCategory) => (
              <OptionChip
                key={guessWhoCategory}
                label={t(`roomSettings.guessWhoCategoryOptions.${guessWhoCategory}`)}
                active={settings.guessWhoCategory === guessWhoCategory}
                onPress={() => onChangeSettings({ ...settings, guessWhoCategory })}
              />
            ))}
          </View>
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard>
            <Text style={styles.sectionTitle}>{t('roomSettings.impostorCount')}</Text>
            <View style={styles.optionRow}>
              {impostorCountOptions.map((impostorCount) => (
                <OptionChip
                  key={impostorCount}
                  label={t('roomSettings.impostorCountValue', { count: impostorCount })}
                  active={settings.impostorCount === impostorCount}
                  onPress={() => onChangeSettings({ ...settings, impostorCount })}
                />
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>{t('roomSettings.theme')}</Text>
            <Text style={styles.summaryCopy}>{t('roomSettings.themeHint')}</Text>
            <View style={styles.optionColumn}>
              {impostorThemeOptions.map((themeCategory) => (
                <OptionChip
                  key={themeCategory}
                  label={t(`roomSettings.themeOptions.${themeCategory}`)}
                  active={settings.themeCategory === themeCategory}
                  onPress={() => onChangeSettings({ ...settings, themeCategory })}
                />
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>{t('roomSettings.turnTimer')}</Text>
            <View style={styles.optionRow}>
              {turnOptions.map((turnSeconds) => (
                <OptionChip
                  key={turnSeconds}
                  label={
                    turnSeconds === 0
                      ? t('roomSettings.turnTimerOptions.none')
                      : turnSeconds === 300
                        ? t('roomSettings.turnTimerOptions.fiveMinutes')
                        : `${turnSeconds}s`
                  }
                  active={settings.turnSeconds === turnSeconds}
                  onPress={() => onChangeSettings({ ...settings, turnSeconds })}
                />
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>{t('roomSettings.missBehavior')}</Text>
            <Text style={styles.summaryCopy}>{t('roomSettings.missBehaviorHint')}</Text>
            <View style={styles.optionColumn}>
              {missBehaviorOptions.map((missBehavior) => (
                <OptionChip
                  key={missBehavior}
                  label={t(`roomSettings.missBehaviorOptions.${missBehavior}`)}
                  active={settings.missBehavior === missBehavior}
                  onPress={() => handleMissBehaviorChange(missBehavior)}
                />
              ))}
            </View>
          </SurfaceCard>
        </>
      )}

      {!embedded ? <AppButton label={t('roomSettings.save')} onPress={onSave} /> : null}
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedContent}>{content}</View>;
  }

  return (
    <AppScreen title={t('roomSettings.title')} subtitle={t('roomSettings.subtitle')}>
      {content}
    </AppScreen>
  );
}

type OptionChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function OptionChip({ label, active, disabled = false, onPress }: OptionChipProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.optionChip, active && styles.optionChipActive, disabled && styles.optionChipDisabled]}>
      <Text style={[styles.optionLabel, active && styles.optionLabelActive, disabled && styles.optionLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  summaryCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  optionColumn: {
    gap: spacing.sm
  },
  embeddedContent: {
    gap: spacing.lg
  },
  optionChip: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundElevated,
    justifyContent: 'center'
  },
  optionChipActive: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success
  },
  optionChipDisabled: {
    opacity: 0.5
  },
  optionLabel: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600'
  },
  optionLabelActive: {
    color: theme.colors.successText
  },
  optionLabelDisabled: {
    color: theme.colors.textMuted
  }
  });
}
