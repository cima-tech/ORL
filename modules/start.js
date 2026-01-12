/* modules/start.js - Sistema de autenticación */

export default class AuthService {
    static CURRENT_USER_KEY = 'CIMA_CURRENT_USER_V1';
    
    static async login(username, password) {
        try {
            // Buscar usuario en la estructura de carpetas
            const response = await fetch(`user/${username}/${username}.json`);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            
            const userData = await response.json();
            
            // Verificar credenciales
            if (userData.identity.accountPassword !== password) {
                throw new Error('Contraseña incorrecta');
            }
            
            // Cargar módulo UserProfile
            const UserProfileModule = await import('./user-profile.js');
            const UserProfile = UserProfileModule.default;
            const user = new UserProfile(null, userData);
            
            // Guardar sesión
            sessionStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify({
                id: userData.id,
                timestamp: Date.now(),
                data: userData
            }));
            
            return user;
            
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }
    
    static logout() {
        sessionStorage.removeItem(this.CURRENT_USER_KEY);
        localStorage.removeItem('CIMA_SESSION');
        window.location.href = window.location.origin + window.location.pathname;
    }
    
    static getCurrentUser() {
        const stored = sessionStorage.getItem(this.CURRENT_USER_KEY);
        if (!stored) return null;
        
        try {
            const { data } = JSON.parse(stored);
            return data;
        } catch {
            return null;
        }
    }
    
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }
    
    static async autoLogin() {
        // Intentar cargar usuario por defecto si hay solo uno
        try {
            // En una implementación real, aquí buscaríamos usuarios disponibles
            return null;
        } catch {
            return null;
        }
    }
}
