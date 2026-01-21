import { log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { initToolbarEvents } from 'toolbar';
import { DrawersManager } from './drawers.js';

export const StartManager = {
    async init() {
        // Inicializar eventos globales
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') document.getElementById('consoleDrawer')?.classList.toggle('open');
            if (e.key === 'Escape') {
                document.querySelector('.login-drawer.open')?.classList.remove('open');
                document.querySelector('.config-drawer.open')?.classList.remove('open');
            }
        });

        // Inicializar DrawersManager (Inyección HTML)
        DrawersManager.init();

        // Cargar usuarios HÍBRIDA (JSON + LocalStorage)
        try {
            // 1. Fetch original
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            
            // 2. Fetch local
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            
            // 3. Fusionar
            const mergedUsers = [...originalUsers, ...localDB];
            
            DrawersManager.Login.renderList(mergedUsers);
        } catch (e) { 
            console.error(e); 
            log("Error cargando usuarios", true); 
        }

        // Inicializar toolbar
        initToolbarEvents();
        
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;

        // Escuchar evento de login exitoso disparado por DrawersManager
        document.addEventListener('login-success', finishLogin);
    },

    async refreshUserList() {
        try {
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            const mergedUsers = [...originalUsers, ...localDB];
            DrawersManager.Login.renderList(mergedUsers);
        } catch(e) { console.error(e); }
    }
};

// --- LOGICA DE LOGIN Y CARGA ---

async function selectUser(id, configPath) {
    document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
    
    // Cargar config local si existe (prioridad) o del JSON
    const localConfig = localStorage.getItem(`CIMA_USER_CONFIG_${id}`);
    
    if(localConfig) { 
        try { 
            STATE.currentUser = JSON.parse(localConfig); 
            log("Config local cargada para " + id); 
        } catch(e) { 
            // Si falla el parseo local, intentamos cargar del archivo
            await loadUserConfig(configPath).then(() => {
                 console.log("Config fallback cargada");
            }); 
        }
    } else { 
        await loadUserConfig(configPath).then(() => {
             // Config cargada desde archivo
        }); 
    }

    // Verificar si el perfil cargado tiene contraseña
    const pwd = STATE.currentUser?.profile?.password;

    if (pwd) { 
        const area = document.getElementById(`pwd-area-${id}`); 
        if(area) {
            area.classList.remove('hidden'); 
            const input = document.getElementById(`pwd-input-${id}`);
            if(input) input.focus();
        }
    } else { 
        // Si no tiene password, login directo
        window.dispatchEvent(new CustomEvent('login-success'));
    }
}

function verifyPassword(id) {
    const input = document.getElementById(`pwd-input-${id}`);
    const actual = STATE.currentUser?.profile?.password;
    
    if (input && actual && input.value === actual) { 
        // Correcto
        window.dispatchEvent(new CustomEvent('login-success'));
    } else { 
        if(input) {
            input.style.borderColor = "#ef4444"; 
            input.classList.add('shake');
            log("Contraseña incorrecta", true);
            setTimeout(() => { input.style.borderColor = ""; input.classList.remove('shake'); }, 500);
        } else {
            log("Error: Input no encontrado");
        }
    }
}

async function finishLogin() {
    const loginDrawer = document.getElementById('loginDrawer');
    if(loginDrawer) loginDrawer.classList.remove('open');
    
    try {
        log("Cargando módulos...");
        if (!await ServiceLoader.init()) throw new Error("Fallo en ServiceLoader");
        
        // Re-renderizar toolbar con usuario logueado
        initToolbarEvents();
        
        const PatientService = ServiceLoader.get('patient');
        
        // Exponer utilidades globales
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;

        // Configurar listeners del formulario paciente
        const form = document.getElementById('patientForm');
        if(form) form.addEventListener('change', (e) => {
             if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'].includes(e.target.id)) PatientService.updatePatientHeader();
             if(e.target.id.includes('nacimiento')) PatientService.calcularCampos();
             if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
        });
        
        const visits = document.getElementById('visitsContainer');
        if(visits) visits.addEventListener('click', handleVisitClicks);

        setTimeout(() => {
            PatientService.toggleConditionalFields();
            if(STATE.currentUser?.profile?.firstname) {
                log(`Bienvenido/a ${STATE.currentUser.profile.firstname}`);
            }
        }, 300);
    } catch (e) { 
        console.error(e); 
        log(e.message, true); 
    }
}

function handleVisitClicks(e) {
    const btn = e.target.closest('.visit-toggle-btn');
    if(btn) { 
        const body = btn.closest('.visit-card').querySelector('.visit-body');
        body.classList.toggle('hidden'); 
        const i = btn.querySelector('i'); 
        if (body.classList.contains('hidden')) {
            i.className = 'bi bi-chevron-right';
        } else {
            i.className = 'bi bi-chevron-down';
        }
    }
    if(e.target.classList.contains('chip')) e.target.classList.toggle('active');
    
    // Delegación para botones de informe y récipe
    if(e.target.closest('.btn-inf')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('INF', card.id);
    }
    if(e.target.closest('.btn-rp')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('RP', card.id);
    }
}

// Exponer funciones necesarias al objeto window
window.selectUser = selectUser;
window.verifyPassword = verifyPassword;
window.refreshUserList = () => StartManager.refreshUserList();
