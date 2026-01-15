// app/logic/brain.js

// ==========================================
// 1. UTILIDADES DOM
// ==========================================
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

// ==========================================
// 2. ESTADO GLOBAL (STATE)
// ==========================================
export const STATE = {
    visitIdCounter: 0,
    patientIdCounter: 1, 
    
    // UI States
    currentPreviewCard: null, 
    currentPreviewDoc: null,
    currentShareCard: null,
    USE_SIG: true,
    exportFilename: '',
    
    // Configuración Usuario (Default)
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
// 3. SISTEMA DE WALLPAPERS (Tipo Google)
// ==========================================
const WALLPAPERS = [
    // Selección de Paisajes Alta Calidad (Unsplash) - Tonos Fríos/Naturales
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop", // Montañas Azules
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544&auto=format&fit=crop", // Tierra/Espacio
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop", // Niebla Montana
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=3748&auto=format&fit=crop", // Bosque Niebla
    "https://images.unsplash.com/photo-1501854140884-074cf2b21d25?q=80&w=3544&auto=format&fit=crop", // Lago Oscuro
    "https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=2664&auto=format&fit=crop", // Picos Nevados
    "https://images.unsplash.com/photo-1534274988754-0d46e80b3580?q=80&w=3000&auto=format&fit=crop"  // Flores azules abstractas
];

function initWallpaperSystem() {
    let currentWP = localStorage.getItem('CIMA_WALLPAPER_URL');
    
    if (!currentWP) {
        // Primera vez: elegir uno al azar
        const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
        currentWP = WALLPAPERS[randomIndex];
    }
    
    document.body.style.backgroundImage = `url('${currentWP}')`;
}

export function rotateWallpaper() {
    // Función llamada desde el botón "Cambiar Fondo"
    const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
    const newWP = WALLPAPERS[randomIndex];
    
    // Pre-cargar imagen para evitar parpadeo negro
    const img = new Image();
    img.src = newWP;
    img.onload = () => {
        document.body.style.backgroundImage = `url('${newWP}')`;
        localStorage.setItem('CIMA_WALLPAPER_URL', newWP);
        flash("Fondo actualizado", false);
    };
}

// ==========================================
// 4. CARGA DE CONFIGURACIÓN
// ==========================================
export async function loadUserConfig() {
    injectToastStyles(); // Estilos CSS para alertas
    initWallpaperSystem(); // Fondo

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
            updateGlobalUI();
        } else {
            console.warn("User defaults.");
            updateGlobalUI();
        }
    } catch (e) {
        console.error("Error config:", e);
    }
}

function updateGlobalUI() {
    const user = STATE.currentUser.profile;
    
    // Avatar Initials
    const btnAvatar = $("#btnUserAvatar");
    if(btnAvatar) {
        const parts = user.name.trim().split(" ");
        let initials = "DR";
        if (parts.length >= 2) initials = parts[0][0] + parts[1][0];
        else if (parts.length === 1) initials = parts[0].substring(0, 2);
        btnAvatar.textContent = initials.toUpperCase();
    }

    // Dropdown Info
    const dropHeaderName = $("#userDropdown h4");
    if(dropHeaderName) dropHeaderName.textContent = user.name;
    
    const dropHeaderTitle = $("#userDropdown p");
    if(dropHeaderTitle) dropHeaderTitle.textContent = user.title_line_1;
}

// ==========================================
// 5. NOTIFICACIONES (TOAST)
// ==========================================
let timeoutHandle;

export function flash(msg, isError = false) {
    let el = document.getElementById("err");
    if (!el) {
        el = document.createElement("div");
        el.id = "err";
        document.body.appendChild(el);
    }
    
    clearTimeout(timeoutHandle);
    
    el.textContent = msg;
    // Borde de color según tipo
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

export function showErr(msg) {
    console.error(msg);
    flash(msg, true);
}

// Inyección de estilos CSS para el Toast (para no ensuciar main.css)
function injectToastStyles() {
    const styleId = "toast-styles";
    if (document.getElementById(styleId)) return;

    const css = `
        #err {
            display: none;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translate(-50%, -20px);
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            color: white;
            font-size: 0.9rem;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            border: 1px solid rgba(255,255,255,0.1);
            min-width: 300px;
            text-align: center;
        }
    `;
    const style = document.createElement('style');
    style.id = styleId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

// ==========================================
// 6. FECHAS
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
    return date.toLocaleDateString('es-VE', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
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
