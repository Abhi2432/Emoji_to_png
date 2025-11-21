// Text -> PNG Generator logic

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("textInput");
const btn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadLink = document.getElementById("downloadLink");

const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeValue = document.getElementById("fontSizeValue");
const glowColorInput = document.getElementById("glowColor");
const glowIntensitySlider = document.getElementById("glowIntensitySlider");
const glowIntensityValue = document.getElementById("glowIntensityValue");

const posXSlider = document.getElementById("posXSlider");
const posXValue = document.getElementById("posXValue");
const posYSlider = document.getElementById("posYSlider");
const posYValue = document.getElementById("posYValue");

const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.querySelector(".theme-label");
const toast = document.getElementById("toast");

const autoGlowToggle = document.getElementById("autoGlowToggle");
const autoStyleToggle = document.getElementById("autoStyleToggle");
const watermarkToggle = document.getElementById("watermarkToggle");

const bgImageInput = document.getElementById("bgImageInput");
const bgImageBtn = document.getElementById("bgImageBtn");
const bgImageName = document.getElementById("bgImageName");

/* custom size modal elements */
const sizeBtn = document.getElementById("canvasSizeBtn");
const sizeModal = document.getElementById("sizeModal");
const closeSizeModal = document.getElementById("closeSizeModal");
const sizeOptions = document.querySelectorAll(".size-option");
const sizeLabel = document.getElementById("canvasSizeLabel");

let bgImage = null;

const STORAGE_KEYS = {
  fontSize: "tp_fontSize",
  glowColor: "tp_glowColor",
  glowIntensity: "tp_glowIntensity",
  theme: "tp_theme",
  posX: "tp_posX",
  posY: "tp_posY",
  autoGlow: "tp_autoGlow",
  autoStyle: "tp_autoStyle",
  watermark: "tp_watermark",
  canvasW: "tp_canvasW",
  canvasH: "tp_canvasH",
  lastText: "tp_lastText"
};

let state = {
  fontSize: 64,
  glowColor: "#000000",
  glowIntensity: 10,
  theme: "dark",
  posX: 50,
  posY: 50,
  autoGlow: false,
  autoStyle: false,
  watermark: true,
  canvasW: 800,
  canvasH: 400,
  lastText: ""
};

function loadState() {
  try {
    const fs = localStorage.getItem(STORAGE_KEYS.fontSize);
    const gc = localStorage.getItem(STORAGE_KEYS.glowColor);
    const gi = localStorage.getItem(STORAGE_KEYS.glowIntensity);
    const th = localStorage.getItem(STORAGE_KEYS.theme);
    const px = localStorage.getItem(STORAGE_KEYS.posX);
    const py = localStorage.getItem(STORAGE_KEYS.posY);
    const ag = localStorage.getItem(STORAGE_KEYS.autoGlow);
    const as = localStorage.getItem(STORAGE_KEYS.autoStyle);
    const wm = localStorage.getItem(STORAGE_KEYS.watermark);
    const cw = localStorage.getItem(STORAGE_KEYS.canvasW);
    const ch = localStorage.getItem(STORAGE_KEYS.canvasH);
    const lt = localStorage.getItem(STORAGE_KEYS.lastText);

    if (fs) state.fontSize = parseInt(fs, 10) || state.fontSize;
    if (gc) state.glowColor = gc;
    if (gi) state.glowIntensity = parseInt(gi, 10) || state.glowIntensity;
    if (th === "light" || th === "dark") state.theme = th;
    if (px) state.posX = parseInt(px, 10) || state.posX;
    if (py) state.posY = parseInt(py, 10) || state.posY;
    if (ag === "true" || ag === "false") state.autoGlow = ag === "true";
    if (as === "true" || as === "false") state.autoStyle = as === "true";
    if (wm === "true" || wm === "false") state.watermark = wm === "true";
    if (cw) state.canvasW = parseInt(cw, 10) || state.canvasW;
    if (ch) state.canvasH = parseInt(ch, 10) || state.canvasH;
    if (lt) state.lastText = lt;
  } catch (e) {
    console.warn("localStorage read error", e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.fontSize, String(state.fontSize));
    localStorage.setItem(STORAGE_KEYS.glowColor, state.glowColor);
    localStorage.setItem(STORAGE_KEYS.glowIntensity, String(state.glowIntensity));
    localStorage.setItem(STORAGE_KEYS.theme, state.theme);
    localStorage.setItem(STORAGE_KEYS.posX, String(state.posX));
    localStorage.setItem(STORAGE_KEYS.posY, String(state.posY));
    localStorage.setItem(STORAGE_KEYS.autoGlow, String(state.autoGlow));
    localStorage.setItem(STORAGE_KEYS.autoStyle, String(state.autoStyle));
    localStorage.setItem(STORAGE_KEYS.watermark, String(state.watermark));
    localStorage.setItem(STORAGE_KEYS.canvasW, String(state.canvasW));
    localStorage.setItem(STORAGE_KEYS.canvasH, String(state.canvasH));
    localStorage.setItem(STORAGE_KEYS.lastText, state.lastText);
  } catch (e) {
    console.warn("localStorage write error", e);
  }
}

