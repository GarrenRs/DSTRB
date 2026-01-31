import React from "react";
import { StyleSheet, View, ScrollView, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { formatDistance } from "@/lib/location";
import { ATMStatus } from "@/types/atm";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

type RoutePropType = RouteProp<RootStackParamList, "ATMDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ATMDetail">;

function getStatusConfig(status: ATMStatus) {
  switch (status) {
    case "working":
      return {
        color: Colors.light.statusWorking,
        label: "يعمل بشكل جيد",
        icon: "check-circle" as const,
      };
    case "no_cash":
      return {
        color: Colors.light.statusNoCash,
        label: "لا يوجد نقد",
        icon: "dollar-sign" as const,
      };
    case "out_of_service":
      return {
        color: Colors.light.statusOutOfService,
        label: "خارج الخدمة",
        icon: "x-circle" as const,
      };
    default:
      return {
        color: Colors.light.statusUnknown,
        label: "غير معروف",
        icon: "help-circle" as const,
      };
  }
}

function formatLastReported(dateString: string | null | undefined): string {
  if (!dateString) return "لم يتم الإبلاغ بعد";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;

  return date.toLocaleDateString("ar-SA");
}

function getConfidenceLabel(confidence: number | undefined): string {
  if (confidence === undefined || confidence === 0) return "";
  if (confidence >= 0.8) return "ثقة عالية";
  if (confidence >= 0.5) return "ثقة متوسطة";
  return "ثقة منخفضة";
}

export default function ATMDetailModal() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { atm } = route.params;
  const statusConfig = getStatusConfig(atm.status);
  const confidenceLabel = getConfidenceLabel(atm.confidence);

  const handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ReportStatus", { atm });
  };

  const handleOpenMaps = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = Platform.select({
      ios: `maps:?daddr=${atm.lat},${atm.lng}`,
      android: `geo:${atm.lat},${atm.lng}?q=${atm.lat},${atm.lng}`,
      default: `https://maps.google.com/maps?daddr=${atm.lat},${atm.lng}`,
    });

    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: statusConfig.color }]}
      >
        <Feather name="credit-card" size={48} color="#FFFFFF" />
      </View>

      <ThemedText style={styles.bankName}>
        {atm.bank || atm.name || "صراف آلي"}
      </ThemedText>

      {atm.distance !== undefined ? (
        <View style={styles.distanceContainer}>
          <ThemedText style={[styles.distance, { color: theme.primary }]}>
            {formatDistance(atm.distance)}
          </ThemedText>
          <ThemedText style={[styles.distanceLabel, { color: theme.textSecondary }]}>
            من موقعك
          </ThemedText>
        </View>
      ) : null}

      <View
        style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.statusHeader}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <ThemedText style={styles.statusLabel}>{statusConfig.label}</ThemedText>
        </View>
        
        <View style={styles.statusDetails}>
          <ThemedText style={[styles.lastReported, { color: theme.textSecondary }]}>
            {formatLastReported(atm.lastReportedAt)}
          </ThemedText>
          
          {atm.reportCount !== undefined && atm.reportCount > 0 ? (
            <View style={styles.reportInfo}>
              <ThemedText style={[styles.reportCount, { color: theme.textSecondary }]}>
                {atm.reportCount} بلاغ
              </ThemedText>
              {confidenceLabel ? (
                <View style={[styles.confidenceBadge, { backgroundColor: statusConfig.color + "20" }]}>
                  <ThemedText style={[styles.confidenceText, { color: statusConfig.color }]}>
                    {confidenceLabel}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      {atm.address ? (
        <View style={[styles.addressCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="map-pin" size={18} color={theme.textSecondary} />
          <ThemedText style={[styles.address, { color: theme.textSecondary }]}>
            {atm.address}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button onPress={handleReport} style={styles.primaryButton}>
          إبلاغ عن الحالة
        </Button>

        <Button
          onPress={handleOpenMaps}
          style={[styles.secondaryButton, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText style={{ color: theme.text }}>فتح في الخرائط</ThemedText>
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  bankName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  distanceContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  distance: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
  },
  distanceLabel: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
  },
  statusCard: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  statusDetails: {
    gap: Spacing.xs,
  },
  lastReported: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    marginRight: Spacing.xl,
  },
  reportInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  reportCount: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  addressCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    lineHeight: 22,
  },
  actions: {
    width: "100%",
    gap: Spacing.md,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
});
