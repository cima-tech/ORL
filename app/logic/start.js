import { log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { initToolbarEvents } from 'toolbar';
import { DrawersManager } from './drawers.js';

export const StartManager = {
    async init() {
        // Inicializar eventos globales de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                const drawer = document.getElementById('consoleDrawer');
                if (drawer) drawer.classList.toggle('open');
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.login-drawer.open, .config-drawer.open').forEach(el => {
                    el.classList.remove('open');
                });
            }
        });

        // Inicializar HTML de Drawers
        DrawersManager.init();

        // Cargar usuarios (JSON + LocalStorage)
        try {
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            const mergedUsers = [...originalUsers, ...localDB];
            
            DrawersManager.Login.renderList(mergedUsers);
        } catch (e) { 
            console.error(e); 
            log("Error cargando lista de usuarios", true); 
        }

        // Inicializar UI base
        initToolbarEvents();
        
        // Aplicar tema
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;

        // Listener para finalizar login
        document.addEventListener('login-success', finishLogin);
    },

    // --- CORRECCIÓN AQUÍ: Se agregó 'async' antes del nombre de la función ---
    async refreshUserList() {
        // Refresca lista login (Solo lectura y lógica de re-renderizado)
        if (typeof window.DrawersManager !== 'undefined') {
            try {
                const response = await fetch('./app/catalog/users.json');
                const originalUsers = await response.json();
                const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
                const mergedUsers = [...originalUsers, ...localDB];
                window.DrawersManager.Login.renderList(mergedUsers);
            } catch(e) { console.error(e); }
        }
    }
};

// --- FUNCIONES GLOBALES DE LOGIN ---

// Esta función también debe ser ASYNC para usar AWAIT dentro
async function selectUser(id, configPath) {
    // Limpiar campos de contraseña previos
    document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
    
    const localConfigKey = `CIMA_USER_CONFIG_${id}`;
    const localConfigJSON = localStorage.getItem(localConfigKey);
    
    // Lógica de carga robusta
    if (localConfigJSON) { 
        try { 
            STATE.currentUser = JSON.parse(localConfigJSON); 
            log("Configuración local cargada para " + id); 
        } catch(e) { 
            // Fallback si el JSON local está corrupto
            log("Error en config local, recargando del servidor...", true);
            await loadUserConfig(configPath);
        }
    } else { 
        // Si no hay local, cargar del archivo
        await loadUserConfig(configPath); 
    }

    // Verificar si requiere contraseña
    const pwd = STATE.currentUser?.profile?.password;

    if (pwd) { 
        const area = document.getElementById(`pwd-area-${id}`); 
        if (area) {
            area.classList.remove('hidden'); 
            const input = document.getElementById(`pwd-input-${id}`);
            if (input) input.focus();
        }
    } else { 
        // Login directo sin password
        window.dispatchEvent(new CustomEvent('login-success'));
    }
}

function verifyPassword(id) {
    const input = document.getElementById(`pwd-input-${id}`);
    const actual = STATE.currentUser?.profile?.password;
    
    if (input && actual && input.value === actual) { 
        window.dispatchEvent(new CustomEvent('login-success'));
    } else { 
        if (input) {
            input.style.borderColor = "#ef4444"; 
            input.classList.add('shake');
            log("Contraseña incorrecta", true);
            setTimeout(() => { 
                input.style.borderColor = ""; 
                input.classList.remove('shake'); 
            }, 500);
        }
    }
}

async function finishLogin() {
    const loginDrawer = document.getElementById('loginDrawer');
    if (loginDrawer) loginDrawer.classList.remove('open');
    
    try {
        log("Iniciando módulos del sistema...");
        
        // Carga dinámica de módulos (Patient, Consult, etc.)
        if (!await ServiceLoader.init()) {
            throw new Error("Fallo crítico en ServiceLoader");
        }
        
        // Re-renderizar toolbar con el usuario autenticado
        initToolbarEvents();
        
        // Configurar listeners específicos del módulo de Pacientes
        const PatientService = ServiceLoader.get('patient');
        
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;

        const form = document.getElementById('patientForm');
        if (form) {
            form.addEventListener('change', (e) => {
                 const id = e.target.id;
                 if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'].includes(id)) {
                     PatientService.updatePatientHeader();
                 }
                 if(id.includes('nacimiento')) PatientService.calcularCampos();
                 if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
            });
        }
        
        const visits = document.getElementById('visitsContainer');
        if (visits) {
            visits.addEventListener('click', handleVisitClicks);
        }

        // Finalización
        setTimeout(() => {
            if(PatientService) PatientService.toggleConditionalFields();
            const name = STATE.currentUser?.profile?.firstname || "Usuario";
            log(`Bienvenido/a, ${name}`);
        }, 300);

    } catch (e) { 
        console.error(e); 
        log(e.message, true); 
    }
}

function handleVisitClicks(e) {
    // Manejo de clicks en las tarjetas de consulta (Delegación de eventos)
    const btnToggle = e.target.closest('.visit-toggle-btn');
    if (btnToggle) { 
        const card = btnToggle.closest('.visit-card');
        const body = card.querySelector('.visit-body');
        const icon = btnToggle.querySelector('i'); 
        
        body.classList.toggle('hidden');
        if (body.classList.contains('hidden')) {
            icon.className = 'bi bi-chevron-right';
        } else {
            icon.className = 'bi bi-chevron-down';
        }
    }

    if (e.target.classList.contains('chip')) {
        e.target.classList.toggle('active');
    }
    
    // Botones de Documentos
    if (e.target.closest('.btn-inf')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('INF', card.id);
    }
    if (e.target.closest('.btn-rp')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('RP', card.id);
    }
}

// Exponer funciones al scope global para que el HTML pueda verlas
window.selectUser = selectUser;
window.verifyPassword = verifyPassword;
window.refreshUserList = () => StartManager.refreshUserList();
