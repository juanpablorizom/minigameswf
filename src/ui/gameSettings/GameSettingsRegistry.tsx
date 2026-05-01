import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { guessWhoCategoryOptions } from '../../data/guessWho/categories';
import { majorityCategoryOptions } from '../../data/majority';
import { impostorThemeOptions } from '../../data/themes';
import { triviaTopicOptions } from '../../data/trivia';
import { whoSaidTopicOptions } from '../../data/whoSaid';
import { whoseTopCategoryOptions } from '../../data/whoseTop';
import type { GameId, RoomSettings } from '../../navigation/types';
import { radius, spacing, typography, useTheme } from '../theme';

type GameSettingsFieldsProps = {
  gameId: GameId;
  settings: RoomSettings;
  onChangeSettings: (next: RoomSettings) => void;
};

const impostorCountOptions = [1, 2, 3, 4];
const turnOptions = [0, 30, 45, 60, 300];
const triviaQuestionCountOptions = [3, 5, 8, 10];
const triviaTurnOptions = [10, 15, 20, 30];
const whoSaidWriteOptions = [30, 45, 60, 90];
const whoSaidGuessOptions = [15, 20, 30, 45];
const majorityRoundOptions = [3, 5, 8, 10];
const majorityAnswerOptions = [10, 15, 20, 30];
const majorityPredictionOptions = [10, 15, 20, 30];
const trollRoundOptions = [1, 2, 3];
const trollDiscussionOptions = [30, 45, 60, 90];
const trollVotingOptions = [15, 30, 45, 60];
const whoseTopSizeOptions = [3, 5, 10] as const;
const whoseTopCreateOptions = [45, 60, 90, 120];
const whoseTopGuessOptions = [15, 25, 30, 45];
const missBehaviorOptions: RoomSettings['games']['impostor']['missBehavior'][] = ['repeat', 'end'];

