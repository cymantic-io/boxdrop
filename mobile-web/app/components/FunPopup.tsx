import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

export type PopupType = 'error' | 'success' | 'warning' | 'info';

interface PopupConfig {
  type: PopupType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const POPUP_ICONS: Record<PopupType, string> = {
  error: 'emoticon-sad-outline',
  success: 'emoticon-happy-outline',
  warning: 'emoticon-neutral-outline',
  info: 'emoticon-outline',
};

const POPUP_COLORS: Record<PopupType, string> = {
  error: colors.error,
  success: colors.success,
  warning: colors.warning,
  info: colors.primary,
};

const ANIMATION_DURATION = 300;

let globalResolve: ((result: boolean) => void) | null = null;

function FunPopupContainer() {
  const [config, setConfig] = React.useState<PopupConfig | null>(null);
  const [visible, setVisible] = React.useState(false);
  
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    (window as any).__showFunPopup = (popupConfig: PopupConfig) => {
      return new Promise((resolve) => {
        globalResolve = resolve;
        setConfig(popupConfig);
        setVisible(true);
      });
    };
    
    return () => {
      delete (window as any).__showFunPopup;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0);
      translateY.setValue(50);
      opacity.setValue(0);
    }
  }, [visible]);

  const handleClose = (result: boolean) => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0,
        duration: ANIMATION_DURATION / 2,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION / 2,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (globalResolve) {
        globalResolve(result);
        globalResolve = null;
      }
    });
  };

  if (!config || !visible) return null;

  const iconColor = POPUP_COLORS[config.type];
  const iconName = POPUP_ICONS[config.type];

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            {
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <MaterialCommunityIcons name={iconName as any} size={48} color={iconColor} />
          </View>
          
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{config.message}</Text>
          
          <View style={styles.buttonContainer}>
            {config.cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => handleClose(false)}
              >
                <Text style={styles.cancelText}>{config.cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: iconColor }]}
              onPress={() => handleClose(true)}
            >
              <Text style={styles.confirmText}>{config.confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function showFunPopup(config: PopupConfig): Promise<boolean> {
  if (typeof window !== 'undefined' && (window as any).__showFunPopup) {
    return (window as any).__showFunPopup(config);
  }
  if (config.type === 'error') {
    return Promise.reject(new Error(config.message));
  }
  return Promise.resolve(true);
}

export function showError(title: string, message: string): Promise<boolean> {
  return showFunPopup({
    type: 'error',
    title,
    message,
    confirmText: 'Got it!',
  });
}

export function showSuccess(title: string, message: string): Promise<boolean> {
  return showFunPopup({
    type: 'success',
    title,
    message,
    confirmText: 'Awesome!',
  });
}

export function showWarning(title: string, message: string): Promise<boolean> {
  return showFunPopup({
    type: 'warning',
    title,
    message,
    confirmText: 'Sure',
  });
}

export function showConfirm(
  title: string,
  message: string,
  confirmText: string = 'Yes',
  cancelText: string = 'No'
): Promise<boolean> {
  return showFunPopup({
    type: 'info',
    title,
    message,
    confirmText,
    cancelText,
  });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: width - 60,
    alignItems: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export { FunPopupContainer };
export { showFunPopup };
