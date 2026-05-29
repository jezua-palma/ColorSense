import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { getColorHistory, clearColorHistory, ColorHistoryItem } from "@/utils/storage";
import { isLightColor } from "@/utils/colorUtils";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<HistoryStackParamList, "History">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TapColorCard({
  item,
  onPress,
}: {
  item: ColorHistoryItem;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const textColor = isLightColor(item.hex) ? "#111827" : "#FFFFFF";
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.colorCard, animatedStyle]}
    >
      <View
        style={[
          styles.colorSwatch,
          { backgroundColor: item.hex },
        ]}
      >
        <View style={styles.swatchBadges}>
          <View
            style={[
              styles.familyTag,
              {
                backgroundColor:
                  textColor === "#FFFFFF"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.1)",
              },
            ]}
          >
            <ThemedText style={[styles.familyTagText, { color: textColor }]}>
              {item.family}
            </ThemedText>
          </View>
          {item.paletteMatch ? (
            <View
              style={[
                styles.matchTag,
                {
                  backgroundColor:
                    item.paletteMatch.confidence === "exact"
                      ? theme.success
                      : item.paletteMatch.confidence === "close"
                      ? theme.warning
                      : "rgba(128,128,128,0.5)",
                },
              ]}
            >
              <Feather name="check" size={10} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.colorInfo}>
        {item.paletteMatch ? (
          <ThemedText type="body" style={styles.colorName} numberOfLines={1}>
            {item.paletteMatch.name}
          </ThemedText>
        ) : (
          <ThemedText type="body" style={styles.colorName} numberOfLines={1}>
            {item.name}
          </ThemedText>
        )}
        <ThemedText type="caption" style={styles.colorHex}>
          {item.hex}
        </ThemedText>
        <ThemedText type="caption" style={styles.timestamp}>
          {formatTime(item.timestamp)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function CaptureColorCard({
  item,
  onPress,
}: {
  item: ColorHistoryItem;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const dominantColors = item.captureData?.dominantColors || [];
  
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.captureCard, animatedStyle, { backgroundColor: theme.backgroundSecondary }]}
    >
      <View style={styles.captureHeader}>
        <View style={[styles.captureTypeBadge, { backgroundColor: theme.primary }]}>
          <Feather name="aperture" size={12} color="#FFFFFF" />
          <ThemedText style={styles.captureTypeBadgeText}>Capture</ThemedText>
        </View>
        <ThemedText type="caption" style={styles.timestamp}>
          {formatTime(item.timestamp)}
        </ThemedText>
      </View>
      
      <View style={styles.colorCompositionRow}>
        {dominantColors.slice(0, 5).map((color, index) => (
          <View 
            key={index} 
            style={[
              styles.compositionSwatch,
              { 
                backgroundColor: color.hex,
                flex: color.percentage / 100,
                minWidth: 20,
              }
            ]}
          />
        ))}
      </View>
      
      <View style={styles.captureInfo}>
        <ThemedText type="body" style={styles.colorName} numberOfLines={1}>
          {dominantColors.length > 0 ? dominantColors[0].name : item.name}
        </ThemedText>
        <View style={styles.colorListPreview}>
          {dominantColors.slice(0, 3).map((color, index) => (
            <ThemedText key={index} type="caption" style={styles.previewText}>
              {color.percentage}% {color.name}{index < 2 && dominantColors.length > index + 1 ? " · " : ""}
            </ThemedText>
          ))}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const [history, setHistory] = useState<ColorHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await getColorHistory();
    setHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all scanned colors?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await clearColorHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleColorPress = (item: ColorHistoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ColorDetail", {
      color: item.hex,
      name: item.paletteMatch ? item.paletteMatch.name : item.name,
      timestamp: item.timestamp,
      ...(item.captureData && { captureData: item.captureData }),
    });
  };

  const renderItem = ({ item }: { item: ColorHistoryItem }) => {
    if (item.type === "capture" && item.captureData) {
      return <CaptureColorCard item={item} onPress={() => handleColorPress(item)} />;
    }
    return <TapColorCard item={item} onPress={() => handleColorPress(item)} />;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="grid" size={64} color={theme.textSecondary} />
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Colors Scanned Yet
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        Start scanning colors and they will appear here
      </ThemedText>
    </View>
  );

  const getItemLayout = (data: ColorHistoryItem[] | null | undefined, index: number) => {
    const item = data?.[index];
    const height = item?.type === "capture" ? 140 : 180;
    return {
      length: height,
      offset: height * index,
      index,
    };
  };

  return (
    <ThemedView style={styles.container}>
      {history.length > 0 ? (
        <Pressable
          onPress={handleClearAll}
          style={({ pressed }) => [
            styles.clearButton,
            {
              top: paddingTop - Spacing.xl - 44,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="trash-2" size={20} color={theme.error} />
        </Pressable>
      ) : null}

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop,
            paddingBottom,
          },
          history.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clearButton: {
    position: "absolute",
    right: Spacing.xl,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  colorCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.card,
  },
  colorSwatch: {
    width: 100,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: Spacing.sm,
  },
  swatchBadges: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  matchTag: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  familyTag: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  familyTagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  colorInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  colorName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  colorHex: {
    opacity: 0.7,
  },
  timestamp: {
    opacity: 0.5,
    marginTop: Spacing.xs,
  },
  captureCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    padding: Spacing.md,
    ...Shadows.card,
  },
  captureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  captureTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  captureTypeBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  colorCompositionRow: {
    flexDirection: "row",
    height: 40,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  compositionSwatch: {
    height: "100%",
  },
  captureInfo: {
    gap: 2,
  },
  colorListPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  previewText: {
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing["3xl"],
  },
  emptyTitle: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
});
