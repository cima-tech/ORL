// app/logic/brain.js

// ==========================================
// 1. DOM UTILS
// ==========================================
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

// ==========================================
// 2. GLOBAL STATE
// ==========================================
export const STATE = {
    visitIdCounter: 0,
    patientIdCounter: 1, 
    
    // --- NEW: UI STATE MANAGEMENT ---
    UI: {
        currentMode: 'CONSULTATION', // Options: 'DASHBOARD', 'CONSULTATION', 'AGENDA'
        isStoryOpen: false,          // True when a patient file is active (New or Opened)
        isPreviewMode: false         // True when viewing a document (Report/Recipe)
    },

    // Legacy UI States
    currentPreviewCard: null, 
    currentPreviewDoc: null,
    currentShareCard: null,
    USE_SIG: true,
    exportFilename: '',
    
    // User Config
    currentUser: {
        profile: {
            id: "u-001",
            name: "Dr. Usuario",
            title_line_1: "Médico Especialista",
            phones: []
        },
        assets: {
            header_path: "./app/user/u001/layout/header.png",
            footer_path: "./app/user/u001/layout/footer.png",
            signature_path: "./app/user/u001/layout/firma.png",
            stamp_path: "./app/user/u001/layout/sello.png"
        }
    }
};

// ==========================================
// 3. WALLPAPER SYSTEM
// ==========================================
const WALLPAPERS = [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=3748&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501854140884-074cf2b21d25?q=80&w=3544&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=2664&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534274988754-0d46e80b3580?q=80&w=3000&auto=format&fit=crop"
];

function initWallpaperSystem() {
    let currentWP = localStorage.getItem('CIMA_WALLPAPER_URL');
    if (!currentWP) {
        const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
        currentWP = WALLPAPERS[randomIndex];
    }
    document.body.style.backgroundImage = `url('${currentWP}')`;
}

export function rotateWallpaper() {
    const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
    const newWP = WALLPAPERS[randomIndex];
    const img = new Image();
    img.src = newWP;
    img.onload = () => {
        document.body.style.backgroundImage = `url('${newWP}')`;
        localStorage.setItem('CIMA_WALLPAPER_URL', newWP);
        flash("Fondo actualizado", false);
    };
}

// ==========================================
// 4. CONFIG LOADER
// ==========================================
export async function loadUserConfig() {
    injectToastStyles();
    initWallpaperSystem();

    try {
        const response = await fetch('./app/user/u001/user.json');
        if (response.ok) {
            const config = await response.json();
            STATE.currentUser = { 
                ...STATE.currentUser, 
                ...config,
                assets: { ...STATE.currentUser.assets, ...(config.assets || {}) },
                profile: { ...STATE.currentUser.profile, ...(config.profile || {}) }
            };
            console.log("Config cargada.");
            // UI Update is handled by toolbar render
        } else {
            console.warn("User defaults.");
        }
    } catch (e) {
        console.error("Error config:", e);
    }
}

// ==========================================
// 5. TOAST & UTILS
// ==========================================
let timeoutHandle;

export function flash(msg, isError = false) {
    let el = document.getElementById("err");
    if (!el) { el = document.createElement("div"); el.id = "err"; document.body.appendChild(el); }
    
    clearTimeout(timeoutHandle);
    
    el.textContent = msg;
    el.style.borderLeft = isError ? "4px solid #ef4444" : "4px solid #10b981";
    el.style.color = isError ? "#fca5a5" : "#fff";
    
    el.classList.add('active');
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, 0)';

    timeoutHandle = setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => { el.style.display = 'none'; }, 300);
    }, 3000);
}

export function showErr(msg) { console.error(msg); flash(msg, true); }

function injectToastStyles() {
    const styleId = "toast-styles";
    if (document.getElementById(styleId)) return;
    const css = `#err { display: none; position: fixed; top: 20px; left: 50%; transform: translate(-50%, -20px); background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: white; font-size: 0.9rem; z-index: 9999; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); border: 1px solid rgba(255,255,255,0.1); min-width: 300px; text-align: center; }`;
    const style = document.createElement('style'); style.id = styleId; style.appendChild(document.createTextNode(css)); document.head.appendChild(style);
}

// ==========================================
// 6. DATES
// ==========================================
export function getLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export function fmtDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    return date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    return date.toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export function calcAge(dateString) {
    if (!dateString) return "";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? age : 0;
}
