import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface MapViewCompatProps {
  children?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export function MapViewCompat(props: MapViewCompatProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, props.style, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <Feather name="map" size={48} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.title}>خريطة غير متاحة على الويب</ThemedText>
      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
        يرجى استخدام تطبيق Expo Go على هاتفك لعرض الخريطة والصرافات القريبة
      </ThemedText>
    </View>
  );
}

export function MarkerCompat(_props: any) {
  return null;
}

export const PROVIDER_GOOGLE = null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    lineHeight: 26,
  },
});
