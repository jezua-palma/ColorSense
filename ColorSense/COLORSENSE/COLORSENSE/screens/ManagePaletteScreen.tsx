import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  PaletteColor,
  getPalette,
  addColorToPalette,
  updatePaletteColor,
  deleteColorFromPalette,
  hexToRgb,
} from "@/utils/palette";
import { isLightColor } from "@/utils/colorUtils";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESET_COLORS = [
  "#FF0000", "#FF4500", "#FFA500", "#FFD700", "#FFFF00",
  "#9ACD32", "#32CD32", "#00FF00", "#00FA9A", "#00FFFF",
  "#00BFFF", "#0000FF", "#4B0082", "#8B00FF", "#FF00FF",
  "#FF1493", "#DC143C", "#8B4513", "#000000", "#FFFFFF",
];

export default function ManagePaletteScreen() {
  const { theme } = useTheme();
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingColor, setEditingColor] = useState<PaletteColor | null>(null);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#FF0000");
  const [colorNotes, setColorNotes] = useState("");

  const loadPalette = useCallback(async () => {
    const data = await getPalette();
    setPalette(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPalette();
    }, [loadPalette])
  );

  const openAddModal = useCallback(() => {
    setEditingColor(null);
    setColorName("");
    setColorHex("#FF0000");
    setColorNotes("");
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openEditModal = useCallback((color: PaletteColor) => {
    setEditingColor(color);
    setColorName(color.name);
    setColorHex(color.hex);
    setColorNotes(color.notes || "");
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setEditingColor(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!colorName.trim()) {
      Alert.alert("Name Required", "Please enter a name for this color.");
      return;
    }

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(colorHex)) {
      Alert.alert("Invalid Color", "Please enter a valid hex color (e.g., #FF0000).");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (editingColor) {
      await updatePaletteColor(editingColor.id, {
        name: colorName.trim(),
        hex: colorHex,
        notes: colorNotes.trim() || undefined,
      });
    } else {
      await addColorToPalette(colorName.trim(), colorHex, colorNotes.trim() || undefined);
    }

    await loadPalette();
    closeModal();
  }, [colorName, colorHex, colorNotes, editingColor, loadPalette, closeModal]);

  const handleDelete = useCallback(async (color: PaletteColor) => {
    Alert.alert(
      "Delete Color",
      `Are you sure you want to delete "${color.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteColorFromPalette(color.id);
            await loadPalette();
          },
        },
      ]
    );
  }, [loadPalette]);

  const selectPresetColor = useCallback((hex: string) => {
    setColorHex(hex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const ColorCard = ({ color }: { color: PaletteColor }) => {
    const scale = useSharedValue(1);
    const textColor = isLightColor(color.hex) ? "#111827" : "#FFFFFF";
    const buttonBgColor = isLightColor(color.hex) ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)";

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        onPress={() => openEditModal(color)}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        style={[
          styles.colorCard,
          { backgroundColor: color.hex },
          animatedStyle,
        ]}
      >
        <View style={styles.colorCardContent}>
          <ThemedText type="h3" style={[styles.colorCardName, { color: textColor }]}>
            {color.name}
          </ThemedText>
          <ThemedText style={[styles.colorCardHex, { color: textColor }]}>
            {color.hex}
          </ThemedText>
          {color.notes ? (
            <ThemedText style={[styles.colorCardNotes, { color: textColor }]} numberOfLines={1}>
              {color.notes}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.cardActions}>
          <Pressable
            onPress={() => openEditModal(color)}
            style={[styles.actionButton, { backgroundColor: buttonBgColor }]}
            hitSlop={8}
          >
            <Feather name="edit-2" size={18} color={textColor} />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(color)}
            style={[styles.actionButton, styles.deleteButtonStyle, { backgroundColor: "#EF4444" }]}
            hitSlop={8}
          >
            <Feather name="trash-2" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenKeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="h2">My Color Palette</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Add colors to match against when scanning
          </ThemedText>
        </View>

        {palette.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="droplet" size={48} color={theme.textSecondary} />
            <ThemedText type="h3" style={styles.emptyTitle}>
              No Colors Yet
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Add your first color to start matching objects against your custom palette.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.paletteGrid}>
            {palette.map((color) => (
              <ColorCard key={color.id} color={color} />
            ))}
          </View>
        )}

        <Pressable
          onPress={openAddModal}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Add Color</ThemedText>
        </Pressable>
      </ScreenKeyboardAwareScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeModal} hitSlop={10}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="h3">
              {editingColor ? "Edit Color" : "Add Color"}
            </ThemedText>
            <Pressable onPress={handleSave} hitSlop={10}>
              <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
                Save
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <View
              style={[styles.colorPreview, { backgroundColor: colorHex }]}
            >
              <ThemedText
                type="h1"
                style={{ color: isLightColor(colorHex) ? "#111827" : "#FFFFFF" }}
              >
                {colorName || "Color Name"}
              </ThemedText>
              <ThemedText
                style={{ color: isLightColor(colorHex) ? "#111827" : "#FFFFFF" }}
              >
                {colorHex}
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Color Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
                ]}
                value={colorName}
                onChangeText={setColorName}
                placeholder="e.g., Sky Blue, My Favorite Red"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Hex Code</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
                ]}
                value={colorHex}
                onChangeText={(text) => {
                  let hex = text.toUpperCase();
                  if (!hex.startsWith("#")) hex = "#" + hex;
                  setColorHex(hex.slice(0, 7));
                }}
                placeholder="#FF0000"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="characters"
                maxLength={7}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Pick a Color</ThemedText>
              <View style={styles.presetGrid}>
                {PRESET_COLORS.map((hex) => (
                  <Pressable
                    key={hex}
                    onPress={() => selectPresetColor(hex)}
                    style={[
                      styles.presetColor,
                      { backgroundColor: hex },
                      colorHex === hex && styles.presetColorSelected,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
                ]}
                value={colorNotes}
                onChangeText={setColorNotes}
                placeholder="e.g., Living room wall, Brand primary"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  paletteGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  colorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minHeight: 100,
  },
  colorCardContent: {
    flex: 1,
  },
  colorCardName: {
    marginBottom: Spacing.xs,
  },
  colorCardHex: {
    opacity: 0.8,
  },
  colorCardNotes: {
    opacity: 0.7,
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  deleteButtonStyle: {
    marginLeft: Spacing.xs,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  colorPreview: {
    height: 150,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  presetColorSelected: {
    borderColor: "#000000",
    borderWidth: 3,
  },
});
