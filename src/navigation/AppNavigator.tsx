import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames, lobbyScenarios, roomPlayers } from '../data/mockData';
import type { AppTab, LobbyActionId } from './types';
import { useAppFlow } from '../state/AppFlowContext';
import { useAuth } from '../state/AuthContext';
import { AccountScreen } from '../ui/screens/AccountScreen';
import { ChooseGamesScreen } from '../ui/screens/ChooseGamesScreen';
import { GameplayScreen } from '../ui/screens/GameplayScreen';
import { LobbyScreen } from '../ui/screens/LobbyScreen';
import { PrivateRoomScreen } from '../ui/screens/PrivateRoomScreen';
import { ResultsScreen } from '../ui/screens/ResultsScreen';
import { RoomSettingsScreen } from '../ui/screens/RoomSettingsScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen';
import { colors, radius, spacing, typography } from '../ui/theme';

export function AppNavigator() {
  const { t } = useTranslation();
  const {
    isReady,
    isBusy,
    isSupabaseConfigured,
    session,
    isGuest,
    profile,
    displayName,
    username,
    email,
    linkedProviderLabel,
    language,
    themePreference,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    signOut,
    changeLanguage,
    changeTheme,
    linkAccount
  } = useAuth();
  const {
    activeTab,
    currentScreen,
    lobbyScenario,
    selectedGameIds,
    selectedGames,
    roomSettings,
    canGoBack,
    goBack,
    openAccount,
    openSettings,
    openGamesTab,
    openRoom,
    joinRoomByCode,
    continueRoom,
    inviteFriends,
    resumeLastActivity,
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
    backToLobby,
    resetToLobby
  } = useAppFlow();
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isGuest) {
      resetToLobby();
    }
  }, [isGuest, resetToLobby, session]);

  if (!isReady || (!session && !isGuest)) {
    return (
      <View style={styles.container}>
        <WelcomeScreen
          isBusy={isBusy || !isReady}
          isSupabaseConfigured={isSupabaseConfigured}
          notice={!isReady ? t('common.loading') : authNotice}
          onSignIn={(nextEmail, password) => {
            void signInWithEmail(nextEmail, password).then((result) => {
              setAuthNotice(result.error ?? null);
            });
          }}
          onSignUp={(nextEmail, password, nextDisplayName) => {
            void signUpWithEmail(nextEmail, password, nextDisplayName).then((result) => {
              if (result.message === 'SIGNUP_CONFIRMATION_REQUIRED') {
                setAuthNotice(t('auth.signUpSuccess'));
                return;
              }

              setAuthNotice(result.error ?? null);
            });
          }}
          onContinueAsGuest={(nextDisplayName) => {
            void continueAsGuest(nextDisplayName).then((result) => {
              setAuthNotice(result.error ?? null);
            });
          }}
        />
      </View>
    );
  }

  const resolvedLobbyScenario = isGuest ? lobbyScenarios.guest : profile ? lobbyScenario : lobbyScenarios.noRoom;

  function resolveNotice(message?: string) {
    if (message === 'LINKING_REQUIRES_SETUP') {
      return t('account.linkingRequiresSetup');
    }

    if (message === 'LINK_GUEST_ACCOUNT') {
      return t('account.linkingGuestEntry');
    }

    return null;
  }

  function handleLobbyAction(actionId: LobbyActionId) {
    switch (actionId) {
      case 'createRoom':
        openRoom();
        break;
      case 'joinByCode':
        joinRoomByCode();
        break;
      case 'continueRoom':
        continueRoom();
        break;
      case 'inviteFriends':
        inviteFriends();
        break;
      case 'resumeActivity':
        resumeLastActivity();
        break;
      case 'quickPlay':
        openQuickPlay();
        break;
    }
  }

  function handleTabPress(tab: AppTab) {
    if (tab === 'account') {
      openAccount();
      return;
    }

    if (tab === 'settings') {
      openSettings();
      return;
    }

    openGamesTab();
  }

  function renderGamesTab() {
    if (currentScreen === 'lobby') {
      return <LobbyScreen displayName={displayName ?? email?.split('@')[0] ?? 'Player'} scenario={resolvedLobbyScenario} onAction={handleLobbyAction} />;
    }

    if (currentScreen === 'room') {
      return (
        <PrivateRoomScreen
          players={roomPlayers}
          selectedGames={selectedGames}
          settings={roomSettings}
          onInviteFriends={inviteFriends}
          onChooseGames={openChooseGames}
          onOpenSettings={openRoomSettings}
          onStart={startGameplay}
        />
      );
    }

    if (currentScreen === 'chooseGames') {
      return <ChooseGamesScreen selectedGameIds={selectedGameIds} onToggleGame={toggleGameSelection} onSave={saveGames} />;
    }

    if (currentScreen === 'roomSettings') {
      return <RoomSettingsScreen settings={roomSettings} onChangeSettings={updateRoomSettings} onSave={saveRoomSettings} />;
    }

    if (currentScreen === 'gameplay') {
      return <GameplayScreen players={roomPlayers} activeGame={selectedGames[0] ?? featuredGames[0]} onRevealResults={revealResults} />;
    }

    return <ResultsScreen onPlayAgain={playAgain} onBackToLobby={backToLobby} />;
  }

  function renderTabContent() {
    if (activeTab === 'account') {
      return (
        <AccountScreen
          isGuest={isGuest}
          displayName={displayName}
          username={username}
          email={email}
          linkedProviderLabel={linkedProviderLabel}
          isBusy={isBusy}
          notice={accountNotice}
          onLinkAccount={() => {
            void linkAccount().then((result) => {
              setAccountNotice(
                resolveNotice(result.message) ??
                  (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
              );
            });
          }}
          onManageBilling={() => {
            setAccountNotice(t('account.billingNotReady'));
          }}
        />
      );
    }

    if (activeTab === 'settings') {
      return (
        <SettingsScreen
          language={language}
          themePreference={themePreference}
          isBusy={isBusy}
          notice={settingsNotice}
          onChangeLanguage={(nextLanguage) => {
            void changeLanguage(nextLanguage).then((result) => {
              setSettingsNotice(
                resolveNotice(result.message) ??
                  (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
              );
            });
          }}
          onChangeTheme={(nextTheme) => {
            void changeTheme(nextTheme).then((result) => {
              setSettingsNotice(result.error ?? null);
            });
          }}
          onLogout={() => {
            setAccountNotice(null);
            setSettingsNotice(null);
            setAuthNotice(null);
            void signOut();
          }}
        />
      );
    }

    return renderGamesTab();
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>JUNTADA</Text>
          <Text style={styles.brandSub}>{activeTab === 'games' ? t('common.games') : activeTab === 'account' ? t('common.account') : t('common.settings')}</Text>
        </View>
        {canGoBack ? (
          <Pressable onPress={goBack}>
            <Text style={styles.back}>{t('common.back')}</Text>
          </Pressable>
        ) : (
          <View style={styles.statusPill}>
            <Text style={styles.statusPillLabel}>{isGuest ? t('account.accountStateGuest') : t('account.accountStateAuthenticated')}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>{renderTabContent()}</View>

      <View style={styles.tabBar}>
        <TabButton label={t('navigation.accountTab')} active={activeTab === 'account'} onPress={() => handleTabPress('account')} />
        <TabButton label={t('navigation.gamesTab')} active={activeTab === 'games'} prominent onPress={() => handleTabPress('games')} />
        <TabButton label={t('navigation.settingsTab')} active={activeTab === 'settings'} onPress={() => handleTabPress('settings')} />
      </View>
    </View>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  prominent?: boolean;
  onPress: () => void;
};

function TabButton({ label, active, prominent = false, onPress }: TabButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, prominent && styles.tabButtonProminent, active && styles.tabButtonActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
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
  content: {
    flex: 1
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
  statusPill: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border
  },
  statusPillLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm
  },
  tabButtonProminent: {
    backgroundColor: colors.backgroundElevated
  },
  tabButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.panelMuted
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  tabLabelActive: {
    color: colors.textPrimary
  }
});
