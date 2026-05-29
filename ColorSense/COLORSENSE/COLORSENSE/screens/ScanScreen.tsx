import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  Dimensions,
  GestureResponderEvent,
  ScrollView,
  PanResponder,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { getColorFromRgb, isLightColor, getColorInfo, rgbToLab, deltaE2000 } from "@/utils/colorUtils";
import { addColorToHistory, getSettings, updateSettings, ColorComposition } from "@/utils/storage";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ScanStackParamList } from "@/navigation/ScanStackNavigator";
import { PaletteColor, getPalette, findClosestMatch, ColorMatch, rgbToHex } from "@/utils/palette";
import { useFocusEffect } from "@react-navigation/native";

type ScanScreenProps = {
  navigation: NativeStackNavigationProp<ScanStackParamList, "Scan">;
};

type ScanMode = "tap" | "capture";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface StabilizedColor {
  r: number;
  g: number;
  b: number;
  confidence: number;
}

async function extractColorAtPosition(
  base64Data: string,
  tapX: number,
  tapY: number,
  imageWidth: number,
  imageHeight: number
): Promise<StabilizedColor | null> {
  return new Promise((resolve) => {
    if (!base64Data || base64Data.length < 100) {
      resolve(null);
      return;
    }
    
    if (typeof tapX !== 'number' || typeof tapY !== 'number' || isNaN(tapX) || isNaN(tapY)) {
      resolve(null);
      return;
    }

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    
    const timeoutId = setTimeout(() => {
      resolve(null);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const scaleX = img.width / imageWidth;
        const scaleY = img.height / imageHeight;
        const targetX = Math.floor(tapX * scaleX);
        const targetY = Math.floor(tapY * scaleY);

        const sampleRadius = 20;
        const sigma = 8.0;
        let totalR = 0, totalG = 0, totalB = 0;
        let totalWeight = 0;
        const samples: Array<{r: number, g: number, b: number, weight: number}> = [];

        for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
          for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > sampleRadius) continue;
            
            const x = Math.max(0, Math.min(canvas.width - 1, targetX + dx));
            const y = Math.max(0, Math.min(canvas.height - 1, targetY + dy));
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            
            const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma));
            totalR += pixelData[0] * weight;
            totalG += pixelData[1] * weight;
            totalB += pixelData[2] * weight;
            totalWeight += weight;
            
            samples.push({ r: pixelData[0], g: pixelData[1], b: pixelData[2], weight });
          }
        }
        
        if (samples.length > 0 && totalWeight > 0) {
          const weightedR = Math.round(totalR / totalWeight);
          const weightedG = Math.round(totalG / totalWeight);
          const weightedB = Math.round(totalB / totalWeight);
          
          samples.sort((a, b) => a.r - b.r);
          const medianR = samples[Math.floor(samples.length / 2)].r;
          samples.sort((a, b) => a.g - b.g);
          const medianG = samples[Math.floor(samples.length / 2)].g;
          samples.sort((a, b) => a.b - b.b);
          const medianB = samples[Math.floor(samples.length / 2)].b;
          
          const finalR = Math.round(weightedR * 0.6 + medianR * 0.4);
          const finalG = Math.round(weightedG * 0.6 + medianG * 0.4);
          const finalB = Math.round(weightedB * 0.6 + medianB * 0.4);
          
          let variance = 0;
          for (const sample of samples) {
            const dr = sample.r - finalR;
            const dg = sample.g - finalG;
            const db = sample.b - finalB;
            variance += (dr * dr + dg * dg + db * db) * sample.weight;
          }
          variance /= totalWeight;
          const stdDev = Math.sqrt(variance);
          const confidence = Math.max(0, Math.min(100, 100 - stdDev / 2));
          
          resolve({
            r: finalR,
            g: finalG,
            b: finalB,
            confidence,
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        resolve(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(null);
    };
    
    const dataUrl = base64Data.startsWith("data:") 
      ? base64Data 
      : `data:image/jpeg;base64,${base64Data}`;
    img.src = dataUrl;
  });
}

interface LabColor {
  l: number;
  a: number;
  b: number;
  r: number;
  g: number;
  bVal: number;
}

