import { log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';

let PatientService = null;
let usersCatalog = [];

export const StartManager = {
    async init() {
        // Cargar catálogo de usuarios
        try {
            const response = await fetch('./app/catalog/users.json');
            usersCatalog = await response.json();
            this.setupLoginDrawer();
        } catch (e) { 
            console.error(e); 
            log("Error cargando usuarios", true); 
        }

        // Inicializar eventos globales
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                document.getElementById('consoleDrawer').classList.toggle('open');
            }
            if (e.key === 'Escape') {
                document.querySelector('.login-drawer.open')?.classList.remove('open');
                document.querySelector('.config-drawer.open')?.classList.remove('open');
            }
        });

        // Inicializar toolbar
        initToolbarEvents();
        
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;
    },

    setupLoginDrawer() {
        const loginDrawer = document.getElementById('loginDrawer');
        if (!loginDrawer) return;

        const loginHTML = `
            <div class="drawer-header">
                <h3><i class="bi bi-person-badge"></i> Iniciar Sesión</h3>
                <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="drawer-content">
                <div class="login-form">
                    <div class="form-group">
                        <label for="login-identifier">
                            <i class="bi bi-person"></i> Usuario, Email o Teléfono
                        </label>
                        <input 
                            type="text" 
                            id="login-identifier" 
                            class="form-input" 
                            placeholder="tudraorl, tudraorl@gmail.com, +584241090979"
                            autocomplete="username"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password">
                            <i class="bi bi-key"></i> Contraseña
                        </label>
                        <div class="password-input-container">
                            <input 
                                type="password" 
                                id="login-password" 
                                class="form-input" 
                                placeholder="••••••••"
                                autocomplete="current-password"
                                onkeypress="if(event.key==='Enter') window.attemptLogin()"
                            >
                            <button type="button" id="toggle-password" class="password-toggle">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button id="btn-login-submit" class="btn-login" onclick="window.attemptLogin()">
                        <i class="bi bi-box-arrow-in-right"></i> Ingresar
                    </button>
                    
                    <div class="login-footer">
                        <small>¿Problemas para ingresar? Contacta al administrador.</small>
                    </div>
                </div>
            </div>
        `;

        loginDrawer.innerHTML = loginHTML;
        this.setupLoginEvents();
    },

    setupLoginEvents() {
        // Toggle para mostrar/ocultar contraseña
        const toggleBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('login-password');
        
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleBtn.innerHTML = type === 'password' ? 
                    '<i class="bi bi-eye"></i>' : 
                    '<i class="bi bi-eye-slash"></i>';
            });
        }

        // Botón cerrar drawer
        document.querySelector('.btn-close-drawer')?.addEventListener('click', () => {
            document.getElementById('loginDrawer').classList.remove('open');
        });

        // Limpiar formulario al abrir drawer
        const loginDrawer = document.getElementById('loginDrawer');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (loginDrawer.classList.contains('open')) {
                        document.getElementById('login-identifier').value = '';
                        document.getElementById('login-password').value = '';
                        document.getElementById('login-identifier').focus();
                    }
                }
            });
        });
        observer.observe(loginDrawer, { attributes: true });
    }
};

// ================= FUNCIONES GLOBALES =================

window.attemptLogin = async () => {
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!identifier || !password) {
        showLoginError('Por favor complete todos los campos');
        return;
    }

    // Buscar usuario por múltiples criterios
    const user = findUserByIdentifier(identifier);
    
    if (!user) {
        showLoginError('Usuario no encontrado');
        return;
    }

    // Cargar configuración del usuario
    const configLoaded = await loadUserConfig(user.config_path);
    
    if (!configLoaded) {
        showLoginError('Error cargando configuración de usuario');
        return;
    }

    // Verificar contraseña
    const actualPassword = STATE.currentUser.profile.password;
    
    if (password !== actualPassword) {
        showLoginError('Contraseña incorrecta');
        return;
    }

    // Login exitoso
    finishLogin();
};

