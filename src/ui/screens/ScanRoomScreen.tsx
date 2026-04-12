import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';

import { extractRoomCodeFromValue } from '../../lib/roomLinks';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type ScanRoomScreenProps = {
  isBusy: boolean;
  notice: string | null;
  onScanCode: (code: string) => void;
  onFallbackToManual: () => void;
};

export function ScanRoomScreen({ isBusy, notice, onScanCode, onFallbackToManual }: ScanRoomScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [permission, requestPermission] = useCameraPermissions();
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const resolvedNotice = notice ?? localNotice;

  function handleScanned(data: string) {
    if (isPaused || isBusy) {
      return;
    }

    const code = extractRoomCodeFromValue(data);

    if (!code) {
      setIsPaused(true);
      setLocalNotice(t('scanRoom.invalidQr'));
      return;
    }

    setLocalNotice(null);
    setIsPaused(true);
    onScanCode(code);
  }

  return (
    <AppScreen title={t('scanRoom.title')} subtitle={t('scanRoom.subtitle')}>
      <SurfaceCard>
        {!permission ? <Text style={styles.helper}>{t('scanRoom.checkingCamera')}</Text> : null}

        {permission && !permission.granted ? (
          <>
            <Text style={styles.helper}>{t('scanRoom.cameraNeeded')}</Text>
            <AppButton label={t('scanRoom.allowCamera')} onPress={() => void requestPermission()} loading={isBusy} />
          </>
        ) : null}

        {permission?.granted ? (
          <View style={styles.cameraFrame}>
            <CameraView
              facing="back"
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => handleScanned(data)}
            />
            <View style={styles.overlay}>
              <View style={styles.scanWindow} />
            </View>
          </View>
        ) : null}

        {resolvedNotice ? <Text style={styles.notice}>{resolvedNotice}</Text> : null}

        {permission?.granted ? (
          <Pressable onPress={() => {
            setIsPaused(false);
            setLocalNotice(null);
          }}>
            <Text style={styles.resetLink}>{t('scanRoom.scanAgain')}</Text>
          </Pressable>
        ) : null}

        <AppButton label={t('scanRoom.joinWithCode')} onPress={onFallbackToManual} variant="secondary" />
      </SurfaceCard>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    cameraFrame: {
      height: 320,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundElevated
    },
    camera: {
      flex: 1
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center'
    },
    scanWindow: {
      width: 220,
      height: 220,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.colors.highlight,
      backgroundColor: 'transparent'
    },
    helper: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18
    },
    resetLink: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    }
  });
}
