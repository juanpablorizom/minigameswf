import { Pressable, StyleSheet, Text, View } from 'react-native';

import { featuredGames, roomPlayers } from '../data/mockData';
import { progressScreens } from './routes';
import { useAppFlow } from '../state/AppFlowContext';
import { GameplayScreen } from '../ui/screens/GameplayScreen';
import { LobbyScreen } from '../ui/screens/LobbyScreen';
import { ChooseGamesScreen } from '../ui/screens/ChooseGamesScreen';
import { PrivateRoomScreen } from '../ui/screens/PrivateRoomScreen';
import { ResultsScreen } from '../ui/screens/ResultsScreen';
import { RoomSettingsScreen } from '../ui/screens/RoomSettingsScreen';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen';
import { colors, spacing, typography } from '../ui/theme';

export function AppNavigator() {
  const {
    currentScreen,
    profile,
    selectedGameIds,
    selectedGames,
    roomSettings,
    canGoBack,
    goBack,
    continueFromWelcome,
    continueAsGuest,
    openRoom,
    openQuickPlay,
    openChooseGames,
    openRoomSettings,
    toggleGameSelection,
    saveGames,
    updateRoomSettings,
    saveRoomSettings,
    startGameplay,
    revealResults,
    playAgain,
    backToLobby
  } = useAppFlow();

  const footer = currentScreen === 'welcome' ? null : (
    <View style={styles.footer}>
      <Text style={styles.footerLabel}>Flow</Text>
      <View style={styles.progressRow}>
        {progressScreens.map((screen, index) => {
          const active = screen === currentScreen;
          const completed = progressScreens.indexOf(currentScreen) > index;

          return <View key={screen} style={[styles.progressDot, active && styles.progressDotActive, completed && styles.progressDotComplete]} />;
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {currentScreen !== 'welcome' ? (
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>JUNTADA</Text>
            <Text style={styles.brandSub}>Social game night</Text>
          </View>
          {canGoBack ? (
            <Pressable onPress={goBack}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {currentScreen === 'welcome' ? (
        <WelcomeScreen
          initialName={profile.name}
          onContinue={continueFromWelcome}
          onContinueAsGuest={continueAsGuest}
        />
      ) : null}

      {currentScreen === 'lobby' ? <LobbyScreen profile={profile} onCreateRoom={openRoom} onQuickPlay={openQuickPlay} /> : null}

      {currentScreen === 'room' ? (
        <PrivateRoomScreen
          players={roomPlayers}
          selectedGames={selectedGames}
          settings={roomSettings}
          onInviteFriends={() => undefined}
          onChooseGames={openChooseGames}
          onOpenSettings={openRoomSettings}
          onStart={startGameplay}
        />
      ) : null}

      {currentScreen === 'chooseGames' ? (
        <ChooseGamesScreen
          selectedGameIds={selectedGameIds}
          onToggleGame={toggleGameSelection}
          onSave={saveGames}
        />
      ) : null}

      {currentScreen === 'roomSettings' ? (
        <RoomSettingsScreen
          settings={roomSettings}
          onChangeSettings={updateRoomSettings}
          onSave={saveRoomSettings}
        />
      ) : null}

      {currentScreen === 'gameplay' ? (
        <GameplayScreen
          players={roomPlayers}
          activeGame={selectedGames[0] ?? featuredGames[0]}
          onRevealResults={revealResults}
        />
      ) : null}

      {currentScreen === 'results' ? (
        <ResultsScreen onPlayAgain={playAgain} onBackToLobby={backToLobby} />
      ) : null}

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  brand: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '800'
  },
  brandSub: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  back: {
    color: colors.accentSoft,
    fontSize: typography.body,
    fontWeight: '700'
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm
  },
  footerLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.panelMuted
  },
  progressDotActive: {
    backgroundColor: colors.accent
  },
  progressDotComplete: {
    backgroundColor: colors.success
  }
});
