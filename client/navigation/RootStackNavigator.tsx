import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import MapScreen from "@/screens/MapScreen";
import ListScreen from "@/screens/ListScreen";
import ATMDetailModal from "@/screens/ATMDetailModal";
import ReportStatusModal from "@/screens/ReportStatusModal";
import AdminScreen from "@/screens/AdminScreen";
import { ATM } from "@/types/atm";

export type RootStackParamList = {
  Map: undefined;
  List: undefined;
  ATMDetail: { atm: ATM };
  ReportStatus: { atm: ATM };
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="List"
        component={ListScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "أقرب الصرافات",
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="ATMDetail"
        component={ATMDetailModal}
        options={{
          presentation: "modal",
          headerTitle: "تفاصيل الصراف",
        }}
      />
      <Stack.Screen
        name="ReportStatus"
        component={ReportStatusModal}
        options={{
          presentation: "modal",
          headerTitle: "إبلاغ عن الحالة",
        }}
      />
      <Stack.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "لوحة الإدارة",
        }}
      />
    </Stack.Navigator>
  );
}
