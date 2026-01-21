import { log, loadUserConfig, STATE, flash } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { initToolbarEvents } from 'toolbar';
import { DrawersManager } from './drawers.js';

export const StartManager = {
    async init() {
        console.log("--> StartManager.init() iniciado");
        
        // 1. Registrar el listener de Login
        document.addEventListener('login-success', () => {
            console.log("--> Login Exitoso. Iniciando sistema...");
            finishLogin();
        });

        // 2. Eventos globales
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                document.getElementById('consoleDrawer')?.classList.toggle('open');
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.login-drawer.open, .config-drawer.open').forEach(el => {
                    // No cerrar el login con escape si no hay usuario
                    if (el.id === 'loginDrawer' && STATE.currentUser.profile.id === 'guest') return;
                    el.classList.remove('open');
                });
            }
        });

        // 3. Inicializar UI de Drawers (Esto carga el Login Form inmediatamente)
        await DrawersManager.init();

        // 4. Inicializar toolbar (Modo Guest)
        initToolbarEvents();
        
        // 5. Aplicar tema guardado
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;
        
        console.log("--> Sistema listo. Esperando credenciales.");
    },

    async refreshUserList() {
        if (DrawersManager) await DrawersManager.init();
    }
};

// --- ARRANQUE DEL SISTEMA TRAS LOGIN ---

async function finishLogin() {
    // Cerrar cortina de login
    const loginDrawer = document.getElementById('loginDrawer');
    if (loginDrawer) loginDrawer.classList.remove('open');
    
    try {
        log("Cargando módulos clínicos...");
        
        // Cargar módulos (Consultas, Pacientes, Documentos)
        const loaded = await ServiceLoader.init();
        if (!loaded) throw new Error("Fallo en ServiceLoader");
        
        // Re-renderizar toolbar con el usuario activo
        initToolbarEvents();
        
        // Vincular lógica de pacientes
        const PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;

        // Bindeos del formulario de paciente
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
        
        // Click en visitas
        const visits = document.getElementById('visitsContainer');
        if (visits) visits.onclick = handleVisitClicks;

        // Bienvenida
        setTimeout(() => {
            if(PatientService) PatientService.toggleConditionalFields();
            const name = STATE.currentUser?.profile?.firstname || "Usuario";
            log(`Bienvenido/a, ${name}`);
            flash(`Sesión iniciada: ${name}`); 
        }, 300);

    } catch (e) { 
        console.error("--> Error Fatal en finishLogin:", e); 
        log("Error crítico: " + e.message, true); 
    }
}

function handleVisitClicks(e) {
    // Lógica para expandir/colapsar tarjetas
    const btnToggle = e.target.closest('.visit-toggle-btn');
    if (btnToggle) { 
        const card = btnToggle.closest('.visit-card');
        const body = card.querySelector('.visit-body');
        const icon = btnToggle.querySelector('i'); 
        body.classList.toggle('hidden');
        icon.className = body.classList.contains('hidden') ? 'bi bi-chevron-right' : 'bi bi-chevron-down';
    }

    // Lógica de chips
    if (e.target.classList.contains('chip')) {
        e.target.classList.toggle('active');
    }
    
    // Botones de documentos (Usando el nuevo sistema unificado)
    if (e.target.closest('.btn-docs') || e.target.closest('.btn-inf')) {
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
