import React from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { FloatingButton } from "@/components/FloatingButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

interface MapHeaderProps {
  onListPress: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function MapHeader({ onListPress }: MapHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleAdminPress = () => {
    navigation.navigate("Admin");
  };

  const content = (
    <View style={[styles.content, { paddingTop: insets.top + Spacing.sm }]}>
      <FloatingButton
        icon="settings"
        onPress={handleAdminPress}
        testID="button-admin"
      />
      <View style={styles.titleContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>أقرب صراف</ThemedText>
      </View>
      <FloatingButton
        icon="list"
        onPress={onListPress}
        testID="button-list-view"
      />
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={styles.container}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.mapOverlay }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Cairo_700Bold",
  },
});
