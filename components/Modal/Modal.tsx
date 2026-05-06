import type { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { modalStyles as styles } from './modalStyles';

type ModalButtonVariant = 'blue' | 'red' | 'gray';

interface RootProps {
  isOpen: boolean;
  onCancel: () => void;
  children?: ReactNode;
  insets?: EdgeInsets;
}

interface ButtonProps {
  children: ReactNode;
  variant?: ModalButtonVariant;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ExitModal({ children }: { children: ReactNode }) {
  return children;
}

function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

function Message({ children }: { children: ReactNode }) {
  return <Text style={styles.message}>{children}</Text>;
}

function ButtonGroup({ children }: { children: ReactNode }) {
  return <View style={styles.buttonGroup}>{children}</View>;
}

function ModalButton({
  children,
  variant = 'blue',
  onPress,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, styles[`${variant}Text`], textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function Root({ isOpen, onCancel, children, insets }: RootProps) {
  const screenWidth = Dimensions.get('window').width - (insets?.left || 0) - (insets?.right || 0);
  const modalWidth = (screenWidth * 0.7) + 48;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableOpacity
        style={[styles.overlay, { 
          top: insets?.top, 
          left: insets?.left, 
          right: insets?.right,
          bottom: insets?.bottom 
        }]}
        activeOpacity={1}
        onPress={onCancel}
      >
        <View style={[styles.modal, { width: modalWidth }]} onStartShouldSetResponder={() => true}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

ExitModal.Root = Root;
ExitModal.ButtonGroup = ButtonGroup;
ExitModal.Button = ModalButton;
ExitModal.Title = Title;
ExitModal.Message = Message;

export default ExitModal;