function findUserByIdentifier(identifier) {
    if (!usersCatalog || usersCatalog.length === 0) return null;
    
    // Normalizar identificador (minúsculas, sin espacios)
    const normalizedId = identifier.toLowerCase().trim();
    
    for (const user of usersCatalog) {
        // Verificar por username
        if (user.username.toLowerCase() === normalizedId) return user;
        
        // Verificar por email (cargar user.json para obtener email)
        // Para esto necesitaríamos precargar los user.json o tener los emails en users.json
        // Por ahora solo username
        
        // Verificar por teléfono (similar a email)
    }
    
    // Si no se encontró por username, intentar por nombre (parcial)
    for (const user of usersCatalog) {
        if (user.name.toLowerCase().includes(normalizedId)) return user;
    }
    
    return null;
}

function showLoginError(message) {
    // Crear o actualizar elemento de error
    let errorEl = document.querySelector('.login-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'login-error';
        document.querySelector('.login-form').prepend(errorEl);
    }
    
    errorEl.innerHTML = `
        <div class="error-message">
            <i class="bi bi-exclamation-triangle"></i> ${message}
        </div>
    `;
    
    // Animación de shake
    const form = document.querySelector('.login-form');
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 500);
}

async function finishLogin() {
    const loginDrawer = document.getElementById('loginDrawer');
    loginDrawer.classList.remove('open');
    
    try {
        log("Iniciando sesión...");
        log(`Usuario: ${STATE.currentUser.profile.name}`);
        
        // Cargar módulos médicos
        if (!await ServiceLoader.init()) {
            throw new Error("Fallo en ServiceLoader");
        }
        
        // Re-renderizar toolbar con usuario logueado
        initToolbarEvents();
        
        // Configurar servicios globales
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = document.querySelector.bind(document); // Utilidad global básica

        // Configurar listeners del formulario paciente
        const form = document.getElementById('patientForm');
        if (form) {
            form.addEventListener('change', (e) => {
                if (['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'].includes(e.target.id)) {
                    PatientService.updatePatientHeader();
                }
                if (e.target.id.includes('nacimiento')) {
                    PatientService.calcularCampos();
                }
                if (e.target.type === 'checkbox') {
                    PatientService.toggleConditionalFields();
                }
            });
        }
        
        // Configurar eventos de visitas
        const visits = document.getElementById('visitsContainer');
        if (visits) {
            visits.addEventListener('click', handleVisitClicks);
        }

        // Inicializar campos condicionales
        setTimeout(() => {
            if (PatientService.toggleConditionalFields) {
                PatientService.toggleConditionalFields();
            }
            log(`Bienvenido/a ${STATE.currentUser.profile.name}`);
        }, 300);
        
    } catch (e) { 
        console.error(e); 
        log(`Error en login: ${e.message}`, true);
        
        // Mostrar error al usuario
        alert(`Error al iniciar sesión: ${e.message}`);
    }
}

function handleVisitClicks(e) {
    const btn = e.target.closest('.visit-toggle-btn');
    if (btn) {
        const visitBody = btn.closest('.visit-card').querySelector('.visit-body');
        visitBody.classList.toggle('hidden');
        const icon = btn.querySelector('i');
        icon.classList.toggle('bi-chevron-right');
        icon.classList.toggle('bi-chevron-down');
    }
    
    if (e.target.classList.contains('chip')) {
        e.target.classList.toggle('active');
    }
    
    if (e.target.closest('.btn-inf')) {
        window.openDocGlobal('INF', e.target.closest('.visit-card').id);
    }
    
    if (e.target.closest('.btn-rp')) {
        window.openDocGlobal('RP', e.target.closest('.visit-card').id);
    }
}

// Helper para mostrar errores (reemplaza la función de brain.js temporalmente)
function log(message, isError = false) {
    console.log(message);
    const drawer = document.getElementById('consoleContent');
    if (!drawer) return;
    
    const time = new Date().toLocaleTimeString();
    const color = isError ? '#ef4444' : '#4ade80';
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = `<span style="color:#64748b">[${time}]</span> <span style="color:${color}">${message}</span>`;
    drawer.prepend(line);
}
