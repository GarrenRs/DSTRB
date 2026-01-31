import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";

import { StatusButton } from "@/components/StatusButton";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { reportATMStatus } from "@/lib/api";
import { ATMStatus } from "@/types/atm";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, Colors } from "@/constants/theme";

type RoutePropType = RouteProp<RootStackParamList, "ReportStatus">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ReportStatus"
>;

export default function ReportStatusModal() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { atm } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReport = async (status: ATMStatus) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const success = await reportATMStatus(atm.id, status);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSuccess(true);

        queryClient.invalidateQueries({
          queryKey: ["/api/atms/nearby"],
        });

        setTimeout(() => {
          navigation.goBack();
          navigation.goBack();
        }, 1000);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsSubmitting(false);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  if (isSuccess) {
    return (
      <View
        style={[
          styles.container,
          styles.successContainer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <View
          style={[
            styles.successIcon,
            { backgroundColor: Colors.light.statusWorking },
          ]}
        >
          <Feather name="check" size={48} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.successText}>تم إرسال البلاغ</ThemedText>
        <ThemedText style={[styles.successSubtext, { color: theme.textSecondary }]}>
          شكراً لمساعدتك في تحديث حالة الصراف
        </ThemedText>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={styles.loadingText}>جاري الإرسال...</ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: headerHeight + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      <ThemedText style={styles.title}>ما هي حالة الصراف؟</ThemedText>

      <ThemedText style={[styles.atmName, { color: theme.textSecondary }]}>
        {atm.bank || atm.name || "صراف آلي"}
      </ThemedText>

      <View style={styles.grid}>
        <View style={styles.row}>
          <StatusButton
            status="working"
            label="يعمل بشكل جيد"
            onPress={() => handleReport("working")}
            testID="button-status-working"
          />
          <StatusButton
            status="no_cash"
            label="لا يوجد نقد"
            onPress={() => handleReport("no_cash")}
            testID="button-status-no-cash"
          />
        </View>
        <View style={styles.row}>
          <StatusButton
            status="out_of_service"
            label="خارج الخدمة"
            onPress={() => handleReport("out_of_service")}
            testID="button-status-out-of-service"
          />
          <StatusButton
            status="cancel"
            label="إلغاء"
            onPress={handleCancel}
            testID="button-cancel"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  atmName: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  grid: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  successText: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
  },
  successSubtext: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
  },
});
