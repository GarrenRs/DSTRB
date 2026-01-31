import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function EmptyState({
  title,
  message,
  onRetry,
  retryLabel = "إعادة المحاولة",
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/empty-atms.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
      {message ? (
        <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
          {message}
        </ThemedText>
      ) : null}
      {onRetry ? (
        <Button onPress={onRetry} style={styles.button}>
          {retryLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    gap: Spacing.lg,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
  },
});
