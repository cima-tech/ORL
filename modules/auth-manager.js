/* modules/auth-manager.js - Gestión de usuarios real */
export default class AuthManager {
    static USERS_KEY = 'CIMA_USERS_V1';
    static SESSION_KEY = 'CIMA_SESSION_V1';
    
    static async init() {
        // Cargar usuarios desde archivo o crear estructura inicial
        if (!localStorage.getItem(this.USERS_KEY)) {
            // Cargar usuario por defecto desde user-001.json
            try {
                const response = await fetch('user/user-001/user-001.json');
                if (response.ok) {
                    const defaultUser = await response.json();
                    await this.registerUser(
                        defaultUser.username,
                        defaultUser.identity.accountPassword,
                        defaultUser
                    );
                }
            } catch (e) {
                console.warn("No se pudo cargar usuario por defecto:", e);
            }
        }
    }
    
    static async registerUser(username, password, userData = {}) {
        const users = this.getUsers();
        
        if (users[username]) {
            throw new Error("El usuario ya existe");
        }
        
        // Crear usuario básico si no se proporcionan datos completos
        const user = {
            id: 'user-' + Date.now(),
            username,
            passwordHash: this.hashPassword(password),
            role: userData.role || 'Assistant',
            createdAt: new Date().toISOString(),
            ...userData
        };
        
        users[username] = user;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return user;
    }
    
    static async login(username, password) {
        const users = this.getUsers();
        const user = users[username];
        
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        
        if (user.passwordHash !== this.hashPassword(password)) {
            throw new Error("Contraseña incorrecta");
        }
        
        // Crear sesión
        const session = {
            username,
            timestamp: Date.now(),
            userData: user
        };
        
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return user;
    }
    
    static logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
    }
    
    static getCurrentUser() {
        const session = sessionStorage.getItem(this.SESSION_KEY);
        if (!session) return null;
        
        try {
            return JSON.parse(session).userData;
        } catch {
            return null;
        }
    }
    
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }
    
    static getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : {};
    }
    
    static hashPassword(password) {
        // En un sistema real usaríamos bcrypt, pero para simplicidad:
        return btoa(password); // NO usar en producción
    }
}
