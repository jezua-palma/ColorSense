import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Sparkles, 
  History, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Sliders, 
  Contrast, 
  Copy, 
  Check, 
  HelpCircle,
  TrendingUp,
  Cpu,
  Trash
} from "lucide-react";
import { CameraView } from "./components/CameraView";
import { GlassCard } from "./components/GlassCard";
import { storage, ColorHistoryItem, PaletteColor, AppSettings } from "./utils/storage";
import { 
  getColorInfo, 
  rgbToLab, 
  hexToRgb, 
  getContrastRatio, 
  getColorSimilarity,
  findClosestNamedColors
} from "./utils/colorUtils";
import { trainedColors } from "./utils/trainedColors";

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<"scan" | "sandbox" | "palette" | "settings">("scan");
  const [history, setHistory] = useState<ColorHistoryItem[]>([]);
  const [customPalette, setCustomPalette] = useState<PaletteColor[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(settings.voiceFeedbackEnabled);
  
  // UI states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ColorHistoryItem | null>(null);

  // Sandbox States
  const [sandboxHex, setSandboxHex] = useState<string>("#2563EB");
  const [sandboxAnalysis, setSandboxAnalysis] = useState<any>(null);
  const [sandboxMatches, setSandboxMatches] = useState<any[]>([]);

  // Palette Input States
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#2563EB");

  // Load Initial Storage
  useEffect(() => {
    setHistory(storage.getHistory());
    setCustomPalette(storage.getCustomPalette());
    
    // Apply initial settings styling
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.documentElement.style.setProperty("--scale-text", String(settings.textSize / 100));
  }, []);

  // Sync state settings with LocalStorage
  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storage.saveSettings(updated);

    // Dynamic document properties
    if (updates.theme) {
      document.documentElement.setAttribute("data-theme", updates.theme);
    }
    if (updates.textSize) {
      document.documentElement.style.setProperty("--scale-text", String(updates.textSize / 100));
    }
  };

  // Sync voice toggle with settings
  useEffect(() => {
    updateSettings({ voiceFeedbackEnabled: voiceEnabled });
  }, [voiceEnabled]);

  // Handle color scanned from camera view
  const handleColorScanned = (scannedItem: Omit<ColorHistoryItem, "id" | "timestamp">) => {
    const newItem = storage.addHistoryItem(scannedItem);
    setHistory(storage.getHistory());
  };

  // Run Sandbox Color Match Analysis
  const runSandboxAnalysis = (hex: string) => {
    // Hex validation
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
    
    const rgb = hexToRgb(hex);
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
    const info = getColorInfo(hex, customPalette);
    const matches = findClosestNamedColors(rgb.r, rgb.g, rgb.b, 5);

    setSandboxAnalysis({
      info,
      lab,
      rgb
    });
    setSandboxMatches(matches);
  };

  useEffect(() => {
    runSandboxAnalysis(sandboxHex);
  }, [sandboxHex, customPalette]);

  const handleCopyHex = (hex: string, id: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Accessibility Color-Blind Filter CSS Classes
  const getFilterClass = () => {
    if (settings.activeFilter === "none") return "";
    return `${settings.activeFilter}-filter`;
  };

  return (
    <div className={`app-container ${settings.highContrast ? "high-contrast" : ""} ${getFilterClass()}`}>
      
      {/* Hidden SVGs for Color Blindness Simulation Matrices */}
      <svg style={{ display: "none" }}>
        <defs>
          {/* Protanopia (Red-Blind) */}
          <filter id="protanopia-matrix">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0,     0, 0
                      0.558, 0.442, 0,     0, 0
                      0,     0.242, 0.758, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
          {/* Deuteranopia (Green-Blind) */}
          <filter id="deuteranopia-matrix">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0,   0, 0
                      0.7,   0.3,   0,   0, 0
                      0,     0.3,   0.7, 0, 0
                      0,     0,     0,   1, 0"
            />
          </filter>
          {/* Tritanopia (Blue-Blind) */}
          <filter id="tritanopia-matrix">
            <feColorMatrix
              type="matrix"
              values="0.95,  0.05,  0,     0, 0
                      0,     0.433, 0.567, 0, 0
                      0,     0.475, 0.525, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Main Header */}
      <header className="app-header">
        <div className="app-title-container">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <h1 className="app-title">ColorSense AI</h1>
        </div>
        
        {/* Quick status dots */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {settings.activeFilter !== "none" && (
            <span style={{ 
              fontSize: "0.7rem", 
              backgroundColor: "var(--color-warning)", 
              color: "#000", 
              padding: "2px 6px", 
              borderRadius: "4px",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}>
              Simulating {settings.activeFilter}
            </span>
          )}
          <div style={{ 
            width: "8px", 
            height: "8px", 
            borderRadius: "50%", 
            backgroundColor: "var(--color-success)"
          }} />
        </div>
      </header>

      {/* Scrollable Workspace */}
      <main className="app-content">
        
        {/* ==================== TAB 1: SCAN ==================== */}
        {activeTab === "scan" && (
          <CameraView 
            onColorScanned={handleColorScanned}
            customPalette={customPalette}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            textSize={settings.textSize}
          />
        )}

        {/* ==================== TAB 2: AI CLASSIFIER SANDBOX ==================== */}
        {activeTab === "sandbox" && (
          <div style={{ padding: "16px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "4px" }}>AI Matcher Sandbox</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Our color recognition classifier is trained on <b>{trainedColors.length} unique colors</b>. Enter any hex below to analyze nearest neighbor distances using CIEDE2000!
            </p>

            <div className="glass-card" style={{ margin: "0 0 16px 0", padding: "20px" }}>
              <div className="sandbox-hero">
                <div 
                  className="sandbox-swatch" 
                  style={{ backgroundColor: sandboxHex }}
                />
                
                <div className="hex-input-wrapper">
                  <input 
                    type="text" 
                    className="hex-input"
                    value={sandboxHex}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith("#")) val = "#" + val;
                      setSandboxHex(val);
                      if (/^#[0-9A-F]{6}$/i.test(val)) {
                        runSandboxAnalysis(val);
                      }
                    }}
                    maxLength={7}
                  />
                  <input 
                    type="color" 
                    value={sandboxHex} 
                    onChange={(e) => setSandboxHex(e.target.value)}
                    style={{ 
                      position: "absolute", 
                      right: "10px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      width: "28px",
                      height: "28px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer"
                    }}
                  />
                </div>
              </div>

              {sandboxAnalysis && (
                <div style={{ marginTop: "8px", borderTop: "1px solid var(--surface-glass-border)", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Closest Trained Color:</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-primary-hover)" }}>
                      {sandboxAnalysis.info.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Color Family:</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{sandboxAnalysis.info.family}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>CIE L*a*b* Coordinates:</span>
                    <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                      L: {Math.round(sandboxAnalysis.lab.l)}, a: {Math.round(sandboxAnalysis.lab.a)}, b: {Math.round(sandboxAnalysis.lab.b)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>HSL Values:</span>
                    <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                      H: {sandboxAnalysis.info.hsl.h}°, S: {sandboxAnalysis.info.hsl.s}%, L: {sandboxAnalysis.info.hsl.l}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sandbox Matches Neighbors */}
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-secondary)" }}>
              NEAREST COLOR NEIGHBORS (CIEDE2000 DISTANCE)
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sandboxMatches.map((match, idx) => {
                // Similarity calculation
                const similarity = Math.max(0, 100 - Math.round(match.distance * 2));
                return (
                  <div 
                    key={idx} 
                    className="glass-card" 
                    style={{ 
                      margin: 0, 
                      padding: "10px 14px", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px",
                      borderLeft: idx === 0 ? "4px solid var(--color-primary)" : "1px solid var(--surface-glass-border)"
                    }}
                  >
                    <div 
                      style={{ 
                        width: "36px", 
                        height: "36px", 
                        borderRadius: "8px", 
                        backgroundColor: match.color.hex,
                        border: "1px solid var(--surface-glass-border)"
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: "700" }}>{match.color.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{match.color.hex} • {match.color.family}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: "700", color: idx === 0 ? "var(--color-success)" : "var(--text-primary)" }}>
                        {similarity}% Match
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>ΔE {match.distance.toFixed(1)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PALETTE & HISTORY ==================== */}
        {activeTab === "palette" && (
          <div style={{ padding: "16px" }}>
            
            {/* Custom Palette Creator */}
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "4px" }}>Custom Palette</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Define your own custom labels! If your custom colors are within delta threshold, they take priority over the AI database.
            </p>

            <div className="glass-card" style={{ margin: "0 0 24px 0", padding: "16px" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "10px" }}>Add Custom Preset</p>
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <input 
                  type="text" 
                  placeholder="E.g., My Favorite Shirt" 
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--surface-glass-border)",
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input 
                      type="text" 
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      maxLength={7}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--surface-glass-border)",
                        color: "white",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                    <input 
                      type="color" 
                      value={newColorHex} 
                      onChange={(e) => setNewColorHex(e.target.value)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "20px",
                        height: "20px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer"
                      }}
                    />
                  </div>
                  
                  <button 
                    className="glass-btn primary"
                    style={{ padding: "10px 16px", borderRadius: "8px" }}
                    onClick={() => {
                      if (!newColorName.trim() || !/^#[0-9A-F]{6}$/i.test(newColorHex)) return;
                      const info = getColorInfo(newColorHex);
                      const added = storage.addPaletteColor(newColorName.trim(), newColorHex, info.family);
                      setCustomPalette(storage.getCustomPalette());
                      setNewColorName("");
                    }}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Custom list displays */}
              {customPalette.length > 0 && (
                <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {customPalette.map((color) => (
                    <div 
                      key={color.id} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        background: "var(--surface-active)", 
                        padding: "4px 8px 4px 6px",
                        borderRadius: "6px",
                        border: "1px solid var(--surface-glass-border)",
                        fontSize: "0.75rem"
                      }}
                    >
                      <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: color.hex }} />
                      <span style={{ fontWeight: "600" }}>{color.name}</span>
                      <button 
                        style={{ border: "none", background: "transparent", color: "var(--text-tertiary)", cursor: "pointer" }}
                        onClick={() => {
                          storage.deletePaletteColor(color.id);
                          setCustomPalette(storage.getCustomPalette());
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scan History */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800" }}>Scan History</h2>
              {history.length > 0 && (
                <button 
                  style={{ 
                    border: "none", 
                    background: "transparent", 
                    color: "var(--color-danger)", 
                    fontSize: "0.75rem", 
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                  onClick={() => {
                    storage.clearHistory();
                    setHistory([]);
                  }}
                >
                  <Trash size={12} /> Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="glass-card" style={{ margin: 0, textAlign: "center", padding: "30px 20px" }}>
                <History size={28} style={{ color: "var(--text-tertiary)", marginBottom: "8px" }} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>No scanned colors yet. Go to the Scan tab to scan items!</p>
              </div>
            ) : (
              <div className="colors-grid" style={{ padding: 0, gap: "12px" }}>
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="color-tile"
                    onClick={() => setSelectedHistoryItem(item)}
                  >
                    <div className="color-tile-swatch" style={{ backgroundColor: item.hex }} />
                    <div className="color-tile-info">
                      <p className="color-tile-name">{item.name}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="color-tile-hex">{item.hex}</span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
                          {item.type === "capture" ? "Breakdown" : "Tap"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: SETTINGS & ACCESSIBILITY ==================== */}
        {activeTab === "settings" && (
          <div style={{ padding: "16px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "4px" }}>Preferences</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Configure accessibility simulation, narration audio settings, and display modes.
            </p>

            {/* Profile avatar preset */}
            <div className="glass-card" style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-primary) 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "800"
              }}>
                CS
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700" }}>ColorSense Explorer</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Accessibility Mode Active</p>
              </div>
            </div>

            {/* Accessibility filter matrices selection */}
            <div className="glass-card" style={{ margin: "0 0 16px 0" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Contrast size={16} /> Colorblind Simulation
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {[
                  { id: "none", label: "Normal Vision" },
                  { id: "protanopia", label: "Protanopia (Red)" },
                  { id: "deuteranopia", label: "Deuteranopia (Green)" },
                  { id: "tritanopia", label: "Tritanopia (Blue)" }
                ].map(item => (
                  <button
                    key={item.id}
                    className={`glass-btn ${settings.activeFilter === item.id ? "primary" : ""}`}
                    style={{ padding: "8px 12px", fontSize: "0.8rem", borderRadius: "8px" }}
                    onClick={() => updateSettings({ activeFilter: item.id as any })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "10px", lineHeight: "1.3" }}>
                Applies standard real-time SVG matrix color filters to help understand color deficiencies.
              </p>
            </div>

            {/* Voice options */}
            <div className="glass-card" style={{ margin: "0 0 16px 0" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sliders size={16} /> Audio Speech Feedbacks
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span>Voice Announcements</span>
                  <input 
                    type="checkbox" 
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    style={{ width: "18px", height: "18px" }}
                  />
                </label>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span>Speech Speed ({settings.voiceRate.toFixed(1)}x)</span>
                  </div>
                  <input 
                    type="range" 
                    min={0.5} 
                    max={2.0} 
                    step={0.1}
                    value={settings.voiceRate}
                    onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span>Speech Pitch ({settings.voicePitch.toFixed(1)})</span>
                  </div>
                  <input 
                    type="range" 
                    min={0.5} 
                    max={1.5} 
                    step={0.1}
                    value={settings.voicePitch}
                    onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* Display preferences */}
            <div className="glass-card" style={{ margin: "0 0 16px 0" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "12px" }}>Visual Styles</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span>Dark Mode Theme</span>
                  <input 
                    type="checkbox" 
                    checked={settings.theme === "dark"}
                    onChange={(e) => updateSettings({ theme: e.target.checked ? "dark" : "light" })}
                    style={{ width: "18px", height: "18px" }}
                  />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span>Crisp Contrast Outline</span>
                  <input 
                    type="checkbox" 
                    checked={settings.highContrast}
                    onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                    style={{ width: "18px", height: "18px" }}
                  />
                </label>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span>Text Scale Size ({settings.textSize}%)</span>
                  </div>
                  <input 
                    type="range" 
                    min={80} 
                    max={120} 
                    step={5}
                    value={settings.textSize}
                    onChange={(e) => updateSettings({ textSize: parseInt(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            
            <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
              ColorSense Web SPA • Trained Database v2.1 (1,204 Colors)
            </p>
          </div>
        )}
      </main>

      {/* Detail Overlay Modal */}
      {selectedHistoryItem && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 100
        }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "360px", margin: 0 }}>
            <div 
              style={{ 
                height: "140px", 
                borderRadius: "12px", 
                backgroundColor: selectedHistoryItem.hex,
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
                marginBottom: "16px"
              }} 
            />
            
            <h3 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "4px" }}>{selectedHistoryItem.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
              {selectedHistoryItem.hex} • {selectedHistoryItem.family}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Scan Mode:</span>
                <span style={{ textTransform: "capitalize" }}>{selectedHistoryItem.type} Mode</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Contrast Ratio (on White):</span>
                <span>{getContrastRatio(selectedHistoryItem.hex, "#FFFFFF").toFixed(1)}:1</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Timestamp:</span>
                <span>{new Date(selectedHistoryItem.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                className="glass-btn primary"
                style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "0.85rem" }}
                onClick={() => handleCopyHex(selectedHistoryItem.hex, selectedHistoryItem.id)}
              >
                {copiedId === selectedHistoryItem.id ? (
                  <>
                    <Check size={16} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy Hex
                  </>
                )}
              </button>
              <button 
                className="glass-btn"
                style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "0.85rem" }}
                onClick={() => setSelectedHistoryItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bottom Tab Bar */}
      <nav className="tab-bar">
        <button 
          className={`tab-btn ${activeTab === "scan" ? "active" : ""}`}
          onClick={() => setActiveTab("scan")}
        >
          <Camera size={22} className="tab-icon" />
          <span>Scan</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === "sandbox" ? "active" : ""}`}
          onClick={() => setActiveTab("sandbox")}
        >
          <Cpu size={22} className="tab-icon" />
          <span>Sandbox</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === "palette" ? "active" : ""}`}
          onClick={() => setActiveTab("palette")}
        >
          <History size={22} className="tab-icon" />
          <span>Palette</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <Sliders size={22} className="tab-icon" />
          <span>Settings</span>
        </button>
      </nav>

    </div>
  );
}
