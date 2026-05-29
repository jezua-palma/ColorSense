export interface ColorHistoryItem {
  id: string;
  hex: string;
  name: string;
  family: string;
  timestamp: number;
  type: "tap" | "capture";
  confidence?: number;
  dominantColors?: { hex: string; name: string; percentage: number }[];
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  family: string;
}

export interface AppSettings {
  voiceFeedbackEnabled: boolean;
  voiceRate: number; // 0.5 to 2
  voicePitch: number; // 0.5 to 2
  theme: "light" | "dark";
  textSize: number; // 80 to 120 (percentage)
  highContrast: boolean;
  activeFilter: "none" | "protanopia" | "deuteranopia" | "tritanopia";
}

const HISTORY_KEY = "colorsense_history";
const PALETTE_KEY = "colorsense_palette";
const SETTINGS_KEY = "colorsense_settings";

const defaultSettings: AppSettings = {
  voiceFeedbackEnabled: true,
  voiceRate: 1.0,
  voicePitch: 1.0,
  theme: "dark",
  textSize: 100,
  highContrast: false,
  activeFilter: "none"
};

export const storage = {
  getHistory(): ColorHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistory(history: ColorHistoryItem[]) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Cap at 50
    } catch (e) {
      console.error("Error saving history:", e);
    }
  },

  addHistoryItem(item: Omit<ColorHistoryItem, "id" | "timestamp">) {
    const history = this.getHistory();
    const newItem: ColorHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    history.unshift(newItem);
    this.saveHistory(history);
    return newItem;
  },

  deleteHistoryItem(id: string) {
    const history = this.getHistory();
    const filtered = history.filter(item => item.id !== id);
    this.saveHistory(filtered);
    return filtered;
  },

  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  },

  getCustomPalette(): PaletteColor[] {
    try {
      const data = localStorage.getItem(PALETTE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPalette(palette: PaletteColor[]) {
    try {
      localStorage.setItem(PALETTE_KEY, JSON.stringify(palette));
    } catch (e) {
      console.error("Error saving palette:", e);
    }
  },

  addPaletteColor(name: string, hex: string, family: string) {
    const palette = this.getCustomPalette();
    const newColor: PaletteColor = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      hex: hex.toUpperCase(),
      family
    };
    palette.push(newColor);
    this.saveCustomPalette(palette);
    return newColor;
  },

  deletePaletteColor(id: string) {
    const palette = this.getCustomPalette();
    const filtered = palette.filter(c => c.id !== id);
    this.saveCustomPalette(filtered);
    return filtered;
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }
};
