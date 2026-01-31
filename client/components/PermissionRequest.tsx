import React from "react";
import { StyleSheet, View, Platform, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface PermissionRequestProps {
  onRequest: () => void;
  canAskAgain: boolean;
}

export function PermissionRequest({
  onRequest,
  canAskAgain,
}: PermissionRequestProps) {
  const { theme } = useTheme();

  const handleOpenSettings = async () => {
    if (Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch {
        console.error("Cannot open settings");
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <Feather name="map-pin" size={40} color="#FFFFFF" />
      </View>

      <ThemedText style={styles.title}>نحتاج إلى موقعك</ThemedText>

      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
        للعثور على أقرب أجهزة الصراف الآلي، نحتاج إلى معرفة موقعك الحالي
      </ThemedText>

      {canAskAgain ? (
        <Button onPress={onRequest} style={styles.button}>
          السماح بالوصول للموقع
        </Button>
      ) : (
        <>
          <ThemedText style={[styles.deniedMessage, { color: theme.textSecondary }]}>
            تم رفض إذن الموقع. يرجى تفعيله من الإعدادات
          </ThemedText>
          {Platform.OS !== "web" ? (
            <Button onPress={handleOpenSettings} style={styles.button}>
              فتح الإعدادات
            </Button>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
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
  deniedMessage: {
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
