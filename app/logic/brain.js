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
    // Contadores
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
            name: "Dra. Gonzalez",
            title_line_1: "Médico Otorrinolaringologo",
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
// 3. CARGA DE CONFIGURACIÓN & UI
// ==========================================
export async function loadUserConfig() {
    // Inyectamos estilos de notificación primero
    injectToastStyles();

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
            console.log("Configuración cargada.");
            
            // ACTUALIZAR INTERFAZ (Avatar y Nombre)
            updateGlobalUI();
            
        } else {
            console.warn("user.json no encontrado, usando defaults.");
            updateGlobalUI(); // Actualizar aunque sea con defaults
        }
    } catch (e) {
        console.error("Error cargando configuración:", e);
    }
}

// Función para actualizar el Toolbar con los datos del usuario
function updateGlobalUI() {
    const user = STATE.currentUser.profile;
    
    // 1. Actualizar Iniciales del Avatar
    const btnAvatar = $("#btnUserAvatar");
    if(btnAvatar) {
        // Lógica para sacar iniciales (ej: Valentina Gonzalez -> VG)
        const parts = user.name.trim().split(" ");
        let initials = "DR";
        if (parts.length >= 2) {
            initials = parts[0][0] + parts[1][0];
        } else if (parts.length === 1) {
            initials = parts[0].substring(0, 2);
        }
        btnAvatar.textContent = initials.toUpperCase();
    }

    // 2. Actualizar Dropdown
    const dropHeaderName = $("#userDropdown h4");
    if(dropHeaderName) dropHeaderName.textContent = user.name;
    
    const dropHeaderTitle = $("#userDropdown p");
    if(dropHeaderTitle) dropHeaderTitle.textContent = user.title_line_1;
}

// ==========================================
// 4. NOTIFICACIONES UI (TOAST)
// ==========================================
let timeoutHandle;

export function flash(msg, isError = false) {
    let el = document.getElementById("err");
    
    // Si no existe, lo creamos al vuelo
    if (!el) {
        el = document.createElement("div");
        el.id = "err";
        document.body.appendChild(el);
    }
    
    clearTimeout(timeoutHandle);
    
    el.textContent = msg;
    // Estilo dinámico según tipo
    el.style.borderLeft = isError ? "4px solid #ef4444" : "4px solid #10b981";
    el.style.color = isError ? "#fca5a5" : "#fff";
    
    el.classList.add('active'); // Clase para animación CSS si existe
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

// Inyectar CSS para el mensaje flotante (Para no ensuciar el CSS principal)
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
// 5. FECHAS Y UTILIDADES
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
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : 0;
}
