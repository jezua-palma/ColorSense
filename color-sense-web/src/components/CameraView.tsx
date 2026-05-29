import React, { useRef, useState, useEffect } from "react";
import { Camera, Volume2, VolumeX, Eye, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { getColorFromRgb, rgbToLab, deltaE2000, kMeansClustering, LabColor, hexToRgb } from "../utils/colorUtils";
import { storage, ColorHistoryItem, PaletteColor } from "../utils/storage";

interface CameraViewProps {
  onColorScanned: (item: Omit<ColorHistoryItem, "id" | "timestamp">) => void;
  customPalette: PaletteColor[];
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  textSize: number;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onColorScanned,
  customPalette,
  voiceEnabled,
  setVoiceEnabled,
  textSize
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied" | "demo">("prompt");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const [scanMode, setScanMode] = useState<"tap" | "capture">("tap");
  const [scannedColor, setScannedColor] = useState<{
    name: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
    family: string;
    distance?: number;
  } | null>(null);

  const [captureBreakdown, setCaptureBreakdown] = useState<{
    hex: string;
    name: string;
    percentage: number;
  }[]>([]);

  // Ripple effect on tap
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraPermission("granted");
      setErrorMessage("");
    } catch (err: any) {
      console.warn("Camera access failed, falling back to Demo Mode:", err.message);
      setCameraPermission("demo");
      setErrorMessage("No camera found or permission denied. Running in interactive simulator mode!");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Cancel active speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const settings = storage.getSettings();
    utterance.rate = settings.voiceRate;
    utterance.pitch = settings.voicePitch;
    window.speechSynthesis.speak(utterance);
  };

  // Perform single color detection at relative coordinates
  const detectColorAtCoords = (clientX: number, clientY: number, element: HTMLVideoElement | HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;

    // Trigger visual ripple animation
    setRipple({ x: clientX - rect.left, y: clientY - rect.top });
    setTimeout(() => setRipple(null), 500);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let r = 0, g = 0, b = 0;

    if (cameraPermission === "granted" && videoRef.current) {
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const targetX = Math.floor(xRatio * canvas.width);
      const targetY = Math.floor(yRatio * canvas.height);

      // Perform a robust Gaussian-weighted sample in a 20px radius to resist sensor noise
      const radius = 10;
      const sigma = 5;
      let totalWeight = 0;
      let rSum = 0, gSum = 0, bSum = 0;

      try {
        const imgData = ctx.getImageData(
          Math.max(0, targetX - radius),
          Math.max(0, targetY - radius),
          radius * 2,
          radius * 2
        );

        for (let dy = -radius; dy < radius; dy++) {
          for (let dx = -radius; dx < radius; dx++) {
            const pxX = targetX + dx;
            const pxY = targetY + dy;
            if (pxX < 0 || pxX >= canvas.width || pxY < 0 || pxY >= canvas.height) continue;

            const localX = dx + radius;
            const localY = dy + radius;
            const idx = (localY * radius * 2 + localX) * 4;

            const weight = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            rSum += imgData.data[idx] * weight;
            gSum += imgData.data[idx + 1] * weight;
            bSum += imgData.data[idx + 2] * weight;
            totalWeight += weight;
          }
        }

        r = Math.round(rSum / totalWeight);
        g = Math.round(gSum / totalWeight);
        b = Math.round(bSum / totalWeight);
      } catch {
        // Fallback if coordinates are out of bounds
        r = 120; g = 120; b = 120;
      }
    } else {
      // Demo Mode: Mock vibrant color based on position
      const h = Math.round(xRatio * 360);
      const s = 80;
      const l = Math.round(yRatio * 50) + 25; // 25% to 75%
      
      // Convert HSL to RGB
      const sNorm = s / 100;
      const lNorm = l / 100;
      const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const mVal = lNorm - c / 2;
      
      let rP = 0, gP = 0, bP = 0;
      if (h < 60) { rP = c; gP = x; }
      else if (h < 120) { rP = x; gP = c; }
      else if (h < 180) { gP = c; bP = x; }
      else if (h < 240) { gP = x; bP = c; }
      else if (h < 300) { rP = x; bP = c; }
      else { rP = c; bP = x; }
      
      r = Math.round((rP + mVal) * 255);
      g = Math.round((gP + mVal) * 255);
      b = Math.round((bP + mVal) * 255);
    }

    const matched = getColorFromRgb(r, g, b, customPalette);
    setScannedColor(matched);

    // Save to history
    onColorScanned({
      hex: matched.hex,
      name: matched.name,
      family: matched.family,
      type: "tap",
      confidence: matched.distance ? Math.max(0, 100 - (matched.distance * 2)) : 95
    });

    speakText(matched.name);
  };

  // Perform Capture Dominant Colors breakdown (Lab-space K-means Clustering)
  const captureDominantColors = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let canvasWidth = 320;
    let canvasHeight = 240;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (cameraPermission === "granted" && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvasWidth, canvasHeight);
    } else {
      // Demo Mode background: Fill with multi-color vibrant gradient
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, "#FF0000");
      grad.addColorStop(0.3, "#00FF00");
      grad.addColorStop(0.6, "#0000FF");
      grad.addColorStop(1, "#FFFF00");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Downsample and extract center 65% area pixels
    const startX = Math.floor(canvasWidth * 0.175);
    const startY = Math.floor(canvasHeight * 0.175);
    const width = Math.floor(canvasWidth * 0.65);
    const height = Math.floor(canvasHeight * 0.65);

    try {
      const imgData = ctx.getImageData(startX, startY, width, height);
      const data = imgData.data;

      // Select every 4th pixel for faster processing
      const labPixels: LabColor[] = [];
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const bVal = data[i + 2];
        const lab = rgbToLab(r, g, bVal);
        labPixels.push({
          l: lab.l,
          a: lab.a,
          b: lab.b,
          r,
          g,
          bVal
        });
      }

      // Run K-means Clustering (k=8, iterations=20)
      const clusters = kMeansClustering(labPixels, 8, 20);

      // Map clusters to final percentages and color names
      const totalPixels = labPixels.length;
      let composition = clusters
        .map(cluster => {
          const count = cluster.length;
          const percentage = Math.round((count / totalPixels) * 100);

          // Get cluster average RGB
          const avgR = Math.round(cluster.reduce((sum, p) => sum + p.r, 0) / count);
          const avgG = Math.round(cluster.reduce((sum, p) => sum + p.g, 0) / count);
          const avgB = Math.round(cluster.reduce((sum, p) => sum + p.bVal, 0) / count);

          const matched = getColorFromRgb(avgR, avgG, avgB, customPalette);

          return {
            hex: matched.hex,
            name: matched.name,
            percentage,
            family: matched.family
          };
        })
        .filter(c => c.percentage > 4) // Filter small noise
        .sort((a, b) => b.percentage - a.percentage); // Sort highest percentage first

      // De-duplicate near identical matches
      const uniqueComp: typeof composition = [];
      for (const comp of composition) {
        const existing = uniqueComp.find(u => u.name === comp.name);
        if (existing) {
          existing.percentage += comp.percentage;
        } else {
          uniqueComp.push(comp);
        }
      }
      uniqueComp.sort((a, b) => b.percentage - a.percentage);

      setCaptureBreakdown(uniqueComp);

      if (uniqueComp.length > 0) {
        // Highlight top dominant color
        const top = uniqueComp[0];
        setScannedColor({
          name: top.name,
          hex: top.hex,
          rgb: hexToRgb(top.hex),
          family: top.family
        });

        // Save capture history
        onColorScanned({
          hex: top.hex,
          name: top.name,
          family: top.family,
          type: "capture",
          dominantColors: uniqueComp.map(c => ({ hex: c.hex, name: c.name, percentage: c.percentage })),
          confidence: 100
        });

        // TTS Readout
        const announceText = `Analysis complete. Image contains: ${uniqueComp.slice(0, 3).map(c => `${c.percentage}% ${c.name}`).join(", ")}`;
        speakText(announceText);
      }
    } catch (e) {
      console.error("Dominant color capture error:", e);
    }
  };

  const activeThemeSettings = storage.getSettings();

  return (
    <div style={{ padding: "0 0 var(--spacing-lg) 0" }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Mode Switches */}
      <div style={{ display: "flex", gap: "12px", padding: "16px 20px 8px 20px" }}>
        <button
          className={`glass-btn ${scanMode === "tap" ? "primary" : ""}`}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "12px", fontSize: "0.85rem" }}
          onClick={() => {
            setScanMode("tap");
            setScannedColor(null);
            setCaptureBreakdown([]);
          }}
        >
          <Eye size={16} /> Tap Mode
        </button>
        <button
          className={`glass-btn ${scanMode === "capture" ? "primary" : ""}`}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "12px", fontSize: "0.85rem" }}
          onClick={() => {
            setScanMode("capture");
            setScannedColor(null);
            setCaptureBreakdown([]);
          }}
        >
          <Sparkles size={16} /> Capture Mode
        </button>
      </div>

      {/* Camera Stream/Demo Frame Container */}
      <div className="camera-wrapper">
        {cameraPermission === "granted" ? (
          <video
            ref={videoRef}
            className="camera-preview"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div 
            className="camera-preview" 
            style={{ 
              background: "linear-gradient(45deg, #131722 0%, #1e2538 100%)",
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              padding: "24px",
              textAlign: "center"
            }}
          >
            <AlertCircle size={44} color="var(--color-primary)" style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "8px" }}>CAM INTERACTIVE SIMULATOR</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "280px" }}>
              {errorMessage || "Point and click inside the viewfinder grid below to simulate custom colors!"}
            </p>
            <div style={{
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              width: "100%",
              maxWidth: "240px"
            }}>
              {["#D0312D", "#FC6A03", "#FDFF00", "#028A0F", "#1338BE", "#8F00FF", "#FF1694", "#FFFFFF"].map(demoHex => (
                <button
                  key={demoHex}
                  style={{
                    backgroundColor: demoHex,
                    height: "36px",
                    borderRadius: "8px",
                    border: "2px solid rgba(255,255,255,0.25)",
                    cursor: "pointer"
                  }}
                  onClick={(e) => {
                    const matched = getColorFromRgb(
                      ...Object.values(hexToRgb(demoHex)) as [number, number, number],
                      customPalette
                    );
                    setScannedColor(matched);
                    onColorScanned({
                      hex: matched.hex,
                      name: matched.name,
                      family: matched.family,
                      type: "tap",
                      confidence: 100
                    });
                    speakText(matched.name);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic target reticle overlay (Only visible in Tap Mode) */}
        {scanMode === "tap" && <div className="camera-reticle" />}

        {/* Active scan filter matrices overlays */}
        <div 
          className="camera-tap-area"
          onClick={(e) => {
            if (scanMode === "tap") {
              detectColorAtCoords(e.clientX, e.clientY, e.currentTarget);
            }
          }}
        >
          {ripple && (
            <div 
              className="ring-pulse-animation" 
              style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }} 
            />
          )}
        </div>
      </div>

      {/* Floating Info & Actions */}
      <div style={{ padding: "0 20px" }}>
        
        {/* Scanned Result display */}
        {scannedColor && (
          <div className="glass-card" style={{ marginTop: "16px", padding: "16px" }}>
            <div className="color-result-container">
              <div 
                className="color-swatch-large" 
                style={{ backgroundColor: scannedColor.hex }}
              />
              <div className="color-info-details">
                <p className="color-name-display" style={{ fontSize: `${1.4 * (textSize / 100)}rem` }}>
                  {scannedColor.name}
                </p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="color-hex-tag">{scannedColor.hex}</span>
                  <span className="color-family-badge">{scannedColor.family}</span>
                </div>
                {scannedColor.distance !== undefined && (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                    Perceptual distance: ΔE {scannedColor.distance} (Very close accuracy)
                  </p>
                )}
              </div>
              <button 
                className="action-circle-btn"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Mute audio readout" : "Enable audio readout"}
              >
                {voiceEnabled ? <Volume2 size={20} color="var(--color-primary)" /> : <VolumeX size={20} />}
              </button>
            </div>
            
            {/* Capture composition bars */}
            {scanMode === "capture" && captureBreakdown.length > 0 && (
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--surface-glass-border)", paddingTop: "16px" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-secondary)" }}>
                  DOMINANT COLORS COMPOSITION
                </p>
                {captureBreakdown.map((item, idx) => (
                  <div key={idx} className="dominant-bar-wrapper">
                    <div className="dominant-bar-label">
                      <span>{item.name}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="dominant-bar-container">
                      <div 
                        className="dominant-bar-fill" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.hex }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Capture Buttons */}
        {scanMode === "capture" && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button 
              className="glass-btn primary"
              style={{ width: "100%", maxWidth: "280px", gap: "10px", padding: "14px" }}
              onClick={captureDominantColors}
            >
              <Camera size={20} /> Analyze Color Composition
            </button>
          </div>
        )}

        {scanMode === "tap" && !scannedColor && (
          <div className="glass-card" style={{ marginTop: "16px", textAlign: "center", padding: "20px" }}>
            <Eye size={24} style={{ color: "var(--text-tertiary)", marginBottom: "8px" }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Tap anywhere inside the viewfinder grid above to detect color and hear pronunciation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
