import { log, loadUserConfig, STATE, flash } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { initToolbarEvents } from 'toolbar';
import { DrawersManager } from './drawers.js';

export const StartManager = {
    async init() {
        console.log("--> StartManager.init() iniciado");
        
        // 1. Registrar el listener DE INMEDIATO
        document.addEventListener('login-success', () => {
            console.log("--> Evento login-success capturado en StartManager");
            finishLogin();
        });

        // 2. Eventos globales de teclado
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

        // 3. Inicializar HTML de Drawers
        DrawersManager.init();

        // 4. Cargar usuarios
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

        // 5. Inicializar toolbar
        initToolbarEvents();
        
        // 6. Aplicar tema
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;
        
        console.log("--> StartManager.init() completado. Esperando Login...");
    },

    async refreshUserList() {
        try {
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            const mergedUsers = [...originalUsers, ...localDB];
            
            if (DrawersManager && DrawersManager.Login) {
                DrawersManager.Login.renderList(mergedUsers);
            }
        } catch(e) { console.error(e); }
    }
};

// --- FUNCIÓN PRINCIPAL DE ARRANQUE DEL SISTEMA ---

async function finishLogin() {
    console.log("--> Ejecutando finishLogin()...");
    
    const loginDrawer = document.getElementById('loginDrawer');
    if (loginDrawer) loginDrawer.classList.remove('open');
    
    try {
        log("Iniciando módulos del sistema...");
        
        const loaded = await ServiceLoader.init();
        if (!loaded) throw new Error("ServiceLoader devolvió false");
        
        initToolbarEvents();
        
        const PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;

        const form = document.getElementById('patientForm');
        if (form) {
            form.onchange = (e) => {
                 const id = e.target.id;
                 if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'].includes(id)) {
                     PatientService.updatePatientHeader();
                 }
                 if(id.includes('nacimiento')) PatientService.calcularCampos();
                 if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
            };
        }
        
        const visits = document.getElementById('visitsContainer');
        if (visits) {
            visits.onclick = handleVisitClicks;
        }

        setTimeout(() => {
            if(PatientService) PatientService.toggleConditionalFields();
            const name = STATE.currentUser?.profile?.firstname || "Usuario";
            log(`Bienvenido/a, ${name}`);
            flash(`Sesión iniciada: ${name}`); 
        }, 300);

    } catch (e) { 
        console.error("--> Error en finishLogin:", e); 
        log("Error crítico al iniciar: " + e.message, true); 
    }
}

function handleVisitClicks(e) {
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
    
    // NUEVO: Botón unificado de documentos
    if (e.target.closest('.btn-docs')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('INF', card.id); 
    }
    
    // Compatibilidad por si acaso queda algún botón viejo
    if (e.target.closest('.btn-inf')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('INF', card.id);
    }
    if (e.target.closest('.btn-rp')) {
        const card = e.target.closest('.visit-card');
        if(card) window.openDocGlobal('RP', card.id);
    }
}

window.finishLogin = finishLogin;
window.refreshUserList = () => StartManager.refreshUserList();
window.selectUser = (id, path) => DrawersManager.Login.selectUser(id, path);
window.verifyPassword = (id) => DrawersManager.Login.verifyPassword(id);
