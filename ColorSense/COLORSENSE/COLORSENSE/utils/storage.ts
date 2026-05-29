import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "@colorsense_history";
const SETTINGS_KEY = "@colorsense_settings";
const MAX_HISTORY_ITEMS = 50;

export interface ColorComposition {
  hex: string;
  name: string;
  family: string;
  percentage: number;
  rgb: { r: number; g: number; b: number };
}

export interface ColorHistoryItem {
  id: string;
  hex: string;
  name: string;
  family: string;
  timestamp: number;
  type: "tap" | "capture";
  paletteMatch?: {
    name: string;
    confidence: "exact" | "close" | "similar";
  };
  captureData?: {
    dominantColors: ColorComposition[];
    totalPixelsAnalyzed: number;
  };
}

export interface AppSettings {
  voiceFeedbackEnabled: boolean;
  voiceFeedbackMode: "onTap" | "auto" | "off";
  flashlightAutoEnable: boolean;
}

const defaultSettings: AppSettings = {
  voiceFeedbackEnabled: true,
  voiceFeedbackMode: "onTap",
  flashlightAutoEnable: false,
};

export async function getColorHistory(): Promise<ColorHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (data) {
      const history = JSON.parse(data);
      return history.map((item: any) => ({
        ...item,
        type: item.type || "tap",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error getting color history:", error);
    return [];
  }
}

export async function addColorToHistory(
  color: Omit<ColorHistoryItem, "id" | "timestamp">
): Promise<ColorHistoryItem[]> {
  try {
    const history = await getColorHistory();
    
    const newItem: ColorHistoryItem = {
      ...color,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error("Error adding color to history:", error);
    return [];
  }
}

export async function removeColorFromHistory(
  id: string
): Promise<ColorHistoryItem[]> {
  try {
    const history = await getColorHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error("Error removing color from history:", error);
    return [];
  }
}

export async function clearColorHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing color history:", error);
  }
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error getting settings:", error);
    return defaultSettings;
  }
}

export async function updateSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error("Error updating settings:", error);
    return defaultSettings;
  }
}

export const saveSettings = updateSettings;
