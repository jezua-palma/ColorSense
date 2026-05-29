import { trainedColors, NamedColor } from "./trainedColors";

export interface ColorInfo {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  family: string;
  distance?: number;
}

export interface LabColor {
  l: number;
  a: number;
  b: number;
  r: number;
  g: number;
  bVal: number; // to avoid name conflict with LAB 'b'
}

let colorCache: (NamedColor & { lab: { l: number; a: number; b: number } })[] | null = null;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  rNorm *= 100;
  gNorm *= 100;
  bNorm *= 100;

  let x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
  let y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
  let z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

  x /= 95.047;
  y /= 100.000;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  const L = (116 * y) - 16;
  const A = 500 * (x - y);
  const B = 200 * (y - z);

  return { l: L, a: A, b: B };
}

export function deltaE2000(lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }): number {
  const L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
  const L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;

  const kL = 1, kC = 1, kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cab, 7) / (Math.pow(Cab, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * (180 / Math.PI);
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * (180 / Math.PI);
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180));

  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let Hp: number;
  if (C1p * C2p === 0) {
    Hp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    Hp = (h1p + h2p + 360) / 2;
  } else {
    Hp = (h1p + h2p - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos((Hp - 30) * (Math.PI / 180))
            + 0.24 * Math.cos(2 * Hp * (Math.PI / 180))
            + 0.32 * Math.cos((3 * Hp + 6) * (Math.PI / 180))
            - 0.20 * Math.cos((4 * Hp - 63) * (Math.PI / 180));

  const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));

  const RC = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const RT = -Math.sin(2 * dTheta * (Math.PI / 180)) * RC;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

function initializeColorCache() {
  if (colorCache) return colorCache;
  
  colorCache = trainedColors.map(color => {
    const rgb = hexToRgb(color.hex);
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
    return {
      ...color,
      lab,
    };
  });
  
  return colorCache;
}

export function findClosestNamedColors(r: number, g: number, b: number, count: number = 5): { color: NamedColor; distance: number }[] {
  const cache = initializeColorCache();
  const targetLab = rgbToLab(r, g, b);
  
  const distances = cache.map(color => {
    return {
      color: { name: color.name, hex: color.hex, family: color.family },
      distance: deltaE2000(targetLab, color.lab)
    };
  });

  // Sort by distance ascending
  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, count);
}

export function getColorFromRgb(r: number, g: number, b: number, customPalette: { name: string; hex: string; family: string }[] = []): ColorInfo {
  // If we have custom palette colors, check them first.
  let closestColor: NamedColor = trainedColors[0];
  let minDistance = Infinity;

  const targetLab = rgbToLab(r, g, b);

  if (customPalette && customPalette.length > 0) {
    for (const color of customPalette) {
      const rgb = hexToRgb(color.hex);
      const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
      const distance = deltaE2000(targetLab, lab);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }
    // If the custom palette match is exceptionally close (distance < 10), return it directly!
    if (minDistance < 10) {
      const hsl = rgbToHsl(r, g, b);
      const actualHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
      return {
        name: closestColor.name + " (Custom)",
        hex: actualHex,
        rgb: { r, g, b },
        hsl,
        family: closestColor.family,
        distance: Math.round(minDistance)
      };
    }
  }

  // Otherwise, match against the main trained database
  const matches = findClosestNamedColors(r, g, b, 1);
  const bestMatch = matches[0];
  const hsl = rgbToHsl(r, g, b);
  const actualHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();

  return {
    name: bestMatch.color.name,
    hex: actualHex,
    rgb: { r, g, b },
    hsl,
    family: bestMatch.color.family,
    distance: Math.round(bestMatch.distance)
  };
}

export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.55;
}

export function getColorInfo(hex: string, customPalette: { name: string; hex: string; family: string }[] = []): ColorInfo {
  const rgb = hexToRgb(hex);
  return getColorFromRgb(rgb.r, rgb.g, rgb.b, customPalette);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function getColorSimilarity(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
  const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);
  
  const deltaE = deltaE2000(lab1, lab2);
  
  // Similarity score out of 100. Perceptually, a deltaE of 0 is 100% similar.
  // DeltaE > 50 is completely different.
  const similarity = Math.max(0, 100 - (deltaE * 2));
  return Math.round(similarity);
}

// Lab-space K-means Clustering algorithm (k=8)
export function kMeansClustering(pixels: LabColor[], k: number, maxIterations: number = 20): LabColor[][] {
  if (pixels.length === 0) return [];
  if (pixels.length <= k) return pixels.map(p => [p]);

  // Choose initial centroids evenly across the pixel list
  let centroids = Array.from({ length: k }, (_, idx) => {
    const pIdx = Math.floor((idx * pixels.length) / k);
    return { ...pixels[pIdx] };
  });

  let clusters: LabColor[][] = Array.from({ length: k }, () => []);
  let oldCentroids = centroids.map(c => ({ ...c }));

  for (let iter = 0; iter < maxIterations; iter++) {
    // Reset clusters
    clusters = Array.from({ length: k }, () => []);

    // Assign pixels to closest centroid
    for (const pixel of pixels) {
      let closestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < k; i++) {
        const dist = deltaE2000(pixel, centroids[i]);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      clusters[closestIdx].push(pixel);
    }

    // Recompute centroids
    let centroidsChanged = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;

      const avgL = clusters[i].reduce((sum, p) => sum + p.l, 0) / clusters[i].length;
      const avgA = clusters[i].reduce((sum, p) => sum + p.a, 0) / clusters[i].length;
      const avgB = clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length;
      
      const avgR = Math.round(clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length);
      const avgG = Math.round(clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length);
      const avgBVal = Math.round(clusters[i].reduce((sum, p) => sum + p.bVal, 0) / clusters[i].length);

      const dCentroid = deltaE2000(centroids[i], { l: avgL, a: avgA, b: avgB });
      if (dCentroid > 0.5) {
        centroidsChanged = true;
      }

      centroids[i] = {
        l: avgL,
        a: avgA,
        b: avgB,
        r: avgR,
        g: avgG,
        bVal: avgBVal
      };
    }

    if (!centroidsChanged) {
      break;
    }
  }

  // Filter out empty clusters
  return clusters.filter(c => c.length > 0);
}