function setTheme(theme, save = true) {
  state.theme = theme;
  document.body.setAttribute("data-theme", theme);
  if (themeLabel) themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
  if (save) saveState();
}

/* helper: decide which size option matches current canvas */
function sizeValueFromWH(w, h) {
  if (w === 800 && h === 400) return "800x400";
  if (w === 1080 && h === 1080) return "1080x1080";
  if (w === 1080 && h === 1920) return "1080x1920";
  if (w === 1280 && h === 720) return "1280x720";
  return "custom";
}

function updateSizeLabelAndSelection() {
  if (!sizeLabel || !sizeOptions) return;
  const val = sizeValueFromWH(state.canvasW, state.canvasH);

  let selectedOpt = null;
  sizeOptions.forEach((o) => {
    if (o.dataset.value === val) {
      o.classList.add("selected");
      selectedOpt = o;
    } else {
      o.classList.remove("selected");
    }
  });

  if (selectedOpt) {
    sizeLabel.textContent = selectedOpt.textContent.trim();
  } else {
    sizeLabel.textContent = `Custom (${state.canvasW}×${state.canvasH})`;
  }
}

function syncControls() {
  fontSizeSlider.value = state.fontSize;
  fontSizeValue.textContent = state.fontSize + "px";

  glowColorInput.value = state.glowColor;
  glowIntensitySlider.value = state.glowIntensity;
  glowIntensityValue.textContent = state.glowIntensity;

  posXSlider.value = state.posX;
  posXValue.textContent = state.posX + "%";
  posYSlider.value = state.posY;
  posYValue.textContent = state.posY + "%";

  autoGlowToggle.checked = state.autoGlow;
  autoStyleToggle.checked = state.autoStyle;
  watermarkToggle.checked = state.watermark;

  canvas.width = state.canvasW;
  canvas.height = state.canvasH;

  updateSizeLabelAndSelection();

  setTheme(state.theme, false);

  if (state.lastText && input.value.trim() === "") {
    input.value = state.lastText;
  }
}

