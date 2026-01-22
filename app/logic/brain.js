// app/logic/brain.js
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

export const STATE = {
    visitIdCounter: 0,
    patientIdCounter: 1,
    patientUUID: 1000,
    
    UI: {
        currentMode: 'CONSULTATION',
        isStoryOpen: false,
        isPreviewMode: false,
        layout: 'toolbar',
        // NUEVO: Estado centralizado de drawers
        drawers: {
            login: { open: false, side: 'right' },
            createUser: { open: false, side: 'right' },
            config: { open: false, side: 'left' },
            export: { open: false, side: 'left' },
            console: { open: false }
        },
        theme: localStorage.getItem('CIMA_THEME') || 'glass'
    },

    currentPreviewCard: null,
    currentPreviewDoc: null,
    USE_SIG: true,
    exportFilename: '',
    
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
        preferences: {
            theme: "glass",
            default_model: "ORL-001"
        },
        assets: {}
    }
};

// NUEVA FUNCIÓN: Control centralizado de drawers
export function toggleDrawer(drawerName, forceState = null) {
    // Cerrar todos los drawers del mismo lado
    const drawer = STATE.UI.drawers[drawerName];
    if (!drawer) return;
    
    const side = drawer.side;
    Object.keys(STATE.UI.drawers).forEach(key => {
        if (STATE.UI.drawers[key].side === side && key !== drawerName) {
            STATE.UI.drawers[key].open = false;
        }
    });
    
    // Alternar estado del drawer solicitado
    drawer.open = forceState !== null ? forceState : !drawer.open;
    
    // Dispatch event para actualizar UI
    document.dispatchEvent(new CustomEvent('drawers-changed'));
    return drawer.open;
}

export function closeAllDrawers() {
    Object.keys(STATE.UI.drawers).forEach(key => {
        STATE.UI.drawers[key].open = false;
    });
    document.dispatchEvent(new CustomEvent('drawers-changed'));
}

// Función auxiliar para verificar si algún drawer está abierto
export function anyDrawerOpen() {
    return Object.values(STATE.UI.drawers).some(d => d.open);
}

export async function loadUserConfig(configPath) {
    const path = configPath || './app/user/u001/user.json';
    try {
        const response = await fetch(path);
        if (response.ok) {
            const config = await response.json();
            STATE.currentUser = config;
            log(`Perfil cargado: ${STATE.currentUser.profile.username}`);
            initWallpaperSystem();
            return true;
        } else throw new Error("Config not found");
    } catch (e) { 
        console.error(e); 
        log("Error cargando perfil", true); 
        return false; 
    }
}

function initWallpaperSystem() {
    let currentWP = localStorage.getItem('CIMA_WALLPAPER_URL') || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop";
    document.body.style.backgroundImage = `url('${currentWP}')`;
}

export function rotateWallpaper() {
    const wps = [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop"
    ];
    const newWP = wps[Math.floor(Math.random() * wps.length)];
    const img = new Image(); 
    img.src = newWP;
    img.onload = () => {
        document.body.style.backgroundImage = `url('${newWP}')`;
        localStorage.setItem('CIMA_WALLPAPER_URL', newWP);
        log("Fondo cambiado");
    };
}

// --- CONSOLE DRAWER ---
export function log(msg, isError = false) {
    console.log(msg);
    const drawer = document.getElementById('consoleContent');
    if (!drawer) return;
    const time = new Date().toLocaleTimeString();
    const color = isError ? '#ef4444' : '#4ade80';
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = `<span style="color:#64748b">[${time}]</span> <span style="color:${color}">${msg}</span>`;
    drawer.prepend(line);
}

export function showErr(msg) { log(msg, true); }
export function flash(msg, isError = false) { log(msg, isError); }

// --- UTILS ---
export function getLocalDateTime() { 
    const now = new Date(); 
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
    return now.toISOString().slice(0, 16); 
}

export function fmtDate(iso) { 
    if (!iso) return ""; 
    const d = new Date(iso); 
    return isNaN(d) ? iso : d.toLocaleDateString('es-VE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    }); 
}

export function fmtDateTime(iso) { 
    if (!iso) return ""; 
    const d = new Date(iso); 
    return isNaN(d) ? iso : d.toLocaleString('es-VE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    }); 
}

export function calcAge(str) { 
    if (!str) return ""; 
    const t = new Date(), b = new Date(str); 
    let a = t.getFullYear() - b.getFullYear(); 
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; 
    return a >= 0 ? a : 0; 
}
