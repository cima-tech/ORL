/* modules/start.js - Módulo de Inicio de Sesión */

export default class AuthService {
    static async login(username, password) {
        // Verificación local - en producción sería contra un servidor
        if (username === 'tudraorl' && password === 'astroyluna') {
            try {
                const response = await fetch('user/user-001/user-001.json');
                if (response.ok) {
                    const userData = await response.json();
                    
                    // Guardar sesión
                    sessionStorage.setItem('cima_auth', JSON.stringify({
                        user: userData,
                        timestamp: new Date().getTime()
                    }));
                    
                    return { success: true, user: userData };
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
            }
        }
        
        return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    static logout() {
        sessionStorage.removeItem('cima_auth');
        sessionStorage.removeItem('cima_temp_patients');
        location.reload();
    }

    static getCurrentUser() {
        const auth = sessionStorage.getItem('cima_auth');
        if (auth) {
            try {
                const data = JSON.parse(auth);
                // Verificar que la sesión no haya expirado (8 horas)
                if (new Date().getTime() - data.timestamp < 8 * 60 * 60 * 1000) {
                    return data.user;
                }
            } catch (e) {
                console.error('Error parsing auth data:', e);
            }
        }
        return null;
    }

    static isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.hash = '';
            return false;
        }
        return true;
    }
}
