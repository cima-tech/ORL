/* modules/start.js - Sistema de autenticación REAL usando los archivos JSON existentes */
class AuthService {
    static async login(username, password) {
        try {
            // 1. Buscar usuario en la estructura existente
            const response = await fetch(`user/${username}/${username}.json`);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            
            const userData = await response.json();
            
            // 2. Verificar credenciales contra el JSON real
            if (userData.identity.accountPassword !== password) {
                throw new Error('Contraseña incorrecta');
            }
            
            // 3. Importar dinámicamente UserProfile
            const { default: UserProfile } = await import('./user-profile.js');
            const user = new UserProfile(null, userData);
            
            // 4. Guardar sesión
            sessionStorage.setItem('CIMA_CURRENT_USER', JSON.stringify({
                id: userData.id,
                data: userData,
                timestamp: Date.now()
            }));
            
            return user;
            
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }
    
    static logout() {
        sessionStorage.removeItem('CIMA_CURRENT_USER');
        window.location.reload();
    }
    
    static getCurrentUser() {
        const stored = sessionStorage.getItem('CIMA_CURRENT_USER');
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
    
    static async loadUserProfile() {
        const userData = this.getCurrentUser();
        if (!userData) return null;
        
        const { default: UserProfile } = await import('./user-profile.js');
        return new UserProfile(null, userData);
    }
}

export default AuthService;
