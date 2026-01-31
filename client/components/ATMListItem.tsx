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
import { useTheme } from "@/hooks/useTheme";
import { ATM, ATMStatus } from "@/types/atm";
import { formatDistance } from "@/lib/location";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ATMListItemProps {
  atm: ATM;
  onPress: () => void;
  testID?: string;
}

function getStatusColor(status: ATMStatus): string {
  switch (status) {
    case "working":
      return Colors.light.statusWorking;
    case "no_cash":
      return Colors.light.statusNoCash;
    case "out_of_service":
      return Colors.light.statusOutOfService;
    default:
      return Colors.light.statusUnknown;
  }
}

function getStatusLabel(status: ATMStatus): string {
  switch (status) {
    case "working":
      return "يعمل";
    case "no_cash":
      return "لا يوجد نقد";
    case "out_of_service":
      return "خارج الخدمة";
    default:
      return "غير معروف";
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ATMListItem({ atm, onPress, testID }: ATMListItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const statusColor = getStatusColor(atm.status);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: statusColor }]}>
        <Feather name="credit-card" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.name}>
          {atm.bank || atm.name || "صراف آلي"}
        </ThemedText>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>
            {getStatusLabel(atm.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.distanceContainer}>
        <ThemedText style={[styles.distance, { color: theme.primary }]}>
          {atm.distance ? formatDistance(atm.distance) : "-"}
        </ThemedText>
        <Feather name="chevron-left" size={20} color={theme.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  distance: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
  },
});
