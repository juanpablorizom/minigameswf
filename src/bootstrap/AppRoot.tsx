import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from '../navigation/AppNavigator';
import { AppFlowProvider } from '../state/AppFlowContext';

export function AppRoot() {
  return (
    <>
      <StatusBar style="light" />
      <AppFlowProvider>
        <AppNavigator />
      </AppFlowProvider>
    </>
  );
}
