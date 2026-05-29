import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "@/screens/SettingsScreen";
import ManagePaletteScreen from "@/screens/ManagePaletteScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type SettingsStackParamList = {
  Settings: undefined;
  ManagePalette: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="ManagePalette"
        component={ManagePaletteScreen}
        options={{ headerTitle: "My Palette" }}
      />
    </Stack.Navigator>
  );
}