export function GameSettingsFields({ gameId, settings, onChangeSettings }: GameSettingsFieldsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  if (gameId === 'guess-who') {
    const guessWhoSettings = settings.games['guess-who'];

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.guessWhoCategory')}</Text>
        <View style={styles.optionColumn}>
          {guessWhoCategoryOptions.map((category) => (
            <OptionChip
              key={category}
              label={t(`roomSettings.guessWhoCategoryOptions.${category}`)}
              active={guessWhoSettings.category === category}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'guess-who': { ...guessWhoSettings, category }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'faces-gestures') {
    const facesGesturesSettings = settings.games['faces-gestures'];

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.turnTimer')}</Text>
        <View style={styles.optionRow}>
          {[30, 45, 60, 90].map((turnSeconds) => (
            <OptionChip
              key={turnSeconds}
              label={`${turnSeconds}s`}
              active={facesGesturesSettings.turnSeconds === turnSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'faces-gestures': { ...facesGesturesSettings, turnSeconds }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'trivia') {
    const triviaSettings = settings.games.trivia;

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.triviaQuestionCount')}</Text>
        <View style={styles.optionRow}>
          {triviaQuestionCountOptions.map((questionCount) => (
            <OptionChip
              key={questionCount}
              label={String(questionCount)}
              active={triviaSettings.questionCount === questionCount}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    trivia: { ...triviaSettings, questionCount }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.turnTimer')}</Text>
        <View style={styles.optionRow}>
          {triviaTurnOptions.map((turnSeconds) => (
            <OptionChip
              key={turnSeconds}
              label={`${turnSeconds}s`}
              active={triviaSettings.turnSeconds === turnSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    trivia: { ...triviaSettings, turnSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.triviaTopics')}</Text>
        <View style={styles.optionColumn}>
          {triviaTopicOptions.map((topic) => {
            const active = triviaSettings.topics.includes(topic);
            return (
              <OptionChip
                key={topic}
                label={t(`roomSettings.triviaTopicOptions.${topic}`)}
                active={active}
                onPress={() => {
                  const nextTopics = active
                    ? triviaSettings.topics.filter((item) => item !== topic)
                    : [...triviaSettings.topics, topic];

                  onChangeSettings({
                    ...settings,
                    games: {
                      ...settings.games,
                      trivia: { ...triviaSettings, topics: nextTopics.length ? nextTopics : triviaSettings.topics }
                    }
                  });
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }

  if (gameId === 'who-said') {
    const whoSaidSettings = settings.games['who-said'];

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.whoSaidTopic')}</Text>
        <View style={styles.optionColumn}>
          {whoSaidTopicOptions.map((topic) => (
            <OptionChip
              key={topic}
              label={t(`roomSettings.whoSaidTopicOptions.${topic}`)}
              active={whoSaidSettings.topic === topic}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'who-said': { ...whoSaidSettings, topic }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.whoSaidWriteTime')}</Text>
        <View style={styles.optionRow}>
          {whoSaidWriteOptions.map((writeSeconds) => (
            <OptionChip
              key={writeSeconds}
              label={`${writeSeconds}s`}
              active={whoSaidSettings.writeSeconds === writeSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'who-said': { ...whoSaidSettings, writeSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.whoSaidGuessTime')}</Text>
        <View style={styles.optionRow}>
          {whoSaidGuessOptions.map((guessSeconds) => (
            <OptionChip
              key={guessSeconds}
              label={`${guessSeconds}s`}
              active={whoSaidSettings.guessSeconds === guessSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'who-said': { ...whoSaidSettings, guessSeconds }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'majority') {
    const majoritySettings = settings.games.majority;

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.majorityCategory')}</Text>
        <View style={styles.optionColumn}>
          {majorityCategoryOptions.map((category) => (
            <OptionChip
              key={category}
              label={t(`roomSettings.majorityCategoryOptions.${category}`)}
              active={majoritySettings.category === category}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    majority: { ...majoritySettings, category }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.majorityRounds')}</Text>
        <View style={styles.optionRow}>
          {majorityRoundOptions.map((roundCount) => (
            <OptionChip
              key={roundCount}
              label={String(roundCount)}
              active={majoritySettings.roundCount === roundCount}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    majority: { ...majoritySettings, roundCount }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.majorityAnswerTime')}</Text>
        <View style={styles.optionRow}>
          {majorityAnswerOptions.map((answerSeconds) => (
            <OptionChip
              key={answerSeconds}
              label={`${answerSeconds}s`}
              active={majoritySettings.answerSeconds === answerSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    majority: { ...majoritySettings, answerSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.majorityPredictionTime')}</Text>
        <View style={styles.optionRow}>
          {majorityPredictionOptions.map((predictionSeconds) => (
            <OptionChip
              key={predictionSeconds}
              label={`${predictionSeconds}s`}
              active={majoritySettings.predictionSeconds === predictionSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    majority: { ...majoritySettings, predictionSeconds }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'troll') {
    const trollSettings = settings.games.troll;

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.theme')}</Text>
        <View style={styles.optionColumn}>
          {impostorThemeOptions.map((category) => (
            <OptionChip
              key={category}
              label={t(`roomSettings.themeOptions.${category}`)}
              active={trollSettings.category === category}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    troll: { ...trollSettings, category }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.rounds')}</Text>
        <View style={styles.optionRow}>
          {trollRoundOptions.map((roundCount) => (
            <OptionChip
              key={roundCount}
              label={String(roundCount)}
              active={trollSettings.roundCount === roundCount}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    troll: { ...trollSettings, roundCount }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.trollDiscussionTime')}</Text>
        <View style={styles.optionRow}>
          {trollDiscussionOptions.map((discussionSeconds) => (
            <OptionChip
              key={discussionSeconds}
              label={`${discussionSeconds}s`}
              active={trollSettings.discussionSeconds === discussionSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    troll: { ...trollSettings, discussionSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.trollVotingTime')}</Text>
        <View style={styles.optionRow}>
          {trollVotingOptions.map((votingSeconds) => (
            <OptionChip
              key={votingSeconds}
              label={`${votingSeconds}s`}
              active={trollSettings.votingSeconds === votingSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    troll: { ...trollSettings, votingSeconds }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'whose-top') {
    const whoseTopSettings = settings.games['whose-top'];

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.whoseTopCategory')}</Text>
        <View style={styles.optionColumn}>
          {whoseTopCategoryOptions.map((category) => (
            <OptionChip
              key={category}
              label={t(`roomSettings.whoseTopCategoryOptions.${category}`)}
              active={whoseTopSettings.category === category}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'whose-top': { ...whoseTopSettings, category }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.whoseTopSize')}</Text>
        <View style={styles.optionRow}>
          {whoseTopSizeOptions.map((topSize) => (
            <OptionChip
              key={topSize}
              label={String(topSize)}
              active={whoseTopSettings.topSize === topSize}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'whose-top': { ...whoseTopSettings, topSize }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.whoseTopCreateTime')}</Text>
        <View style={styles.optionRow}>
          {whoseTopCreateOptions.map((createSeconds) => (
            <OptionChip
              key={createSeconds}
              label={`${createSeconds}s`}
              active={whoseTopSettings.createSeconds === createSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'whose-top': { ...whoseTopSettings, createSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.whoseTopGuessTime')}</Text>
        <View style={styles.optionRow}>
          {whoseTopGuessOptions.map((guessSeconds) => (
            <OptionChip
              key={guessSeconds}
              label={`${guessSeconds}s`}
              active={whoseTopSettings.guessSeconds === guessSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'whose-top': { ...whoseTopSettings, guessSeconds }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'impostor') {
    const impostorSettings = settings.games.impostor;

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.impostorCount')}</Text>
        <View style={styles.optionRow}>
          {impostorCountOptions.map((impostorCount) => (
            <OptionChip
              key={impostorCount}
              label={t('roomSettings.impostorCountValue', { count: impostorCount })}
              active={impostorSettings.impostorCount === impostorCount}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, impostorCount }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.theme')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.themeHint')}</Text>
        <View style={styles.optionColumn}>
          {impostorThemeOptions.map((themeCategory) => (
            <OptionChip
              key={themeCategory}
              label={t(`roomSettings.themeOptions.${themeCategory}`)}
              active={impostorSettings.themeCategory === themeCategory}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, themeCategory }
                  }
                })
              }
            />
          ))}
        </View>

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
              active={impostorSettings.turnSeconds === turnSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, turnSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.missBehavior')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.missBehaviorHint')}</Text>
        <View style={styles.optionColumn}>
          {missBehaviorOptions.map((missBehavior) => (
            <OptionChip
              key={missBehavior}
              label={t(`roomSettings.missBehaviorOptions.${missBehavior}`)}
              active={impostorSettings.missBehavior === missBehavior}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, missBehavior }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.balanceRule')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.balanceRuleHint')}</Text>
        <View style={styles.optionRow}>
          {[true, false].map((balanceEndsGame) => (
            <OptionChip
              key={String(balanceEndsGame)}
              label={balanceEndsGame ? t('common.on') : t('common.off')}
              active={impostorSettings.balanceEndsGame === balanceEndsGame}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, balanceEndsGame }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  return <Text style={styles.summaryCopy}>{t('roomSettings.noSettings')}</Text>;
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
    block: {
      gap: spacing.md
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
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
    optionChip: {
      minHeight: 48,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted
    },
    optionChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.successMuted
    },
    optionChipDisabled: {
      opacity: 0.5
    },
    optionLabel: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    optionLabelActive: {
      color: theme.colors.primary,
      fontWeight: '800'
    },
    optionLabelDisabled: {
      color: theme.colors.textMuted
    }
  });
}
