// ARCHIVO: js/orl-utilities.js
// Funciones utilitarias para el sistema ORL

// Funciones de formato de fecha
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

// Cálculo de edad
export function calcAge(dob) {
    if (!dob) return '';
    const d = new Date(dob);
    const n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    const m = n.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
    return a;
}

// Validación de ID de paciente
export function validatePatientId(id) {
    return /^[A-Za-z]+-\d+$/.test(id);
}

// Función para obtener fecha/hora local
export function getLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}