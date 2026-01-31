import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ATMStatus } from "@/types/atm";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface StatusButtonProps {
  status: ATMStatus | "cancel";
  label: string;
  onPress: () => void;
  testID?: string;
}

function getButtonConfig(status: ATMStatus | "cancel") {
  switch (status) {
    case "working":
      return {
        color: Colors.light.statusWorking,
        icon: "check-circle" as const,
      };
    case "no_cash":
      return {
        color: Colors.light.statusNoCash,
        icon: "dollar-sign" as const,
      };
    case "out_of_service":
      return {
        color: Colors.light.statusOutOfService,
        icon: "x-circle" as const,
      };
    case "cancel":
      return {
        color: Colors.light.statusUnknown,
        icon: "x" as const,
      };
    default:
      return {
        color: Colors.light.statusUnknown,
        icon: "help-circle" as const,
      };
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StatusButton({
  status,
  label,
  onPress,
  testID,
}: StatusButtonProps) {
  const scale = useSharedValue(1);
  const config = getButtonConfig(status);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        { backgroundColor: config.color },
        animatedStyle,
      ]}
    >
      <Feather name={config.icon} size={32} color="#FFFFFF" />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    minHeight: 120,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Cairo_700Bold",
  },
});
