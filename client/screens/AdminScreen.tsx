import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { getApiUrl } from "@/lib/query-client";
import { AdminStats, ATMReport, DeviceTrust, ATMStatus } from "@/types/atm";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );
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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  return date.toLocaleDateString("ar-SA");
}

function ReportItem({
  report,
  onVerify,
}: {
  report: ATMReport;
  onVerify: (reportId: string, isAccurate: boolean) => void;
}) {
  const { theme } = useTheme();
  const statusColor = getStatusColor(report.status);

  return (
    <View style={[styles.reportItem, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.reportHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <ThemedText style={styles.statusBadgeText}>
            {getStatusLabel(report.status)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.reportTime, { color: theme.textSecondary }]}>
          {formatTime(report.timestamp)}
        </ThemedText>
      </View>

      <View style={styles.reportDetails}>
        <View style={styles.reportRow}>
          <ThemedText style={[styles.reportLabel, { color: theme.textSecondary }]}>
            ATM ID:
          </ThemedText>
          <ThemedText style={styles.reportValue}>{report.atm_id}</ThemedText>
        </View>
        <View style={styles.reportRow}>
          <ThemedText style={[styles.reportLabel, { color: theme.textSecondary }]}>
            درجة الثقة:
          </ThemedText>
          <ThemedText style={styles.reportValue}>
            {(report.trust_score * 100).toFixed(0)}%
          </ThemedText>
        </View>
      </View>

      <View style={styles.verifyButtons}>
        <Pressable
          style={[styles.verifyButton, { backgroundColor: Colors.light.statusWorking }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onVerify(report.id, true);
          }}
        >
          <Feather name="check" size={16} color="#FFFFFF" />
          <ThemedText style={styles.verifyButtonText}>صحيح</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.verifyButton, { backgroundColor: Colors.light.statusOutOfService }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onVerify(report.id, false);
          }}
        >
          <Feather name="x" size={16} color="#FFFFFF" />
          <ThemedText style={styles.verifyButtonText}>خاطئ</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function DeviceItem({ device }: { device: DeviceTrust }) {
  const { theme } = useTheme();
  const trustPercent = (device.trust_score * 100).toFixed(0);
  const accuracyPercent =
    device.total_reports > 0
      ? ((device.accurate_reports / device.total_reports) * 100).toFixed(0)
      : "N/A";

  return (
    <View style={[styles.deviceItem, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.deviceHeader}>
        <View style={[styles.deviceIcon, { backgroundColor: theme.primary }]}>
          <Feather name="smartphone" size={16} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.deviceHash} numberOfLines={1}>
          {device.device_hash.slice(0, 20)}...
        </ThemedText>
      </View>

      <View style={styles.deviceStats}>
        <View style={styles.deviceStat}>
          <ThemedText style={styles.deviceStatValue}>{device.total_reports}</ThemedText>
          <ThemedText style={[styles.deviceStatLabel, { color: theme.textSecondary }]}>
            بلاغات
          </ThemedText>
        </View>
        <View style={styles.deviceStat}>
          <ThemedText style={styles.deviceStatValue}>{accuracyPercent}%</ThemedText>
          <ThemedText style={[styles.deviceStatLabel, { color: theme.textSecondary }]}>
            دقة
          </ThemedText>
        </View>
        <View style={styles.deviceStat}>
          <ThemedText style={styles.deviceStatValue}>{trustPercent}%</ThemedText>
          <ThemedText style={[styles.deviceStatLabel, { color: theme.textSecondary }]}>
            ثقة
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"stats" | "reports" | "devices">("stats");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useQuery<ATMReport[]>({
    queryKey: ["/api/admin/reports"],
  });

  const { data: devices = [], isLoading: devicesLoading, refetch: refetchDevices } = useQuery<DeviceTrust[]>({
    queryKey: ["/api/admin/devices"],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ reportId, isAccurate }: { reportId: string; isAccurate: boolean }) => {
      const baseUrl = getApiUrl();
      const url = new URL("/api/admin/verify-report", baseUrl);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId, is_accurate: isAccurate }),
      });
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
    },
  });

  const handleRefresh = () => {
    refetchStats();
    refetchReports();
    refetchDevices();
  };

  const isLoading = statsLoading || reportsLoading || devicesLoading;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.tabs}>
        {(["stats", "reports", "devices"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: theme.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === tab && { color: "#FFFFFF" },
              ]}
            >
              {tab === "stats" ? "الإحصائيات" : tab === "reports" ? "البلاغات" : "الأجهزة"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === "stats" && stats ? (
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <StatCard
              title="الصرافات"
              value={stats.totalATMs}
              icon="map-pin"
              color={theme.primary}
            />
            <StatCard
              title="البلاغات"
              value={stats.totalReports}
              icon="file-text"
              color={Colors.light.statusNoCash}
            />
            <StatCard
              title="الأجهزة"
              value={stats.activeDevices}
              icon="smartphone"
              color={Colors.light.statusOutOfService}
            />
            <StatCard
              title="يعمل"
              value={stats.statusCounts.working || 0}
              icon="check-circle"
              color={Colors.light.statusWorking}
            />
          </View>

          <View style={[styles.statusBreakdown, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.sectionTitle}>توزيع الحالات</ThemedText>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <View key={status} style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(status as ATMStatus) },
                    ]}
                  />
                  <ThemedText>{getStatusLabel(status as ATMStatus)}</ThemedText>
                </View>
                <ThemedText style={styles.statusCount}>{count}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {activeTab === "reports" ? (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>البلاغات الأخيرة</ThemedText>
          {reports.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="inbox" size={32} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                لا توجد بلاغات بعد
              </ThemedText>
            </View>
          ) : (
            reports.map((report) => (
              <ReportItem
                key={report.id}
                report={report}
                onVerify={(reportId, isAccurate) =>
                  verifyMutation.mutate({ reportId, isAccurate })
                }
              />
            ))
          )}
        </View>
      ) : null}

      {activeTab === "devices" ? (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>الأجهزة النشطة</ThemedText>
          {devices.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="smartphone" size={32} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                لا توجد أجهزة مسجلة
              </ThemedText>
            </View>
          ) : (
            devices.map((device) => (
              <DeviceItem key={device.device_hash} device={device} />
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
  },
  statTitle: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
  },
  statusBreakdown: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  reportItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  reportTime: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
  },
  reportDetails: {
    gap: Spacing.xs,
  },
  reportRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  reportLabel: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  reportValue: {
    fontSize: 13,
    fontFamily: "Cairo_700Bold",
  },
  verifyButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  verifyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Cairo_700Bold",
  },
  deviceItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceHash: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
  },
  deviceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  deviceStat: {
    alignItems: "center",
  },
  deviceStatValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
  },
  deviceStatLabel: {
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
  },
});
