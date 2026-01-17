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
    
    // Configuración Base (Esqueleto ROBUSTO para evitar 'undefined')
    currentUser: {
        profile: {
            id: "guest",
            role: "guest",
            username: "guest",
            title: "",
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
    // Si no nos pasan path (caso dev), usamos el default
    const path = configPath || './app/user/u001/user.json';

    try {
        const response = await fetch(path);
        if (response.ok) {
            const config = await response.json();
            // Merge profundo para no borrar keys del state base
            STATE.currentUser = { ...STATE.currentUser, ...config };
            
            // Log al nuevo Drawer
            log(`[Brain] Perfil cargado: ${STATE.currentUser.profile.username}`);
            
            // Aplicar preferencias visuales inmediatas
            initWallpaperSystem();
            return true;
        } else {
            throw new Error("Archivo de usuario no encontrado");
        }
    } catch (e) { 
        console.error("[Brain] Error fatal cargando usuario:", e); 
        log("Error cargando perfil de usuario.", true);
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
        log("Fondo actualizado");
    };
}

// --- SISTEMA DE LOGS (CONSOLE DRAWER) ---
// Reemplaza al sistema de "Toast" anterior
export function log(msg, isError = false) {
    console.log(msg); // Mantener salida en devtools por si acaso
    
    const drawer = document.getElementById('consoleContent');
    if (!drawer) return; // Si el DOM no está listo aún
    
    const time = new Date().toLocaleTimeString();
    const color = isError ? '#ef4444' : '#33ff00'; // Rojo o Verde Hacker
    
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = `<span class="console-ts">[${time}]</span> <span style="color:${color}">${msg}</span>`;
    
    // Insertar al principio (lo más nuevo arriba)
    drawer.prepend(line); 
}

export function showErr(msg) { 
    log(msg, true); 
    // Opcional: alert(msg) si es algo catastrófico que detiene la ejecución
}

// Mantuvimos esta función vieja por compatibilidad, pero ahora redirige a log
export function flash(msg, isError = false) {
    log(msg, isError);
}

// --- UTILIDADES DE FECHA Y EDAD (RESTAURADAS COMPLETAS) ---

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
    return date.toLocaleString('es-VE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
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
