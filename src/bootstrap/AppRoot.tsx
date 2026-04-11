import '../i18n/i18n';

import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from '../navigation/AppNavigator';
import { AppFlowProvider } from '../state/AppFlowContext';
import { AuthProvider } from '../state/AuthContext';

export function AppRoot() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <AppFlowProvider>
          <AppNavigator />
        </AppFlowProvider>
      </AuthProvider>
    </>
  );
}
