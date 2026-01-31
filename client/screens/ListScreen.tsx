import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";

import { ATMListItem } from "@/components/ATMListItem";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { fetchNearbyATMs } from "@/lib/api";
import { ATM, Region } from "@/types/atm";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "List">;

export default function ListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const {
    data: atms = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<ATM[]>({
    queryKey: ["/api/atms/nearby", region?.latitude, region?.longitude],
    queryFn: async () => {
      if (!region) return [];
      return fetchNearbyATMs(region.latitude, region.longitude);
    },
    enabled: !!region,
    staleTime: 60000,
  });

  const handleATMPress = (atm: ATM) => {
    navigation.navigate("ATMDetail", { atm });
  };

  const renderItem = ({ item }: { item: ATM }) => (
    <ATMListItem
      atm={item}
      onPress={() => handleATMPress(item)}
      testID={`atm-item-${item.id}`}
    />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          title="حدث خطأ"
          message="لم نتمكن من تحميل أجهزة الصراف الآلي"
          onRetry={() => refetch()}
        />
      );
    }

    return (
      <EmptyState
        title="لا توجد صرافات قريبة"
        message="لم نجد أي أجهزة صراف آلي في منطقتك. حاول زيادة نطاق البحث"
        onRetry={() => refetch()}
      />
    );
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      data={atms}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={renderEmpty}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshing={isRefetching}
      onRefresh={() => refetch()}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
});
