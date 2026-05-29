import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScanScreen from "@/screens/ScanScreen";
import CompareScreen from "@/screens/CompareScreen";
import ColorDetailScreen from "@/screens/ColorDetailScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type ScanStackParamList = {
  Scan: undefined;
  Compare: { color1?: string; color2?: string };
  ColorDetail: { color: string; name: string; timestamp?: number };
};

const Stack = createNativeStackNavigator<ScanStackParamList>();

export default function ScanStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          headerTitle: () => <HeaderTitle title="ColorSense" />,
        }}
      />
      <Stack.Screen
        name="Compare"
        component={CompareScreen}
        options={{ headerTitle: "Compare Colors" }}
      />
      <Stack.Screen
        name="ColorDetail"
        component={ColorDetailScreen}
        options={{ 
          headerTitle: "Color Details",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
