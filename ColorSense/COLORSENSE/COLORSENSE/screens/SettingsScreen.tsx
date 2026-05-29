import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "@/navigation/SettingsStackNavigator";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { getSettings, updateSettings, AppSettings } from "@/utils/storage";
import { Spacing, BorderRadius } from "@/constants/theme";

type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, "Settings">;

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  onPress,
  showChevron,
}: SettingRowProps) {
  const { theme } = useTheme();

  const content = (
    <View style={styles.settingRow}>
      <View
        style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}
      >
        <Feather name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="body" style={styles.settingTitle}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={styles.settingSubtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {onValueChange !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={(newValue) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onValueChange(newValue);
          }}
          trackColor={{ false: theme.backgroundSecondary, true: theme.primary }}
          thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
        />
      ) : null}
      {showChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={({ pressed }) => [
          styles.settingRowContainer,
          { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.settingRowContainer,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      {content}
    </View>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="small" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [settings, setSettings] = useState<AppSettings>({
    voiceFeedbackEnabled: true,
    voiceFeedbackMode: "onTap",
    flashlightAutoEnable: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const handleSettingChange = useCallback(
    async (key: keyof AppSettings, value: boolean | string) => {
      const updated = await updateSettings({ [key]: value });
      setSettings(updated);
    },
    []
  );

  return (
    <ScreenScrollView>
      <View style={styles.profileSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primary },
          ]}
        >
          <Feather name="user" size={40} color="#FFFFFF" />
        </View>
        <ThemedText type="h3" style={styles.appName}>
          ColorSense
        </ThemedText>
        <ThemedText type="small" style={styles.appTagline}>
          Color scanning made accessible
        </ThemedText>
      </View>

      <SettingSection title="Color Palette">
        <SettingRow
          icon="droplet"
          title="My Color Palette"
          subtitle="Add your own colors to match against"
          showChevron
          onPress={() => navigation.navigate("ManagePalette")}
        />
      </SettingSection>

      <SettingSection title="Voice Feedback">
        <SettingRow
          icon="volume-2"
          title="Voice Announcements"
          subtitle="Speak color names when scanning"
          value={settings.voiceFeedbackEnabled}
          onValueChange={(value) =>
            handleSettingChange("voiceFeedbackEnabled", value)
          }
        />
      </SettingSection>

      <SettingSection title="How to Use">
        <SettingRow
          icon="smartphone"
          title="Open in Browser"
          subtitle="Use on any device with a camera"
        />
        <SettingRow
          icon="crosshair"
          title="Tap to Detect"
          subtitle="Tap anywhere on screen to identify color"
        />
        <SettingRow
          icon="globe"
          title="Web-Based Detection"
          subtitle="Works automatically - no setup needed"
        />
      </SettingSection>

      <SettingSection title="About">
        <SettingRow
          icon="info"
          title="Version"
          subtitle="1.0.0"
        />
        <SettingRow
          icon="shield"
          title="Privacy Policy"
          subtitle="All processing happens in your browser"
          showChevron
          onPress={() => {}}
        />
        <SettingRow
          icon="heart"
          title="Accessibility"
          subtitle="Designed for color-blind users"
        />
      </SettingSection>

      <View style={styles.footer}>
        <Feather name="eye" size={24} color={theme.textSecondary} />
        <ThemedText type="caption" style={styles.footerText}>
          ColorSense helps people with color blindness identify colors easily.
          All color detection happens locally in your browser.
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  appTagline: {
    opacity: 0.6,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    gap: 1,
  },
  settingRowContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: "500",
  },
  settingSubtitle: {
    opacity: 0.6,
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.md,
  },
  footerText: {
    textAlign: "center",
    opacity: 0.5,
    paddingHorizontal: Spacing.xl,
  },
});
