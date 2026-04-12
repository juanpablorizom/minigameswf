import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { impostorCategories } from '../../data/mockData';
import type { ImpostorCategoryId, ImpostorMode, MiniGame, Player } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type GameplayScreenProps = {
  players: Player[];
  activeGame: MiniGame;
  onRevealResults: () => void;
};

type MultiplayerStage = 'category' | 'briefing' | 'answer' | 'answers' | 'vote' | 'result';

export function GameplayScreen({ players, activeGame, onRevealResults }: GameplayScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(1);
  const [impostorMode, setImpostorMode] = useState<ImpostorMode | null>(null);
  const [showFriendsHelp, setShowFriendsHelp] = useState(false);
  const [categoryId, setCategoryId] = useState<ImpostorCategoryId>('countries');
  const [multiplayerStage, setMultiplayerStage] = useState<MultiplayerStage>('category');
  const [answerDraft, setAnswerDraft] = useState('');
  const [selectedVotePlayerId, setSelectedVotePlayerId] = useState<string | null>(null);
  const currentPlayer = players.find((player) => player.isCurrentUser) ?? players[0] ?? null;
  const impostorPlayer = players[players.length - 1] ?? currentPlayer;
  const currentCategory = impostorCategories[categoryId];
  const isCurrentPlayerImpostor = currentPlayer?.id === impostorPlayer?.id;
  const multiplayerAnswers = useMemo(
    () =>
      players.map((player, index) => ({
        id: player.id,
        label: `Answer ${String.fromCharCode(65 + index)}`,
        text:
          player.id === currentPlayer?.id
            ? answerDraft.trim() || 'Your answer will appear here once you submit it.'
            : currentCategory.answerSuggestions[index % currentCategory.answerSuggestions.length]
      })),
    [answerDraft, currentCategory.answerSuggestions, currentPlayer?.id, players]
  );
  const votedPlayer = players.find((player) => player.id === selectedVotePlayerId) ?? null;
  const answers = [
    'I “accidentally” started the rumor so I could control the outcome.',
    'I only lied to protect the vibe, not because I was caught.',
    'I rehearsed that excuse in advance because I knew this question was coming.',
    'I told the truth once, nobody believed me, so I committed to the bit.'
  ];

  if (activeGame.id === 'impostor') {
    return (
      <AppScreen title="Impostor" subtitle="Pick the social flow first. Friends Mode stays minimal, Multiplayer Mode guides the whole round.">
        {!impostorMode ? (
          <>
            <SurfaceCard>
              <Badge label="Mode selection" tone="accent" />
              <Text style={styles.gameTitle}>Choose how this Impostor round will run.</Text>
              <Text style={styles.gameCopy}>
                Play with Friends keeps the reveal simple. Multiplayer adds category, prompt, answers, voting, and a structured finish.
              </Text>
            </SurfaceCard>

            <Pressable onPress={() => setImpostorMode('friends')} style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}>
              <Text style={styles.sectionTitle}>Play with Friends</Text>
              <Text style={styles.gameCopy}>Free mode. The system only assigns the word and the impostor role so the room can handle the rest socially.</Text>
              <Badge label="Minimal" tone="success" />
            </Pressable>

            <Pressable
              onPress={() => {
                setImpostorMode('multiplayer');
                setMultiplayerStage('category');
              }}
              style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}
            >
              <Text style={styles.sectionTitle}>Multiplayer</Text>
              <Text style={styles.gameCopy}>Structured mode. Choose a category, answer the prompt, review the table, then vote on the impostor.</Text>
              <Badge label="Structured" tone="accent" />
            </Pressable>
          </>
        ) : null}

        {impostorMode === 'friends' ? (
          <>
            <SurfaceCard>
              <View style={styles.inlineHeader}>
                <Badge label="Friends Mode" tone="success" />
                <Pressable onPress={() => setShowFriendsHelp((current) => !current)} style={styles.helpButton}>
                  <Text style={styles.helpLabel}>?</Text>
                </Pressable>
              </View>
              <Text style={styles.gameCopy}>Review your role privately, keep it hidden, and let the room lead the conversation naturally.</Text>
              {showFriendsHelp ? (
                <Text style={styles.helperCopy}>
                  Everyone except the impostor sees the same word. The impostor only sees the role, listens to the table, and tries to blend in.
                </Text>
              ) : null}
            </SurfaceCard>

            <SurfaceCard>
              <Text style={styles.promptLabel}>Your private reveal</Text>
              <View style={styles.revealCard}>
                <Text style={styles.revealValue}>{isCurrentPlayerImpostor ? 'IMPOSTOR' : currentCategory.secretWord}</Text>
              </View>
              <Text style={styles.helperCopy}>This mode has no forced prompt, no answer structure, and no timer in this pass.</Text>
            </SurfaceCard>

            <View style={styles.actions}>
              <AppButton label="Switch Mode" onPress={() => setImpostorMode(null)} variant="secondary" />
              <AppButton label="Done Reviewing" onPress={onRevealResults} />
            </View>
          </>
        ) : null}

        {impostorMode === 'multiplayer' ? (
          <>
            {multiplayerStage === 'category' ? (
              <>
                <SurfaceCard>
                  <Badge label="Multiplayer" tone="accent" />
                  <Text style={styles.sectionTitle}>1. Choose a category</Text>
                  <Text style={styles.gameCopy}>The category defines the shared question, the secret word, and the tone of the round.</Text>
                </SurfaceCard>

                {Object.entries(impostorCategories).map(([id, category]) => (
                  <Pressable
                    key={id}
                    onPress={() => setCategoryId(id as ImpostorCategoryId)}
                    style={({ pressed }) => [
                      styles.modeCard,
                      categoryId === id && styles.modeCardActive,
                      pressed && styles.pressed
                    ]}
                  >
                    <Text style={styles.sectionTitle}>{category.label}</Text>
                    <Text style={styles.gameCopy}>{category.prompt}</Text>
                  </Pressable>
                ))}

                <AppButton label={`Use ${currentCategory.label}`} onPress={() => setMultiplayerStage('briefing')} />
              </>
            ) : null}

            {multiplayerStage === 'briefing' ? (
              <>
                <SurfaceCard>
                  <View style={styles.inlineHeader}>
                    <Badge label={currentCategory.label} tone="accent" />
                    <Badge label="2. Word assigned" tone="success" />
                  </View>
                  <Text style={styles.promptLabel}>Your role</Text>
                  <Text style={styles.revealValue}>{isCurrentPlayerImpostor ? 'IMPOSTOR' : currentCategory.secretWord}</Text>
                  <Text style={styles.promptLabel}>Global question</Text>
                  <Text style={styles.promptText}>{currentCategory.prompt}</Text>
                </SurfaceCard>

                <View style={styles.actions}>
                  <AppButton label="Change Category" onPress={() => setMultiplayerStage('category')} variant="secondary" />
                  <AppButton label="Write Answer" onPress={() => setMultiplayerStage('answer')} />
                </View>
              </>
            ) : null}

            {multiplayerStage === 'answer' ? (
              <>
                <SurfaceCard>
                  <Text style={styles.sectionTitle}>3. Submit your answer</Text>
                  <Text style={styles.gameCopy}>{currentCategory.prompt}</Text>
                  <TextInput
                    value={answerDraft}
                    onChangeText={setAnswerDraft}
                    placeholder="Write a short answer that helps you blend in."
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.answerInput}
                    multiline
                  />
                  <Text style={styles.helperCopy}>Keep it short. The table will review every answer before voting.</Text>
                </SurfaceCard>

                <View style={styles.actions}>
                  <AppButton label="Back" onPress={() => setMultiplayerStage('briefing')} variant="secondary" />
                  <AppButton label="Show Answers" onPress={() => setMultiplayerStage('answers')} disabled={!answerDraft.trim()} />
                </View>
              </>
            ) : null}

            {multiplayerStage === 'answers' ? (
              <>
                <SurfaceCard>
                  <Text style={styles.sectionTitle}>4. Review the table</Text>
                  <Text style={styles.gameCopy}>Answers are shown first. Voting happens in the next step.</Text>
                  {multiplayerAnswers.map((answer) => (
                    <View key={answer.id} style={styles.structuredAnswerCard}>
                      <Text style={styles.promptLabel}>{answer.label}</Text>
                      <Text style={styles.itemTitle}>{answer.text}</Text>
                    </View>
                  ))}
                </SurfaceCard>

                <View style={styles.actions}>
                  <AppButton label="Edit Answer" onPress={() => setMultiplayerStage('answer')} variant="secondary" />
                  <AppButton label="Vote Player" onPress={() => setMultiplayerStage('vote')} />
                </View>
              </>
            ) : null}

            {multiplayerStage === 'vote' ? (
              <>
                <SurfaceCard>
                  <Text style={styles.sectionTitle}>5. Vote for the impostor</Text>
                  <Text style={styles.gameCopy}>Each player gets one vote. Pick the person who sounds least aligned with the room.</Text>
                  {players.map((player) => (
                    <Pressable
                      key={player.id}
                      onPress={() => setSelectedVotePlayerId(player.id)}
                      style={({ pressed }) => [
                        styles.voteCard,
                        selectedVotePlayerId === player.id && styles.voteCardSelected,
                        pressed && styles.pressed
                      ]}
                    >
                      <View style={styles.voteMeta}>
                        <Text style={styles.itemTitle}>{player.name}</Text>
                        <Text style={styles.itemSubtitle}>{player.isCurrentUser ? 'This is you' : 'Tap to cast your vote'}</Text>
                      </View>
                      {selectedVotePlayerId === player.id ? <Badge label="Selected" tone="success" /> : null}
                    </Pressable>
                  ))}
                </SurfaceCard>

                <View style={styles.actions}>
                  <AppButton label="Back to Answers" onPress={() => setMultiplayerStage('answers')} variant="secondary" />
                  <AppButton label="Lock Vote" onPress={() => setMultiplayerStage('result')} disabled={!selectedVotePlayerId} />
                </View>
              </>
            ) : null}

            {multiplayerStage === 'result' ? (
              <>
                <SurfaceCard>
                  <View style={styles.inlineHeader}>
                    <Badge label="6. Result" tone="accent" />
                    <Badge label={votedPlayer ? `Vote: ${votedPlayer.name}` : 'No vote'} tone="neutral" />
                  </View>
                  <Text style={styles.sectionTitle}>Round outcome</Text>
                  <Text style={styles.itemSubtitle}>
                    The table suspected {votedPlayer?.name ?? 'nobody'}.
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    The actual impostor was {impostorPlayer?.name ?? 'unknown'}.
                  </Text>
                  <Text style={styles.helperCopy}>
                    Shared word: {currentCategory.secretWord}. Prompt used: {currentCategory.prompt}
                  </Text>
                </SurfaceCard>

                <View style={styles.actions}>
                  <AppButton label="Play Again" onPress={() => {
                    setMultiplayerStage('category');
                    setSelectedVotePlayerId(null);
                    setAnswerDraft('');
                  }} variant="secondary" />
                  <AppButton label="Open Results" onPress={onRevealResults} />
                </View>
              </>
            ) : null}
          </>
        ) : null}
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Gameplay" subtitle="The live play surface stays focused: one game, one prompt, one clear next step.">
      <SurfaceCard>
        <View style={styles.header}>
          <Badge label="Round 2 of 3" tone="accent" />
          <Badge label="00:32 left" tone="success" />
        </View>
        <Text style={styles.gameTitle}>{activeGame.name}</Text>
        <Text style={styles.gameCopy}>{activeGame.description}</Text>
        <View style={styles.promptPanel}>
          <Text style={styles.promptLabel}>Current prompt</Text>
          <Text style={styles.promptText}>Which answer sounds the most believable if someone is clearly hiding the truth?</Text>
        </View>
        <View style={styles.answerList}>
          {answers.map((answer, index) => {
            const selected = selectedAnswer === index;

            return (
              <Pressable
                key={answer}
                onPress={() => setSelectedAnswer(index)}
                style={[styles.answerCard, selected && styles.answerCardSelected]}
              >
                <Text style={[styles.answerKey, selected && styles.answerKeySelected]}>{String.fromCharCode(65 + index)}</Text>
                <Text style={[styles.answerText, selected && styles.answerTextSelected]}>{answer}</Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.queueTitle}>Turn order</Text>
        {players.map((player, index) => (
          <View key={player.id} style={styles.queueRow}>
            <Text style={styles.queueIndex}>0{index + 1}</Text>
            <View style={styles.queueMeta}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerStatus}>{index === 0 ? 'Speaking now' : index === 1 ? 'On deck' : 'Waiting'}</Text>
            </View>
            <Badge label={`${player.score} pts`} />
          </View>
        ))}
      </SurfaceCard>

      <AppButton label="Reveal Results" onPress={onRevealResults} />
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    inlineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm
    },
    helpButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    helpLabel: {
      color: theme.colors.highlight,
      fontSize: typography.body,
      fontWeight: '800'
    },
    gameTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '700'
    },
    gameCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    helperCopy: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      lineHeight: 18
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    modeCard: {
      gap: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: spacing.lg
    },
    modeCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    revealCard: {
      minHeight: 120,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    revealValue: {
      color: theme.colors.textPrimary,
      fontSize: typography.hero,
      fontWeight: '800',
      letterSpacing: -1
    },
    promptPanel: {
      backgroundColor: theme.colors.backgroundElevated,
      borderRadius: 20,
      padding: spacing.lg,
      gap: spacing.sm
    },
    promptLabel: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      textTransform: 'uppercase',
      letterSpacing: 1.4
    },
    promptText: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 30
    },
    answerList: {
      gap: spacing.sm
    },
    answerCard: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md
    },
    answerCardSelected: {
      backgroundColor: theme.colors.successMuted,
      borderColor: theme.colors.success
    },
    answerKey: {
      color: theme.colors.highlight,
      fontSize: typography.body,
      fontWeight: '800',
      marginTop: 1
    },
    answerKeySelected: {
      color: theme.colors.successText
    },
    answerText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    answerTextSelected: {
      color: theme.colors.textPrimary
    },
    answerInput: {
      minHeight: 120,
      borderRadius: radius.md,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.body,
      textAlignVertical: 'top'
    },
    structuredAnswerCard: {
      gap: spacing.xs,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md
    },
    voteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md
    },
    voteCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    voteMeta: {
      flex: 1,
      gap: 2
    },
    itemTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    itemSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    actions: {
      gap: spacing.sm
    },
    queueTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    queueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md
    },
    queueIndex: {
      color: theme.colors.highlight,
      fontSize: typography.body,
      fontWeight: '800'
    },
    queueMeta: {
      flex: 1,
      gap: 2
    },
    playerName: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    playerStatus: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }]
    }
  });
}
