// app/logic/brain.js

// ==========================================
// 1. UTILIDADES DOM (Selectores cortos)
// ==========================================
// Esta es la línea que faltaba y causaba el error en recipe-indicaciones.js
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

// ==========================================
// 2. ESTADO GLOBAL (STATE)
// ==========================================
export const STATE = {
    // Contadores para IDs únicos
    visitIdCounter: 0,
    patientIdCounter: 1, 
    patientUUID: 1, 
    
    // Timestamps
    patientCreatedTime: null,
    patientModifiedTime: null,
    
    // UI States
    currentPreviewCard: null, 
    currentPreviewDoc: null,
    currentShareCard: null,
    USE_SIG: true,
    exportFilename: '',
    
    // Configuración Usuario
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
// 3. CARGA DE CONFIGURACIÓN
// ==========================================
export async function loadUserConfig() {
    try {
        const response = await fetch('./app/user/u001/config/user.json');
        if (response.ok) {
            const config = await response.json();
            STATE.currentUser = { 
                ...STATE.currentUser, 
                ...config,
                assets: { ...STATE.currentUser.assets, ...(config.assets || {}) },
                profile: { ...STATE.currentUser.profile, ...(config.profile || {}) }
            };
            console.log("Configuración cargada.");
        }
    } catch (e) {
        console.warn("Usando configuración por defecto.");
    }
}

// ==========================================
// 4. NOTIFICACIONES UI
// ==========================================
let timeoutHandle;

export function flash(msg, isError = false) {
    const el = document.getElementById("err"); // Usamos getElementById nativo por seguridad
    if (!el) return;
    
    clearTimeout(timeoutHandle);
    
    el.textContent = msg;
    el.className = isError ? 'error' : '';
    el.style.display = 'block';
    
    // Reiniciar animación
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = 'fadeIn 0.3s ease-out';

    timeoutHandle = setTimeout(() => {
        el.style.display = 'none';
    }, 3000);
}

export function showErr(msg) {
    console.error(msg);
    flash(msg, true);
}

// ==========================================
// 5. FECHAS Y FORMATOS
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