function kMeansClustering(pixels: LabColor[], k: number, maxIterations: number = 20): LabColor[][] {
  if (pixels.length === 0) return [];
  
  const centroids: LabColor[] = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k && i * step < pixels.length; i++) {
    centroids.push({ ...pixels[i * step] });
  }
  
  let clusters: LabColor[][] = Array.from({ length: k }, () => []);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = Array.from({ length: k }, () => []);
    
    for (const pixel of pixels) {
      let minDist = Infinity;
      let closestIdx = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = deltaE2000(
          { l: pixel.l, a: pixel.a, b: pixel.b },
          { l: centroids[i].l, a: centroids[i].a, b: centroids[i].b }
        );
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      
      clusters[closestIdx].push(pixel);
    }
    
    let converged = true;
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length === 0) continue;
      
      const newL = clusters[i].reduce((sum, p) => sum + p.l, 0) / clusters[i].length;
      const newA = clusters[i].reduce((sum, p) => sum + p.a, 0) / clusters[i].length;
      const newB = clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length;
      const newR = Math.round(clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length);
      const newG = Math.round(clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length);
      const newBVal = Math.round(clusters[i].reduce((sum, p) => sum + p.bVal, 0) / clusters[i].length);
      
      const movement = deltaE2000(
        { l: centroids[i].l, a: centroids[i].a, b: centroids[i].b },
        { l: newL, a: newA, b: newB }
      );
      
      if (movement > 1) converged = false;
      
      centroids[i] = { l: newL, a: newA, b: newB, r: newR, g: newG, bVal: newBVal };
    }
    
    if (converged) break;
  }
  
  return clusters.filter(c => c.length > 0);
}

async function analyzeImageComposition(
  base64Data: string,
  imageWidth: number,
  imageHeight: number
): Promise<ColorComposition[]> {
  return new Promise((resolve) => {
    if (!base64Data || base64Data.length < 100) {
      resolve([]);
      return;
    }

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    
    const timeoutId = setTimeout(() => {
      resolve([]);
    }, 10000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve([]);
          return;
        }
        
        const cropRatio = 0.65;
        const cropWidth = Math.floor(img.width * cropRatio);
        const cropHeight = Math.floor(img.height * cropRatio);
        const cropX = Math.floor((img.width - cropWidth) / 2);
        const cropY = Math.floor((img.height - cropHeight) / 2);
        
        const maxSize = 150;
        const scale = Math.min(maxSize / cropWidth, maxSize / cropHeight);
        canvas.width = Math.floor(cropWidth * scale);
        canvas.height = Math.floor(cropHeight * scale);
        
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, canvas.width, canvas.height
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        const labPixels: LabColor[] = [];
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const lab = rgbToLab(r, g, b);
          labPixels.push({ l: lab.l, a: lab.a, b: lab.b, r, g, bVal: b });
        }
        
        const clusters = kMeansClustering(labPixels, 8, 25);
        
        const clusterData = clusters
          .map(cluster => {
            if (cluster.length === 0) return null;
            
            const avgR = Math.round(cluster.reduce((sum, p) => sum + p.r, 0) / cluster.length);
            const avgG = Math.round(cluster.reduce((sum, p) => sum + p.g, 0) / cluster.length);
            const avgB = Math.round(cluster.reduce((sum, p) => sum + p.bVal, 0) / cluster.length);
            
            return {
              count: cluster.length,
              r: avgR,
              g: avgG,
              b: avgB,
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null)
          .sort((a, b) => b.count - a.count);
        
        const totalPixels = labPixels.length;
        const compositions: ColorComposition[] = [];
        const minClusterPercent = 3;
        
        for (const cluster of clusterData) {
          const percentage = (cluster.count / totalPixels) * 100;
          if (percentage < minClusterPercent) continue;
          
          const colorInfo = getColorFromRgb(cluster.r, cluster.g, cluster.b);
          
          const clusterLab = rgbToLab(cluster.r, cluster.g, cluster.b);
          const isDuplicate = compositions.some(existing => {
            const existingLab = rgbToLab(existing.rgb.r, existing.rgb.g, existing.rgb.b);
            return deltaE2000(existingLab, clusterLab) < 15;
          });
          
          if (isDuplicate) continue;
          
          compositions.push({
            hex: colorInfo.hex,
            name: colorInfo.name,
            family: colorInfo.family,
            percentage: Math.round(percentage),
            rgb: { r: cluster.r, g: cluster.g, b: cluster.b },
          });
          
          if (compositions.length >= 8) break;
        }
        
        const totalPercentage = compositions.reduce((sum, c) => sum + c.percentage, 0);
        if (totalPercentage > 0 && totalPercentage !== 100) {
          const factor = 100 / totalPercentage;
          compositions.forEach(c => {
            c.percentage = Math.round(c.percentage * factor);
          });
        }
        
        const sumCheck = compositions.reduce((sum, c) => sum + c.percentage, 0);
        if (sumCheck !== 100 && compositions.length > 0) {
          const diff = 100 - sumCheck;
          compositions[0].percentage += diff;
        }
        
        resolve(compositions);
      } catch (error) {
        resolve([]);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve([]);
    };
    
    const dataUrl = base64Data.startsWith("data:") 
      ? base64Data 
      : `data:image/jpeg;base64,${base64Data}`;
    img.src = dataUrl;
  });
}

