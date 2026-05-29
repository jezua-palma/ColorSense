import AsyncStorage from "@react-native-async-storage/async-storage";

const PALETTE_STORAGE_KEY = "@colorsense_palette";

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  notes?: string;
  createdAt: number;
}

export interface ColorMatch {
  color: PaletteColor;
  distance: number;
  confidence: "exact" | "close" | "similar" | "different";
}

function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  rNorm *= 100;
  gNorm *= 100;
  bNorm *= 100;

  const x = rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805;
  const y = rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722;
  const z = rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 0.9505;

  const xRef = 95.047;
  const yRef = 100.0;
  const zRef = 108.883;

  let xNorm = x / xRef;
  let yNorm = y / yRef;
  let zNorm = z / zRef;

  xNorm = xNorm > 0.008856 ? Math.pow(xNorm, 1 / 3) : 7.787 * xNorm + 16 / 116;
  yNorm = yNorm > 0.008856 ? Math.pow(yNorm, 1 / 3) : 7.787 * yNorm + 16 / 116;
  zNorm = zNorm > 0.008856 ? Math.pow(zNorm, 1 / 3) : 7.787 * zNorm + 16 / 116;

  const l = 116 * yNorm - 16;
  const a = 500 * (xNorm - yNorm);
  const labB = 200 * (yNorm - zNorm);

  return { l, a, b: labB };
}

export function calculateColorDistance(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
): number {
  const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
  const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);

  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

function getConfidenceLevel(distance: number): "exact" | "close" | "similar" | "different" {
  if (distance < 5) return "exact";
  if (distance < 15) return "close";
  if (distance < 30) return "similar";
  return "different";
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  return { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function getPalette(): Promise<PaletteColor[]> {
  try {
    const data = await AsyncStorage.getItem(PALETTE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading palette:", error);
  }
  return [];
}

export async function savePalette(palette: PaletteColor[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palette));
  } catch (error) {
    console.error("Error saving palette:", error);
  }
}

export async function addColorToPalette(
  name: string,
  hex: string,
  notes?: string
): Promise<PaletteColor> {
  const palette = await getPalette();
  const rgb = hexToRgb(hex);
  
  const newColor: PaletteColor = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    hex: hex.toUpperCase(),
    rgb,
    notes,
    createdAt: Date.now(),
  };

  palette.unshift(newColor);
  await savePalette(palette);
  return newColor;
}

export async function updatePaletteColor(
  id: string,
  updates: Partial<Pick<PaletteColor, "name" | "hex" | "notes">>
): Promise<void> {
  const palette = await getPalette();
  const index = palette.findIndex(c => c.id === id);
  
  if (index !== -1) {
    if (updates.hex) {
      updates.hex = updates.hex.toUpperCase();
      palette[index].rgb = hexToRgb(updates.hex);
    }
    palette[index] = { ...palette[index], ...updates };
    await savePalette(palette);
  }
}

export async function deleteColorFromPalette(id: string): Promise<void> {
  const palette = await getPalette();
  const filtered = palette.filter(c => c.id !== id);
  await savePalette(filtered);
}

export function findClosestMatch(
  rgb: { r: number; g: number; b: number },
  palette: PaletteColor[]
): ColorMatch | null {
  if (palette.length === 0) return null;

  let closestMatch: ColorMatch | null = null;
  let minDistance = Infinity;

  for (const color of palette) {
    const distance = calculateColorDistance(rgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = {
        color,
        distance,
        confidence: getConfidenceLevel(distance),
      };
    }
  }

  return closestMatch;
}

export function findTopMatches(
  rgb: { r: number; g: number; b: number },
  palette: PaletteColor[],
  limit: number = 3
): ColorMatch[] {
  if (palette.length === 0) return [];

  const matches: ColorMatch[] = palette.map(color => ({
    color,
    distance: calculateColorDistance(rgb, color.rgb),
    confidence: getConfidenceLevel(calculateColorDistance(rgb, color.rgb)),
  }));

  matches.sort((a, b) => a.distance - b.distance);
  return matches.slice(0, limit);
}
