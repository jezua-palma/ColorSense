import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistoryScreen from "@/screens/HistoryScreen";
import ColorDetailScreen from "@/screens/ColorDetailScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HistoryStackParamList = {
  History: undefined;
  ColorDetail: { 
    color: string; 
    name: string; 
    timestamp?: number;
    captureData?: {
      dominantColors: Array<{
        hex: string;
        name: string;
        family: string;
        percentage: number;
        rgb: { r: number; g: number; b: number };
      }>;
      totalPixelsAnalyzed: number;
    };
  };
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: "History" }}
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
