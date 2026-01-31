import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ATM, ATMStatus } from "@/types/atm";
import { Colors, Shadows } from "@/constants/theme";

interface ATMMarkerProps {
  atm: ATM;
  onPress: () => void;
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

export function ATMMarker({ atm, onPress }: ATMMarkerProps) {
  const statusColor = getStatusColor(atm.status);

  return (
    <View style={[styles.container, { backgroundColor: statusColor }]}>
      <Feather name="credit-card" size={16} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...Shadows.medium,
  },
});
