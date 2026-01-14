// app/logic/brain.js

// === ESTADO GLOBAL (STATE) ===
export const STATE = {
    currentUser: null,
    
    // Contadores de sesión
    visitIdCounter: 0,
    patientIdCounter: 1,
    patientUUID: 1,
    
    // Timestamps
    patientCreatedTime: null,
    patientModifiedTime: null,
    
    // UI States
    currentPreviewDoc: null,
    currentPreviewCard: null,
    currentShareCard: null, // Para compartir WhatsApp/Email
    editPreviewMode: false,
    USE_SIG: true,
    
    // Configuración cargada
    config: {}
};

// === UTILIDADES DOM (HELPERS) ===
export const $ = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));

// === SISTEMA DE NOTIFICACIONES ===
export function flash(msg, isError = false) {
    const e = $("#err");
    if (!e) return;
    e.textContent = msg;
    e.className = isError ? 'error' : '';
    e.style.display = 'block';
    setTimeout(() => e.style.display = 'none', 3000);
}

export function showErr(msg) { 
    flash(msg, true); 
    console.error(msg); 
}

// === UTILIDADES DE FECHA Y HORA ===
export function getLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

export function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// === CÁLCULOS MÉDICOS ===
export function calcAge(dob) {
    if (!dob) return '';
    const d = new Date(dob);
    const n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    const m = n.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
    return a;
}

export function validatePatientId(id) {
    return /^[A-Za-z]+-\d+$/.test(id);
}

// === CARGA DE CONFIGURACIÓN ===
export async function loadUserConfig() {
    try {
        const response = await fetch('./app/user/u001/user.json');
        if (!response.ok) throw new Error("No se pudo cargar user.json");
        const config = await response.json();
        STATE.currentUser = config;
        return config;
    } catch (e) {
        console.error("Error crítico cargando configuración:", e);
        showErr("Error cargando perfil del médico. Ver consola.");
        // Fallback mínimo para que no rompa la UI
        STATE.currentUser = { profile: { name: "Usuario Médico", phones: [] } }; 
    }
}