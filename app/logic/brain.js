// app/logic/brain.js

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

export const STATE = {
    visitIdCounter: 0,
    patientIdCounter: 1, 
    
    // UI State
    UI: {
        currentMode: 'CONSULTATION', 
        isStoryOpen: false,          
        isPreviewMode: false         
    },

    currentPreviewCard: null, 
    currentPreviewDoc: null,
    USE_SIG: true,
    exportFilename: '',
    
    // Configuración Base (Se sobrescribe al cargar user.json)
    currentUser: {
        profile: { id: "guest", name: "Invitado" },
        preferences: { default_model: "ORL-001" }, // Fallback
        assets: {}
    }
};

// --- CONFIGURACIÓN ---
export async function loadUserConfig() {
    injectToastStyles(); 
    initWallpaperSystem(); 
    try {
        // En Fase 2, esta ruta vendrá del login. Por ahora hardcodeamos u001.
        const response = await fetch('./app/user/u001/user.json');
        if (response.ok) {
            const config = await response.json();
            // Merge profundo seguro
            STATE.currentUser = { 
                ...STATE.currentUser, 
                ...config,
                preferences: { ...STATE.currentUser.preferences, ...(config.preferences || {}) },
                assets: { ...STATE.currentUser.assets, ...(config.assets || {}) }, 
                profile: { ...STATE.currentUser.profile, ...(config.profile || {}) } 
            };
            console.log(`[Brain] Configuración cargada. Modelo preferido: ${STATE.currentUser.preferences.default_model}`);
        }
    } catch (e) { console.error("[Brain] Error cargando config:", e); }
}

// --- WALLPAPERS ---
const WALLPAPERS = [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop"
];

function initWallpaperSystem() {
    let currentWP = localStorage.getItem('CIMA_WALLPAPER_URL') || WALLPAPERS[0];
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

// --- UTILS ---
let timeoutHandle;
export function flash(msg, isError = false) {
    let el = document.getElementById("err");
    if (!el) { el = document.createElement("div"); el.id = "err"; document.body.appendChild(el); }
    clearTimeout(timeoutHandle);
    el.textContent = msg;
    el.style.borderLeft = isError ? "4px solid #ef4444" : "4px solid #10b981";
    el.style.color = isError ? "#fca5a5" : "#fff";
    el.classList.add('active'); el.style.display = 'block';
    timeoutHandle = setTimeout(() => { el.style.display = 'none'; }, 3000);
}
export function showErr(msg) { console.error(msg); flash(msg, true); }

function injectToastStyles() {
    if (document.getElementById("toast-styles")) return;
    const css = `#err { display: none; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: white; font-size: 0.9rem; z-index: 9999; border: 1px solid rgba(255,255,255,0.1); min-width: 300px; text-align: center; }`;
    const style = document.createElement('style'); style.id = "toast-styles"; style.appendChild(document.createTextNode(css)); document.head.appendChild(style);
}

export function getLocalDateTime() { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); }
export function fmtDate(iso) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
export function fmtDateTime(iso) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }
export function calcAge(str) { if (!str) return ""; const t = new Date(), b = new Date(str); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return a >= 0 ? a : 0; }
