import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, View, Platform } from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { MapViewCompat, MarkerCompat, PROVIDER_GOOGLE } from "@/components/MapViewCompat";
import { MapHeader } from "@/components/MapHeader";
import { FloatingButton } from "@/components/FloatingButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { PermissionRequest } from "@/components/PermissionRequest";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { fetchNearbyATMs } from "@/lib/api";
import { ATM, Region } from "@/types/atm";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Map">;

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<any>(null);

  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [region, setRegion] = useState<Region | null>(null);

  const {
    data: atms = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ATM[]>({
    queryKey: ["/api/atms/nearby", region?.latitude, region?.longitude],
    queryFn: async () => {
      if (!region) return [];
      return fetchNearbyATMs(region.latitude, region.longitude);
    },
    enabled: !!region,
    staleTime: 60000,
  });

  useEffect(() => {
    if (permission?.granted) {
      initLocation();
    }
  }, [permission?.granted]);

  const initLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleRecenter = useCallback(() => {
    if (region && mapRef.current && Platform.OS !== "web") {
      mapRef.current.animateToRegion(region, 500);
    }
  }, [region]);

  const handleListPress = useCallback(() => {
    navigation.navigate("List");
  }, [navigation]);

  const handleMarkerPress = useCallback(
    (atm: ATM) => {
      navigation.navigate("ATMDetail", { atm });
    },
    [navigation]
  );

  if (!permission) {
    return <LoadingOverlay message="جاري التحميل..." />;
  }

  if (!permission.granted) {
    return (
      <PermissionRequest
        onRequest={requestPermission}
        canAskAgain={permission.canAskAgain}
      />
    );
  }

  if (!region && Platform.OS !== "web") {
    return <LoadingOverlay message="جاري تحديد موقعك..." />;
  }

  const getStatusColor = (status: string) => {
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
  };

  return (
    <View style={styles.container}>
      <MapViewCompat
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region || undefined}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle={isDark ? "dark" : "light"}
      >
        {atms.map((atm) => (
          <MarkerCompat
            key={atm.id}
            coordinate={{ latitude: atm.lat, longitude: atm.lng }}
            onPress={() => handleMarkerPress(atm)}
            tracksViewChanges={false}
          >
            <View
              style={[
                styles.markerContainer,
                { backgroundColor: getStatusColor(atm.status) },
              ]}
            >
              <View style={styles.markerInner} />
            </View>
          </MarkerCompat>
        ))}
      </MapViewCompat>

      <MapHeader onListPress={handleListPress} />

      {Platform.OS !== "web" ? (
        <View
          style={[
            styles.floatingButtons,
            { bottom: insets.bottom + Spacing["5xl"] },
          ]}
        >
          <FloatingButton
            icon="navigation"
            onPress={handleRecenter}
            testID="button-recenter"
          />
        </View>
      ) : null}

      {isLoading && Platform.OS !== "web" ? (
        <View style={styles.loadingIndicator}>
          <LoadingOverlay message="جاري البحث عن الصرافات..." />
        </View>
      ) : null}

      {isError && Platform.OS !== "web" ? (
        <View style={styles.errorContainer}>
          <EmptyState
            title="حدث خطأ"
            message="لم نتمكن من تحميل أجهزة الصراف الآلي"
            onRetry={() => refetch()}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  floatingButtons: {
    position: "absolute",
    right: Spacing.lg,
    gap: Spacing.md,
  },
  loadingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
});
