import React, { useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { getColorInfo, isLightColor } from "@/utils/colorUtils";
import { removeColorFromHistory } from "@/utils/storage";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ScanStackParamList } from "@/navigation/ScanStackNavigator";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";

interface ColorComposition {
  hex: string;
  name: string;
  family: string;
  percentage: number;
  rgb: { r: number; g: number; b: number };
}

type ColorDetailScreenRouteProp =
  | RouteProp<ScanStackParamList, "ColorDetail">
  | RouteProp<HistoryStackParamList, "ColorDetail">;

type ColorDetailScreenProps = {
  route: ColorDetailScreenRouteProp;
};

interface ActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

function ActionButton({ icon, label, onPress, color }: ActionButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: color || theme.primary },
        ]}
      >
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <ThemedText type="small" style={styles.actionLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
}

function InfoRow({ label, value, onCopy }: InfoRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <View style={styles.infoValueContainer}>
        <ThemedText type="body" style={styles.infoValue}>
          {value}
        </ThemedText>
        {onCopy ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCopy();
            }}
            style={({ pressed }) => [
              styles.copyButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Feather name="copy" size={16} color={theme.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function ColorDetailScreen({ route }: ColorDetailScreenProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const params = route.params;
  const { color, name, timestamp } = params;
  const captureData = "captureData" in params ? params.captureData : undefined;
  const hasDominantColors = captureData !== undefined && 
    Array.isArray(captureData.dominantColors) && 
    captureData.dominantColors.length > 0;
  const isCapture = hasDominantColors;
  
  const colorInfo = getColorInfo(color);
  const textColor = isLightColor(color) ? "#111827" : "#FFFFFF";

  const formatDate = (ts?: number) => {
    if (!ts) return "Just now";
    const date = new Date(ts);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSpeak = useCallback(() => {
    if (isCapture && captureData && Array.isArray(captureData.dominantColors)) {
      const compositionText = captureData.dominantColors
        .map((c) => `${Math.round(c.percentage)}% ${c.name}`)
        .join(", ");
      Speech.speak(`Image contains: ${compositionText}`, {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
      });
    } else {
      Speech.speak(colorInfo.name, {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  }, [colorInfo.name, isCapture, captureData]);

  const handleCopyHex = useCallback(async () => {
    await Clipboard.setStringAsync(colorInfo.hex);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied", `${colorInfo.hex} copied to clipboard`);
  }, [colorInfo.hex]);

  const handleCopyRgb = useCallback(async () => {
    const rgbString = `rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`;
    await Clipboard.setStringAsync(rgbString);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied", `${rgbString} copied to clipboard`);
  }, [colorInfo.rgb]);

  const handleCopyHsl = useCallback(async () => {
    const hslString = `hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`;
    await Clipboard.setStringAsync(hslString);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied", `${hslString} copied to clipboard`);
  }, [colorInfo.hsl]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Color",
      "Remove this color from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (timestamp) {
              const id = `${timestamp}`;
              await removeColorFromHistory(id);
            }
            navigation.goBack();
          },
        },
      ]
    );
  }, [timestamp, navigation]);

  return (
    <ScreenScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: headerHeight + Spacing.xl },
      ]}
    >
      {isCapture && captureData ? (
        <>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h4" style={styles.infoTitle}>
              Color Composition
            </ThemedText>
            <View style={styles.compositionBarsContainer}>
              {captureData.dominantColors.map((c, index) => (
                <View key={index} style={styles.compositionItem}>
                  <View
                    style={[
                      styles.compositionSwatch,
                      { backgroundColor: c.hex },
                    ]}
                  />
                  <View style={styles.compositionInfo}>
                    <ThemedText type="body" style={styles.compositionName}>
                      {c.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.compositionFamily}>
                      {c.family}
                    </ThemedText>
                  </View>
                  <ThemedText type="h4" style={styles.compositionPercentage}>
                    {Math.round(c.percentage)}%
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <ActionButton icon="volume-2" label="Speak" onPress={handleSpeak} />
            <ActionButton icon="copy" label="Copy Hex" onPress={handleCopyHex} />
            {timestamp ? (
              <ActionButton
                icon="trash-2"
                label="Delete"
                onPress={handleDelete}
                color={theme.error}
              />
            ) : null}
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h4" style={styles.infoTitle}>
              Dominant Color
            </ThemedText>
            <View style={styles.dominantColorPreview}>
              <View
                style={[
                  styles.dominantColorSwatch,
                  { backgroundColor: color },
                ]}
              />
              <View style={styles.dominantColorInfo}>
                <ThemedText type="body" style={styles.compositionName}>
                  {colorInfo.name}
                </ThemedText>
                <ThemedText type="small" style={styles.compositionFamily}>
                  {colorInfo.hex}
                </ThemedText>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: color },
            ]}
          >
            <ThemedText
              type="h1"
              style={[styles.previewName, { color: textColor }]}
            >
              {colorInfo.name}
            </ThemedText>
            <View
              style={[
                styles.familyBadge,
                {
                  backgroundColor:
                    textColor === "#FFFFFF"
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.1)",
                },
              ]}
            >
              <ThemedText style={[styles.familyText, { color: textColor }]}>
                {colorInfo.family}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <ActionButton icon="volume-2" label="Speak" onPress={handleSpeak} />
            <ActionButton icon="copy" label="Copy Hex" onPress={handleCopyHex} />
            {timestamp ? (
              <ActionButton
                icon="trash-2"
                label="Delete"
                onPress={handleDelete}
                color={theme.error}
              />
            ) : null}
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h4" style={styles.infoTitle}>
              Color Values
            </ThemedText>

            <InfoRow label="Hex" value={colorInfo.hex} onCopy={handleCopyHex} />
            <InfoRow
              label="RGB"
              value={`${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b}`}
              onCopy={handleCopyRgb}
            />
            <InfoRow
              label="HSL"
              value={`${colorInfo.hsl.h}°, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%`}
              onCopy={handleCopyHsl}
            />
            <InfoRow label="Family" value={colorInfo.family} />
          </View>
        </>
      )}

      {timestamp ? (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="h4" style={styles.infoTitle}>
            Scan Details
          </ThemedText>
          <InfoRow label="Scanned" value={formatDate(timestamp)} />
          {isCapture ? (
            <InfoRow label="Type" value="Capture Analysis" />
          ) : (
            <InfoRow label="Type" value="Tap Detection" />
          )}
        </View>
      ) : null}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing["3xl"],
  },
  colorPreview: {
    aspectRatio: 1.5,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    ...Shadows.floating,
  },
  previewName: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  familyBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  familyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 80,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontWeight: "500",
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    opacity: 0.6,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoValue: {
    fontWeight: "500",
  },
  copyButton: {
    padding: Spacing.xs,
  },
  compositionBarsContainer: {
    gap: Spacing.md,
  },
  compositionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  compositionSwatch: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  compositionInfo: {
    flex: 1,
  },
  compositionName: {
    fontWeight: "600",
  },
  compositionFamily: {
    opacity: 0.6,
  },
  compositionPercentage: {
    fontWeight: "700",
    marginLeft: Spacing.md,
  },
  dominantColorPreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  dominantColorSwatch: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.lg,
  },
  dominantColorInfo: {
    flex: 1,
  },
});
