import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import {
  getColorInfo,
  getColorSimilarity,
  getContrastRatio,
  isLightColor,
} from "@/utils/colorUtils";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ScanStackParamList } from "@/navigation/ScanStackNavigator";

type CompareScreenProps = {
  navigation: NativeStackNavigationProp<ScanStackParamList, "Compare">;
  route: RouteProp<ScanStackParamList, "Compare">;
};

export default function CompareScreen({ route }: CompareScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const color1 = route.params?.color1 || "#2563EB";
  const color2 = route.params?.color2 || "#10B981";

  const color1Info = getColorInfo(color1);
  const color2Info = getColorInfo(color2);

  const similarity = getColorSimilarity(color1, color2);
  const contrastRatio = getContrastRatio(color1, color2);
  const isMatch = similarity >= 70;

  const color1TextColor = isLightColor(color1) ? "#111827" : "#FFFFFF";
  const color2TextColor = isLightColor(color2) ? "#111827" : "#FFFFFF";

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.colorsContainer}>
          <View style={[styles.colorPanel, { backgroundColor: color1 }]}>
            <ThemedText
              type="h3"
              style={[styles.colorName, { color: color1TextColor }]}
            >
              {color1Info.name}
            </ThemedText>
            <ThemedText
              style={[styles.colorHex, { color: color1TextColor, opacity: 0.8 }]}
            >
              {color1Info.hex}
            </ThemedText>
          </View>

          <View style={styles.divider}>
            <View
              style={[
                styles.dividerCircle,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="refresh-cw" size={20} color={theme.textSecondary} />
            </View>
          </View>

          <View style={[styles.colorPanel, { backgroundColor: color2 }]}>
            <ThemedText
              type="h3"
              style={[styles.colorName, { color: color2TextColor }]}
            >
              {color2Info.name}
            </ThemedText>
            <ThemedText
              style={[styles.colorHex, { color: color2TextColor, opacity: 0.8 }]}
            >
              {color2Info.hex}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.resultsCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.resultRow}>
            <View style={styles.resultLabel}>
              <Feather name="percent" size={18} color={theme.primary} />
              <ThemedText style={styles.resultLabelText}>Similarity</ThemedText>
            </View>
            <ThemedText type="h4" style={styles.resultValue}>
              {similarity}%
            </ThemedText>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <View style={styles.resultRow}>
            <View style={styles.resultLabel}>
              <Feather name="sun" size={18} color={theme.primary} />
              <ThemedText style={styles.resultLabelText}>Contrast Ratio</ThemedText>
            </View>
            <ThemedText type="h4" style={styles.resultValue}>
              {contrastRatio.toFixed(2)}:1
            </ThemedText>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <View style={styles.matchContainer}>
            <View
              style={[
                styles.matchBadge,
                { backgroundColor: isMatch ? theme.success : theme.error },
              ]}
            >
              <Feather
                name={isMatch ? "check" : "x"}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <ThemedText type="h4" style={styles.matchText}>
              {isMatch ? "Colors Match" : "Colors Don't Match"}
            </ThemedText>
            <ThemedText type="small" style={styles.matchSubtext}>
              {isMatch
                ? "These colors are similar enough to be considered a match"
                : "These colors have significant differences"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: theme.success }]}
            />
            <ThemedText type="caption" style={styles.legendText}>
              70%+ similarity = Match
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.error }]} />
            <ThemedText type="caption" style={styles.legendText}>
              Below 70% = No Match
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  colorsContainer: {
    flex: 1,
    gap: 0,
    marginBottom: Spacing.xl,
  },
  colorPanel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  colorName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  colorHex: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  dividerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.card,
  },
  resultsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  resultLabelText: {
    fontWeight: "500",
  },
  resultValue: {},
  separator: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  matchContainer: {
    alignItems: "center",
    paddingTop: Spacing.lg,
  },
  matchBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  matchText: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  matchSubtext: {
    textAlign: "center",
    opacity: 0.6,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    opacity: 0.6,
  },
});
