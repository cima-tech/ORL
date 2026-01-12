/* modules/start.js - Sistema de autenticación real */
export default class AuthService {
    static CURRENT_USER_KEY = 'CIMA_CURRENT_USER';
    static PATIENT_SESSION_KEY = 'CIMA_PATIENT_SESSION';
    static LOG_KEY = 'CIMA_SYSTEM_LOG';
    
    static async login(username, password) {
        try {
            // Buscar usuario en estructura de carpetas
            const response = await fetch(`user/${username}/${username}.json`);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            
            const userData = await response.json();
            
            // Verificar credenciales desde el JSON del usuario
            if (userData.identity.accountPassword !== password) {
                throw new Error('Contraseña incorrecta');
            }
            
            // Guardar sesión
            sessionStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify({
                id: userData.id,
                username: userData.username,
                data: userData,
                timestamp: Date.now(),
                role: userData.role
            }));
            
            this.log('Sistema', `Usuario ${userData.identity.names} autenticado`);
            return userData;
            
        } catch (error) {
            this.log('Error', `Login fallido: ${error.message}`);
            throw error;
        }
    }
    
    static async loginPatient(documentNumber) {
        // Para pacientes, buscamos en el storage local
        const storage = JSON.parse(localStorage.getItem('CIMA_STORAGE_V3') || '{"patients":{}}');
        const patient = storage.patients[documentNumber];
        
        if (!patient) {
            throw new Error('Paciente no encontrado');
        }
        
        // Crear sesión de paciente
        sessionStorage.setItem(this.PATIENT_SESSION_KEY, JSON.stringify({
            id: patient.identificacion.documento_numero,
            name: `${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`,
            data: patient,
            timestamp: Date.now()
        }));
        
        this.log('Sistema', `Paciente ${patient.identificacion.documento_numero} autenticado`);
        return patient;
    }
    
    static logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.log('Sistema', `Usuario ${user.data.identity.names} cerró sesión`);
        }
        sessionStorage.removeItem(this.CURRENT_USER_KEY);
        sessionStorage.removeItem(this.PATIENT_SESSION_KEY);
    }
    
    static getCurrentUser() {
        const stored = sessionStorage.getItem(this.CURRENT_USER_KEY);
        if (!stored) return null;
        
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    
    static getCurrentPatient() {
        const stored = sessionStorage.getItem(this.PATIENT_SESSION_KEY);
        if (!stored) return null;
        
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    
    static isDoctorLoggedIn() {
        return !!this.getCurrentUser();
    }
    
    static isPatientLoggedIn() {
        return !!this.getCurrentPatient();
    }
    
    static log(source, message) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ${source}: ${message}`;
        
        // Guardar en localStorage
        const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
        logs.unshift(entry);
        if (logs.length > 100) logs.pop();
        localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
        
        // Notificar a la aplicación si está escuchando
        if (window.CIMA && window.CIMA.onLogUpdate) {
            window.CIMA.onLogUpdate(entry);
        }
        
        console.log(entry);
    }
    
    static getLogs(limit = 50) {
        const logs = JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
        return logs.slice(0, limit);
    }
}