function showToast() {
  if (!toast) return;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function detectMood(text) {
  const t = text.toLowerCase();
  if (/❤️|❤|love|pyar|pyaar/.test(t)) return "love";
  if (/💔|sad|dard|breakup|dukhi|😢|😭/.test(t)) return "sad";
  if (/🔥|angry|gussa|😡/.test(t)) return "angry";
  if (/hope|dream|motivation|motivational|umeed|🚀|✨|⭐/.test(t)) return "motivation";
  if (/😈|dark|alone|shadow/.test(t)) return "dark";
  return "neutral";
}

function applyAutoGlow(text) {
  const mood = detectMood(text);
  let color = "#000000";
  let intensity = 10;
  switch (mood) {
    case "love":
      color = "#ff1f6f";
      intensity = 18;
      break;
    case "sad":
      color = "#2563eb";
      intensity = 14;
      break;
    case "angry":
      color = "#ef4444";
      intensity = 20;
      break;
    case "motivation":
      color = "#facc15";
      intensity = 16;
      break;
    case "dark":
      color = "#a855f7";
      intensity = 22;
      break;
    default:
      color = "#000000";
      intensity = 10;
  }
  state.glowColor = color;
  state.glowIntensity = intensity;
  glowColorInput.value = color;
  glowIntensitySlider.value = intensity;
  glowIntensityValue.textContent = intensity;
  saveState();
}

function applyAutoStyle(text) {
  const mood = detectMood(text);
  switch (mood) {
    case "love":
      state.fontSize = 80;
      setTheme("dark");
      break;
    case "sad":
      state.fontSize = 70;
      setTheme("dark");
      break;
    case "angry":
      state.fontSize = 90;
      setTheme("dark");
      break;
    case "motivation":
      state.fontSize = 84;
      setTheme("light");
      break;
    case "dark":
      state.fontSize = 76;
      setTheme("dark");
      break;
    default:
      state.fontSize = 64;
  }
  fontSizeSlider.value = state.fontSize;
  fontSizeValue.textContent = state.fontSize + "px";
  saveState();
}

function drawText() {
  const txt = input.value || " ";

  state.lastText = input.value || "";
  saveState();

  if (state.autoStyle) applyAutoStyle(txt);
  if (state.autoGlow) applyAutoGlow(txt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgImage) {
    ctx.save();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  ctx.shadowColor = state.glowColor;
  ctx.shadowBlur = state.glowIntensity;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const textColor = state.theme === "dark" ? "#f9fafb" : "#0f172a";

  ctx.fillStyle = textColor;
  ctx.font = state.fontSize + "px MyFont";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = (state.posX / 100) * canvas.width;
  const y = (state.posY / 100) * canvas.height;

  ctx.fillText(txt, x, y);

  ctx.shadowBlur = 0;

  if (state.watermark) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = state.theme === "dark" ? "#f9fafb" : "#0f172a";
    ctx.font = "20px MyFont";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("@writer_lost_abhi", canvas.width - 12, canvas.height - 8);
    ctx.restore();
  }
}

function buildFilename() {
  const raw = (input.value || "text").trim();
  let base = raw
    .replace(/\s+/g, "_")
    .replace(/[^\w\-]+/g, "")
    .toLowerCase();
  if (!base) base = "text";
  if (base.length > 24) base = base.slice(0, 24);

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${base}_${yyyy}-${mm}-${dd}.png`;
}

function initAfterFont() {
  loadState();
  syncControls();
  drawText();
}

/* FONT LOAD */
if (document.fonts && document.fonts.load) {
  document.fonts
    .load("64px MyFont")
    .then(() => initAfterFont())
    .catch(() => initAfterFont());
} else {
  window.onload = initAfterFont;
}

/* LISTENERS */
input.addEventListener("input", () => drawText());

fontSizeSlider.addEventListener("input", () => {
  state.fontSize = parseInt(fontSizeSlider.value, 10);
  fontSizeValue.textContent = state.fontSize + "px";
  saveState();
  drawText();
});

glowColorInput.addEventListener("input", () => {
  state.glowColor = glowColorInput.value;
  saveState();
  drawText();
});

glowIntensitySlider.addEventListener("input", () => {
  state.glowIntensity = parseInt(glowIntensitySlider.value, 10);
  glowIntensityValue.textContent = state.glowIntensity;
  saveState();
  drawText();
});

posXSlider.addEventListener("input", () => {
  state.posX = parseInt(posXSlider.value, 10);
  posXValue.textContent = state.posX + "%";
  saveState();
  drawText();
});

posYSlider.addEventListener("input", () => {
  state.posY = parseInt(posYSlider.value, 10);
  posYValue.textContent = state.posY + "%";
  saveState();
  drawText();
});

/* Download */
btn.addEventListener("click", () => {
  drawText();
  const dataURL = canvas.toDataURL("image/png");
  downloadLink.href = dataURL;
  downloadLink.download = buildFilename();
  downloadLink.click();
  showToast();
});

/* Clear */
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    input.value = "";
    drawText();
  });
}

/* Theme toggle */
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    setTheme(newTheme, true);
    drawText();
  });
}

/* Toggles */
autoGlowToggle.addEventListener("change", () => {
  state.autoGlow = autoGlowToggle.checked;
  saveState();
  drawText();
});

autoStyleToggle.addEventListener("change", () => {
  state.autoStyle = autoStyleToggle.checked;
  saveState();
  drawText();
});

watermarkToggle.addEventListener("change", () => {
  state.watermark = watermarkToggle.checked;
  saveState();
  drawText();
});

/* Background image */
bgImageBtn.addEventListener("click", () => bgImageInput.click());

bgImageInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) {
    bgImage = null;
    if (bgImageName) bgImageName.textContent = "No image selected";
    drawText();
    return;
  }
  if (bgImageName) bgImageName.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      bgImage = img;
      drawText();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

/* ----- Canvas size custom modal ----- */
if (sizeBtn && sizeModal && closeSizeModal) {
  sizeBtn.addEventListener("click", () => {
    sizeModal.classList.remove("hidden");
  });

  closeSizeModal.addEventListener("click", () => {
    sizeModal.classList.add("hidden");
  });

  sizeOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      const val = opt.dataset.value;

      sizeOptions.forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");

      let w = state.canvasW;
      let h = state.canvasH;

      if (val === "800x400") {
        w = 800;
        h = 400;
      } else if (val === "1080x1080") {
        w = 1080;
        h = 1080;
      } else if (val === "1080x1920") {
        w = 1080;
        h = 1920;
      } else if (val === "1280x720") {
        w = 1280;
        h = 720;
      } // custom -> keep same

      state.canvasW = w;
      state.canvasH = h;
      canvas.width = w;
      canvas.height = h;

      saveState();
      updateSizeLabelAndSelection();
      drawText();
      sizeModal.classList.add("hidden");
    });
  });
}

/* ----- Drag + pinch zoom on canvas ----- */
let isDragging = false;
let dragPointerId = null;
let zoom = 1;
let baseZoom = 1;
let startPinchDistance = null;
const activePointers = new Map();

function updateTextPositionFromPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();

  const relX = (clientX - rect.left) / rect.width;
  const relY = (clientY - rect.top) / rect.height;

  const px = Math.round(Math.min(1, Math.max(0, relX)) * 100);
  const py = Math.round(Math.min(1, Math.max(0, relY)) * 100);

  state.posX = px;
  state.posY = py;

  posXSlider.value = state.posX;
  posYSlider.value = state.posY;
  posXValue.textContent = state.posX + "%";
  posYValue.textContent = state.posY + "%";

  saveState();
  drawText();
}

function pointersDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 1) {
    isDragging = true;
    dragPointerId = e.pointerId;
    updateTextPositionFromPoint(e.clientX, e.clientY);
  } else if (activePointers.size === 2) {
    const [p1, p2] = [...activePointers.values()];
    startPinchDistance = pointersDistance(p1, p2);
    baseZoom = zoom;
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!activePointers.has(e.pointerId)) return;

  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (isDragging && dragPointerId === e.pointerId && activePointers.size === 1) {
    updateTextPositionFromPoint(e.clientX, e.clientY);
  }

  if (activePointers.size === 2 && startPinchDistance) {
    const [p1, p2] = [...activePointers.values()];
    const newDist = pointersDistance(p1, p2);
    if (newDist > 0) {
      const factor = newDist / startPinchDistance;
      zoom = Math.min(2.5, Math.max(0.8, baseZoom * factor));
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = "center center";
    }
  }
});

function endPointer(e) {
  activePointers.delete(e.pointerId);

  if (dragPointerId === e.pointerId) {
    isDragging = false;
    dragPointerId = null;
  }

  if (activePointers.size < 2) {
    startPinchDistance = null;
    baseZoom = zoom;
  }
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);
canvas.addEventListener("pointerleave", endPointer);
