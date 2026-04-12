import '../i18n/i18n';

import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from '../navigation/AppNavigator';
import { AppFlowProvider } from '../state/AppFlowContext';
import { AuthProvider } from '../state/AuthContext';
import { RoomProvider } from '../state/RoomContext';
import { ThemeProvider } from '../ui/theme';

export function AppRoot() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <ThemeProvider>
          <RoomProvider>
            <AppFlowProvider>
              <AppNavigator />
            </AppFlowProvider>
          </RoomProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}
