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

        // Cargar usuarios HYBRIDA (JSON + LocalStorage)
        try {
            // 1. Fetch original
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            
            // 2. Fetch local
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            
            // 3. Fusionar (Prioridad a LocalStorage si hay conflicto por id/username, aqui solo concatenamos)
            const mergedUsers = [...originalUsers, ...localDB];
            
            // Renderizar lista
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

    refreshUserList() {
        // Refresca lista login (Solo lectura y lógica de re-renderizado)
        if (typeof window.DrawersManager !== 'undefined') {
            try {
                const response = await fetch('./app/catalog/users.json');
                const originalUsers = await response.json();
                const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
                const mergedUsers = [...originalUsers, ...localDB];
                DrawersManager.Login.renderList(mergedUsers);
            } catch(e) { console.error(e); }
        }
    }
};

async function selectUser(id, configPath) {
    document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
    
    // Delegar carga de usuario a DrawersManager
    DrawersManager.Login.selectUser(id, configPath);
}

function verifyPassword(id) {
    // Delegar verificación a DrawersManager
    DrawersManager.Login.verifyPassword(id);
}

async function finishLogin() {
    const loginDrawer = document.getElementById('loginDrawer');
    loginDrawer.classList.remove('open');
    
    try {
        log("Cargando módulos...");
        if (!await ServiceLoader.init()) throw new Error("Fallo en ServiceLoader");
        
        // Re-renderizar toolbar con usuario logueado
        initToolbarEvents();
        
        const PatientService = ServiceLoader.get('patient');
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
            log(`Bienvenido/a ${STATE.currentUser.profile.firstname}`);
        }, 300);
    } catch (e) { 
        console.error(e); 
        log(e.message, true); 
    }
}

function handleVisitClicks(e) {
    const btn = e.target.closest('.visit-toggle-btn');
    if(btn) { btn.closest('.visit-card').querySelector('.visit-body').classList.toggle('hidden'); const i = btn.querySelector('i'); i.classList.toggle('bi-chevron-right'); i.classList.toggle('bi-chevron-down'); }
    if(e.target.classList.contains('chip')) e.target.classList.toggle('active');
    if(e.target.closest('.btn-inf')) window.openDocGlobal('INF', e.target.closest('.visit-card').id);
    if(e.target.closest('.btn-rp')) window.openDocGlobal('RP', e.target.closest('.visit-card').id);
}

window.selectUser = selectUser;
window.verifyPassword = verifyPassword;
window.refreshUserList = () => StartManager.refreshUserList();