export default function ScanScreen({ navigation }: ScanScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>("tap");
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState({
    name: "Hold to detect color",
    hex: "#2563EB",
    rgb: { r: 37, g: 99, b: 235 },
    hsl: { h: 217, s: 91, l: 53 },
    family: "Blue",
  });
  const [colorConfidence, setColorConfidence] = useState<number>(100);
  const [compareColor, setCompareColor] = useState<string | null>(null);
  const [lastSpokenColor, setLastSpokenColor] = useState("");
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [paletteMatch, setPaletteMatch] = useState<ColorMatch | null>(null);
  const [captureAnalysis, setCaptureAnalysis] = useState<ColorComposition[] | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const isScanningRef = useRef(false);
  const lastDetectedColorRef = useRef<{ r: number; g: number; b: number } | null>(null);
  const colorCardScale = useSharedValue(1);
  const tapIndicatorScale = useSharedValue(0);
  const tapIndicatorOpacity = useSharedValue(0);
  
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const holdProgressValue = useSharedValue(0);
  const LONG_PRESS_DURATION = 300;
  const MOVEMENT_TOLERANCE = 15;

  useEffect(() => {
    loadSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadPalette = async () => {
        const data = await getPalette();
        setPalette(data);
      };
      loadPalette();
      setShowAnalysis(false);
      setCaptureAnalysis(null);
    }, [])
  );

  const loadSettings = async () => {
    const settings = await getSettings();
    setVoiceEnabled(settings.voiceFeedbackEnabled);
  };

  const speakColor = useCallback(
    (colorName: string) => {
      if (voiceEnabled) {
        Speech.stop();
        Speech.speak(colorName, {
          language: "en",
          pitch: 1.0,
          rate: 0.9,
        });
        setLastSpokenColor(colorName);
      }
    },
    [voiceEnabled]
  );

  const isColorSimilar = useCallback((c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    return distance < 15;
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressStartRef.current = null;
    setIsHolding(false);
    holdProgressValue.value = withTiming(0, { duration: 100 });
  }, [holdProgressValue]);

  const executeColorDetection = useCallback(
    async (tapX: number, tapY: number) => {
      if (isScanningRef.current || !cameraRef.current || !cameraEnabled) return;
      
      setTapPosition({ x: tapX, y: tapY });
      
      tapIndicatorScale.value = 0;
      tapIndicatorOpacity.value = 1;
      tapIndicatorScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );

      isScanningRef.current = true;
      setIsScanning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      try {
        const samples: Array<{ r: number; g: number; b: number; confidence: number }> = [];
        
        for (let i = 0; i < 3; i++) {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.9,
            base64: true,
            skipProcessing: true,
          });

          if (photo && photo.base64) {
            const rgb = await extractColorAtPosition(
              photo.base64,
              tapX,
              tapY,
              SCREEN_WIDTH,
              SCREEN_HEIGHT
            );
            if (rgb) {
              samples.push(rgb);
            }
          }
          
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        if (samples.length === 0) {
          setCurrentColor({
            name: "Hold to detect color",
            hex: "#EF4444",
            rgb: { r: 239, g: 68, b: 68 },
            hsl: { h: 0, s: 84, l: 60 },
            family: "Red",
          });
          speakColor("Could not detect color, please hold and try again");
          setTimeout(() => {
            tapIndicatorOpacity.value = withTiming(0, { duration: 300 });
          }, 500);
          isScanningRef.current = false;
          setIsScanning(false);
          return;
        }

        let finalR = 0, finalG = 0, finalB = 0;
        let totalConfidence = 0;
        
        for (const sample of samples) {
          finalR += sample.r * sample.confidence;
          finalG += sample.g * sample.confidence;
          finalB += sample.b * sample.confidence;
          totalConfidence += sample.confidence;
        }
        
        finalR = Math.round(finalR / totalConfidence);
        finalG = Math.round(finalG / totalConfidence);
        finalB = Math.round(finalB / totalConfidence);
        
        const avgConfidence = totalConfidence / samples.length;
        setColorConfidence(Math.round(avgConfidence));

        if (lastDetectedColorRef.current && isColorSimilar({ r: finalR, g: finalG, b: finalB }, lastDetectedColorRef.current)) {
          finalR = lastDetectedColorRef.current.r;
          finalG = lastDetectedColorRef.current.g;
          finalB = lastDetectedColorRef.current.b;
        } else {
          lastDetectedColorRef.current = { r: finalR, g: finalG, b: finalB };
        }

        const colorInfo = getColorFromRgb(finalR, finalG, finalB);

        if (currentColor.name !== "Hold to detect color") {
          setCompareColor(currentColor.hex);
        }
        
        const match = findClosestMatch(colorInfo.rgb, palette);
        if (match && match.confidence !== "different") {
          setPaletteMatch(match);
        } else {
          setPaletteMatch(null);
        }
        
        setCurrentColor(colorInfo);

        colorCardScale.value = withSpring(1.05, { damping: 12, stiffness: 200 });
        setTimeout(() => {
          colorCardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }, 150);

        let speakName = colorInfo.name;
        if (match && match.confidence !== "different") {
          if (match.confidence === "exact") {
            speakName = `This looks like your ${match.color.name}`;
          } else if (match.confidence === "close") {
            speakName = `Close to your ${match.color.name}`;
          } else {
            speakName = `Similar to your ${match.color.name}`;
          }
        }
        speakColor(speakName);
        
        const historyEntry: { 
          hex: string; 
          name: string; 
          family: string; 
          type: "tap";
          paletteMatch?: { name: string; confidence: "exact" | "close" | "similar" } 
        } = {
          hex: colorInfo.hex,
          name: colorInfo.name,
          family: colorInfo.family,
          type: "tap",
        };
        
        if (match && match.confidence !== "different") {
          historyEntry.paletteMatch = {
            name: match.color.name,
            confidence: match.confidence,
          };
        }
        
        await addColorToHistory(historyEntry);

        setTimeout(() => {
          tapIndicatorOpacity.value = withTiming(0, { duration: 300 });
        }, 500);
      } catch (error) {
        console.error("Color detection error:", error);
      } finally {
        isScanningRef.current = false;
        setIsScanning(false);
        setIsHolding(false);
        holdProgressValue.value = withTiming(0, { duration: 100 });
      }
    },
    [speakColor, colorCardScale, cameraEnabled, tapIndicatorScale, tapIndicatorOpacity, isColorSimilar, currentColor, palette, holdProgressValue]
  );

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (isScanningRef.current || !cameraEnabled) return;
      if (scanMode !== "tap") return;

      let tapX: number;
      let tapY: number;
      
      if (Platform.OS === "web") {
        const nativeEvent = event.nativeEvent as any;
        tapX = nativeEvent.offsetX ?? nativeEvent.layerX ?? nativeEvent.pageX ?? 0;
        tapY = nativeEvent.offsetY ?? nativeEvent.layerY ?? nativeEvent.pageY ?? 0;
      } else {
        tapX = event.nativeEvent.locationX;
        tapY = event.nativeEvent.locationY;
      }
      
      pressStartRef.current = { x: tapX, y: tapY, time: Date.now() };
      setIsHolding(true);
      setTapPosition({ x: tapX, y: tapY });
      
      holdProgressValue.value = withTiming(1, { duration: LONG_PRESS_DURATION });
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      longPressTimerRef.current = setTimeout(() => {
        if (pressStartRef.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          executeColorDetection(pressStartRef.current.x, pressStartRef.current.y);
        }
      }, LONG_PRESS_DURATION);
    },
    [cameraEnabled, scanMode, executeColorDetection, holdProgressValue, LONG_PRESS_DURATION]
  );

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!pressStartRef.current) return;
      
      let currentX: number;
      let currentY: number;
      
      if (Platform.OS === "web") {
        const nativeEvent = event.nativeEvent as any;
        currentX = nativeEvent.offsetX ?? nativeEvent.layerX ?? nativeEvent.pageX ?? 0;
        currentY = nativeEvent.offsetY ?? nativeEvent.layerY ?? nativeEvent.pageY ?? 0;
      } else {
        currentX = event.nativeEvent.locationX;
        currentY = event.nativeEvent.locationY;
      }
      
      const dx = currentX - pressStartRef.current.x;
      const dy = currentY - pressStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > MOVEMENT_TOLERANCE) {
        cancelLongPress();
      }
    },
    [cancelLongPress, MOVEMENT_TOLERANCE]
  );

  const handleTouchEnd = useCallback(() => {
    const wasHolding = isHolding;
    cancelLongPress();
    
    if (wasHolding && pressStartRef.current === null && !isScanningRef.current) {
    }
  }, [cancelLongPress, isHolding]);

  const handleTapToDetect = useCallback(
    async (event: GestureResponderEvent) => {
      if (isScanningRef.current || !cameraRef.current || !cameraEnabled) return;
      if (scanMode !== "tap") return;

      let tapX: number;
      let tapY: number;
      
      if (Platform.OS === "web") {
        const nativeEvent = event.nativeEvent as any;
        tapX = nativeEvent.offsetX ?? nativeEvent.layerX ?? nativeEvent.pageX ?? 0;
        tapY = nativeEvent.offsetY ?? nativeEvent.layerY ?? nativeEvent.pageY ?? 0;
      } else {
        tapX = event.nativeEvent.locationX;
        tapY = event.nativeEvent.locationY;
      }
      
      setTapPosition({ x: tapX, y: tapY });
      
      tapIndicatorScale.value = 0;
      tapIndicatorOpacity.value = 1;
      tapIndicatorScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );

      isScanningRef.current = true;
      setIsScanning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const samples: Array<{ r: number; g: number; b: number; confidence: number }> = [];
        
        for (let i = 0; i < 3; i++) {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.9,
            base64: true,
            skipProcessing: true,
          });

          if (photo && photo.base64) {
            const rgb = await extractColorAtPosition(
              photo.base64,
              tapX,
              tapY,
              SCREEN_WIDTH,
              SCREEN_HEIGHT
            );
            if (rgb) {
              samples.push(rgb);
            }
          }
          
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        if (samples.length === 0) {
          setCurrentColor({
            name: "Tap again to retry",
            hex: "#EF4444",
            rgb: { r: 239, g: 68, b: 68 },
            hsl: { h: 0, s: 84, l: 60 },
            family: "Red",
          });
          speakColor("Could not detect color, please tap again");
          setTimeout(() => {
            tapIndicatorOpacity.value = withTiming(0, { duration: 300 });
          }, 500);
          isScanningRef.current = false;
          setIsScanning(false);
          return;
        }

        let finalR = 0, finalG = 0, finalB = 0;
        let totalConfidence = 0;
        
        for (const sample of samples) {
          finalR += sample.r * sample.confidence;
          finalG += sample.g * sample.confidence;
          finalB += sample.b * sample.confidence;
          totalConfidence += sample.confidence;
        }
        
        finalR = Math.round(finalR / totalConfidence);
        finalG = Math.round(finalG / totalConfidence);
        finalB = Math.round(finalB / totalConfidence);
        
        const avgConfidence = totalConfidence / samples.length;
        setColorConfidence(Math.round(avgConfidence));

        if (lastDetectedColorRef.current && isColorSimilar({ r: finalR, g: finalG, b: finalB }, lastDetectedColorRef.current)) {
          finalR = lastDetectedColorRef.current.r;
          finalG = lastDetectedColorRef.current.g;
          finalB = lastDetectedColorRef.current.b;
        } else {
          lastDetectedColorRef.current = { r: finalR, g: finalG, b: finalB };
        }

        const colorInfo = getColorFromRgb(finalR, finalG, finalB);

        if (currentColor.name !== "Tap anywhere to detect") {
          setCompareColor(currentColor.hex);
        }
        
        const match = findClosestMatch(colorInfo.rgb, palette);
        if (match && match.confidence !== "different") {
          setPaletteMatch(match);
        } else {
          setPaletteMatch(null);
        }
        
        setCurrentColor(colorInfo);

        colorCardScale.value = withSpring(1.05, { damping: 12, stiffness: 200 });
        setTimeout(() => {
          colorCardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }, 150);

        let speakName = colorInfo.name;
        if (match && match.confidence !== "different") {
          if (match.confidence === "exact") {
            speakName = `This looks like your ${match.color.name}`;
          } else if (match.confidence === "close") {
            speakName = `Close to your ${match.color.name}`;
          } else {
            speakName = `Similar to your ${match.color.name}`;
          }
        }
        speakColor(speakName);
        
        const historyEntry: { 
          hex: string; 
          name: string; 
          family: string; 
          type: "tap";
          paletteMatch?: { name: string; confidence: "exact" | "close" | "similar" } 
        } = {
          hex: colorInfo.hex,
          name: colorInfo.name,
          family: colorInfo.family,
          type: "tap",
        };
        
        if (match && match.confidence !== "different") {
          historyEntry.paletteMatch = {
            name: match.color.name,
            confidence: match.confidence,
          };
        }
        
        await addColorToHistory(historyEntry);

        setTimeout(() => {
          tapIndicatorOpacity.value = withTiming(0, { duration: 300 });
        }, 500);
      } catch (error) {
        console.error("Color detection error:", error);
      } finally {
        isScanningRef.current = false;
        setIsScanning(false);
      }
    },
    [speakColor, colorCardScale, cameraEnabled, tapIndicatorScale, tapIndicatorOpacity, scanMode, isColorSimilar, currentColor, palette]
  );

  const handleCaptureAnalysis = useCallback(async () => {
    if (isScanningRef.current || !cameraRef.current || !cameraEnabled) return;
    if (Platform.OS !== "web") {
      speakColor("Open this app in your web browser for color analysis");
      return;
    }

    isScanningRef.current = true;
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: true,
        skipProcessing: true,
      });

      if (!photo || !photo.base64) {
        speakColor("Could not capture image, please try again");
        isScanningRef.current = false;
        setIsScanning(false);
        return;
      }

      const compositions = await analyzeImageComposition(
        photo.base64,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
      );

      if (compositions.length === 0) {
        speakColor("Could not analyze image, please try again");
        isScanningRef.current = false;
        setIsScanning(false);
        return;
      }

      setCaptureAnalysis(compositions);
      setShowAnalysis(true);

      const dominantColor = compositions[0];
      setCurrentColor({
        name: dominantColor.name,
        hex: dominantColor.hex,
        rgb: dominantColor.rgb,
        hsl: { h: 0, s: 0, l: 0 },
        family: dominantColor.family,
      });

      const colorList = compositions.slice(0, 3).map(c => `${c.percentage}% ${c.name}`).join(", ");
      speakColor(`Image contains: ${colorList}`);

      const historyEntry = {
        hex: dominantColor.hex,
        name: dominantColor.name,
        family: dominantColor.family,
        type: "capture" as const,
        captureData: {
          dominantColors: compositions,
          totalPixelsAnalyzed: 40000,
        },
      };

      await addColorToHistory(historyEntry);

    } catch (error) {
      console.error("Capture analysis error:", error);
      speakColor("Analysis failed, please try again");
    } finally {
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, [cameraEnabled, speakColor]);

  const handleCompare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (compareColor) {
      navigation.navigate("Compare", {
        color1: compareColor,
        color2: currentColor.hex,
      });
      setCompareColor(null);
    } else {
      setCompareColor(currentColor.hex);
    }
  }, [compareColor, currentColor.hex, navigation]);

  const toggleCamera = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCameraEnabled((prev) => !prev);
  }, []);

  const toggleVoice = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    await updateSettings({ voiceFeedbackEnabled: newValue });
  }, [voiceEnabled]);

  const toggleScanMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanMode((prev) => prev === "tap" ? "capture" : "tap");
    setShowAnalysis(false);
    setCaptureAnalysis(null);
  }, []);

  const handleColorCardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ColorDetail", {
      color: currentColor.hex,
      name: paletteMatch ? paletteMatch.color.name : currentColor.name,
      timestamp: Date.now(),
    });
  }, [currentColor, paletteMatch, navigation]);

  const colorCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: colorCardScale.value }],
  }));

  const tapIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapIndicatorScale.value }],
    opacity: tapIndicatorOpacity.value,
  }));

  const textColor = isLightColor(currentColor.hex) ? "#111827" : "#FFFFFF";

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading camera...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    if (permission.status === "denied" && !permission.canAskAgain) {
      return (
        <ThemedView style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <Feather name="camera-off" size={64} color={theme.textSecondary} />
            <ThemedText type="h3" style={styles.permissionTitle}>
              Camera Access Required
            </ThemedText>
            <ThemedText style={styles.permissionText}>
              ColorSense needs camera access to detect and identify colors in
              your environment.
            </ThemedText>
            {Platform.OS !== "web" && (
              <Pressable
                onPress={async () => {
                  try {
                    await Linking.openSettings();
                  } catch {
                  }
                }}
                style={({ pressed }) => [
                  styles.permissionButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Open Settings
                </ThemedText>
              </Pressable>
            )}
          </View>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Feather name="camera" size={64} color={theme.primary} />
          <ThemedText type="h3" style={styles.permissionTitle}>
            Enable Camera
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            ColorSense needs camera access to detect and identify colors around
            you.
          </ThemedText>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
              Allow Camera Access
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {cameraEnabled ? (
        <View 
          style={StyleSheet.absoluteFill} 
          onStartShouldSetResponder={() => scanMode === "tap"}
          onMoveShouldSetResponder={() => scanMode === "tap"}
          onResponderGrant={handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
          onResponderTerminate={handleTouchEnd}
        >
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            autofocus="on"
          />
          
          {scanMode === "tap" && tapPosition && isHolding ? (
            <Animated.View
              style={[
                styles.holdIndicator,
                {
                  left: tapPosition.x - 40,
                  top: tapPosition.y - 40,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.holdIndicatorProgress,
                  { 
                    backgroundColor: theme.primary,
                    transform: [{ scale: holdProgressValue }],
                  },
                ]}
              />
            </Animated.View>
          ) : null}
          
          {scanMode === "tap" && tapPosition && !isHolding ? (
            <Animated.View
              style={[
                styles.tapIndicator,
                {
                  left: tapPosition.x - 30,
                  top: tapPosition.y - 30,
                  borderColor: isScanning ? theme.primary : "#FFFFFF",
                },
                tapIndicatorAnimatedStyle,
              ]}
            >
              <View
                style={[
                  styles.tapIndicatorInner,
                  { backgroundColor: isScanning ? theme.primary : "#FFFFFF" },
                ]}
              />
            </Animated.View>
          ) : null}

          {scanMode === "capture" ? (
            <View style={styles.captureOverlay}>
              <View style={[styles.captureFrame, { borderColor: theme.primary }]}>
                <View style={[styles.captureCorner, styles.topLeft, { borderColor: theme.primary }]} />
                <View style={[styles.captureCorner, styles.topRight, { borderColor: theme.primary }]} />
                <View style={[styles.captureCorner, styles.bottomLeft, { borderColor: theme.primary }]} />
                <View style={[styles.captureCorner, styles.bottomRight, { borderColor: theme.primary }]} />
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraOff]}>
          <Feather name="camera-off" size={64} color="rgba(255,255,255,0.3)" />
          <ThemedText style={styles.cameraOffText}>Camera is off</ThemedText>
          <ThemedText style={styles.cameraOffHint}>
            Tap the camera button to turn it on
          </ThemedText>
        </View>
      )}

      <View style={[styles.overlay, { paddingTop: headerHeight + Spacing.lg }]}>
        {showAnalysis && captureAnalysis ? (
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.analysisContainer}
          >
            <View style={[styles.analysisCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={styles.analysisHeader}>
                <ThemedText type="h4">Color Composition</ThemedText>
                <Pressable onPress={() => { setShowAnalysis(false); setCaptureAnalysis(null); }}>
                  <Feather name="x" size={24} color={theme.text} />
                </Pressable>
              </View>
              <ScrollView style={styles.analysisScroll} showsVerticalScrollIndicator={false}>
                {captureAnalysis.map((color, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate("ColorDetail", {
                        color: color.hex,
                        name: color.name,
                        timestamp: Date.now(),
                      });
                    }}
                    style={styles.compositionRow}
                  >
                    <View style={[styles.compositionSwatch, { backgroundColor: color.hex }]} />
                    <View style={styles.compositionInfo}>
                      <ThemedText type="body" style={styles.compositionName}>{color.name}</ThemedText>
                      <ThemedText type="caption" style={styles.compositionHex}>{color.hex}</ThemedText>
                    </View>
                    <View style={styles.percentageContainer}>
                      <ThemedText type="h4" style={{ color: theme.primary }}>{color.percentage}%</ThemedText>
                      <View style={[styles.percentageBar, { backgroundColor: theme.border }]}>
                        <View 
                          style={[
                            styles.percentageFill, 
                            { 
                              width: `${color.percentage}%`,
                              backgroundColor: color.hex,
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        ) : (
          <AnimatedPressable
            onPress={handleColorCardPress}
            style={[
              styles.colorCard,
              { backgroundColor: currentColor.hex },
              colorCardAnimatedStyle,
            ]}
          >
            {paletteMatch && paletteMatch.confidence !== "different" ? (
              <View style={styles.paletteMatchSection}>
                <ThemedText type="h1" style={[styles.colorName, { color: textColor }]}>
                  {paletteMatch.color.name}
                </ThemedText>
                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor:
                        paletteMatch.confidence === "exact"
                          ? theme.success
                          : paletteMatch.confidence === "close"
                          ? theme.warning
                          : "rgba(128,128,128,0.5)",
                    },
                  ]}
                >
                  <Feather name="check-circle" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.matchBadgeText}>
                    {paletteMatch.confidence === "exact"
                      ? "Exact Match"
                      : paletteMatch.confidence === "close"
                      ? "Close Match"
                      : "Similar"}
                  </ThemedText>
                </View>
              </View>
            ) : (
              <ThemedText type="h1" style={[styles.colorName, { color: textColor }]}>
                {currentColor.name}
              </ThemedText>
            )}
            <ThemedText style={[styles.colorHex, { color: textColor }]}>
              {currentColor.hex}
            </ThemedText>
            <ThemedText
              style={[styles.colorRgb, { color: textColor, opacity: 0.8 }]}
            >
              RGB({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})
            </ThemedText>
            <View style={styles.badgeRow}>
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
                  {currentColor.family}
                </ThemedText>
              </View>
              {colorConfidence < 100 ? (
                <View
                  style={[
                    styles.confidenceBadge,
                    {
                      backgroundColor:
                        colorConfidence >= 80
                          ? theme.success
                          : colorConfidence >= 60
                          ? theme.warning
                          : theme.error,
                    },
                  ]}
                >
                  <Feather name="target" size={10} color="#FFFFFF" />
                  <ThemedText style={styles.confidenceText}>{colorConfidence}%</ThemedText>
                </View>
              ) : null}
              {paletteMatch && paletteMatch.confidence !== "different" ? (
                <View
                  style={[
                    styles.detectedBadge,
                    {
                      backgroundColor:
                        textColor === "#FFFFFF"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.1)",
                    },
                  ]}
                >
                  <ThemedText style={[styles.familyText, { color: textColor }]}>
                    {currentColor.name}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            {isScanning ? (
              <View style={[styles.scanningBadge, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.scanningBadgeText}>
                  {scanMode === "capture" ? "Analyzing..." : "Detecting..."}
                </ThemedText>
              </View>
            ) : null}
          </AnimatedPressable>
        )}

        {cameraEnabled && !showAnalysis ? (
          <View style={styles.hintContainer}>
            <View style={[styles.hintBadge, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
              <Feather name={scanMode === "tap" ? "target" : "camera"} size={16} color="#FFFFFF" />
              <ThemedText style={styles.hintText}>
                {scanMode === "tap" ? "Hold on any spot to detect color" : "Press capture to analyze"}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.modeToggleContainer, { bottom: tabBarHeight + Spacing.xl + 80 }]}>
        <View style={[styles.modeToggle, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Pressable
            onPress={() => { setScanMode("tap"); setShowAnalysis(false); setCaptureAnalysis(null); }}
            style={[
              styles.modeButton,
              scanMode === "tap" && { backgroundColor: theme.primary },
            ]}
          >
            <Feather name="crosshair" size={18} color="#FFFFFF" />
            <ThemedText style={styles.modeButtonText}>Tap</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => { setScanMode("capture"); setShowAnalysis(false); setCaptureAnalysis(null); }}
            style={[
              styles.modeButton,
              scanMode === "capture" && { backgroundColor: theme.primary },
            ]}
          >
            <Feather name="aperture" size={18} color="#FFFFFF" />
            <ThemedText style={styles.modeButtonText}>Capture</ThemedText>
          </Pressable>
        </View>
      </View>

      {scanMode === "capture" ? (
        <View style={[styles.captureButtonContainer, { bottom: tabBarHeight + Spacing.xl }]}>
          <Pressable
            onPress={handleCaptureAnalysis}
            disabled={isScanning || !cameraEnabled}
            style={({ pressed }) => [
              styles.captureButton,
              { 
                backgroundColor: theme.primary,
                opacity: pressed || isScanning ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="camera" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.controlsContainer,
          { bottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <Pressable
          onPress={toggleCamera}
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: cameraEnabled ? "rgba(255,255,255,0.2)" : theme.error, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather
            name={cameraEnabled ? "video" : "video-off"}
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <Pressable
          onPress={toggleVoice}
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: voiceEnabled ? "rgba(255,255,255,0.2)" : theme.error, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather
            name={voiceEnabled ? "volume-2" : "volume-x"}
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        {compareColor ? (
          <Pressable
            onPress={handleCompare}
            style={({ pressed }) => [
              styles.controlButton,
              styles.compareButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="sliders" size={22} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },
  colorCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.floating,
  },
  paletteMatchSection: {
    marginBottom: Spacing.xs,
  },
  colorName: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
  },
  matchBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  colorHex: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  colorRgb: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  familyBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  detectedBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  familyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scanningBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  scanningBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  hintContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  hintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  hintText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  modeToggleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  modeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  captureButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.floating,
  },
  captureOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  captureFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.lg,
    position: "relative",
  },
  captureCorner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.md,
  },
  analysisContainer: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  analysisCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.floating,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  analysisScroll: {
    maxHeight: SCREEN_HEIGHT * 0.35,
  },
  compositionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  compositionSwatch: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  compositionInfo: {
    flex: 1,
  },
  compositionName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  compositionHex: {
    opacity: 0.7,
  },
  percentageContainer: {
    alignItems: "flex-end",
    minWidth: 60,
  },
  percentageBar: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    borderRadius: 2,
  },
  controlsContainer: {
    position: "absolute",
    right: Spacing.xl,
    gap: Spacing.md,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.card,
  },
  compareButton: {
    marginTop: Spacing.sm,
  },
  tapIndicator: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  tapIndicatorInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  holdIndicator: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  holdIndicatorProgress: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["3xl"],
  },
  permissionContent: {
    alignItems: "center",
    gap: Spacing.lg,
    maxWidth: 300,
  },
  permissionTitle: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
  permissionText: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  permissionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  cameraOff: {
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  cameraOffText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
    fontWeight: "600",
  },
  cameraOffHint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
});
