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
    
    // Configuración Base (Esqueleto vacío basado en tu JSON)
    currentUser: {
        profile: {
            id: "guest",
            role: "guest",
            username: "guest",
            title: "Dr(a).",
            firstname: "Usuario",
            lastname: "",
            title_line_1: "",
            contact: {},
            location: ""
        },
        professional: {},
        institution: {},
        preferences: {
            theme: "dark",
            default_model: "ORL-001" // Fallback crítico
        },
        assets: {
            avatar_path: "",
            header_path: "",
            footer_path: ""
        }
    }
};

// --- CONFIGURACIÓN ---
export async function loadUserConfig(configPath) {
    injectToastStyles(); 
    
    // Si no nos pasan path (caso dev), intentamos default
    const path = configPath || './app/user/u001/user.json';

    try {
        const response = await fetch(path);
        if (response.ok) {
            const config = await response.json();
            // Merge profundo
            STATE.currentUser = { ...STATE.currentUser, ...config };
            console.log(`[Brain] Perfil cargado: ${STATE.currentUser.profile.username}`);
            
            // Aplicar preferencias visuales inmediatas
            initWallpaperSystem();
            return true;
        } else {
            throw new Error("Archivo de usuario no encontrado");
        }
    } catch (e) { 
        console.error("[Brain] Error fatal cargando usuario:", e); 
        showErr("Error cargando perfil de usuario.");
        return false;
    }
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

// Utils de Fecha
export function getLocalDateTime() { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); }
export function fmtDate(iso) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
export function fmtDateTime(iso) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }
export function calcAge(str) { if (!str) return ""; const t = new Date(), b = new Date(str); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return a >= 0 ? a : 0; }
