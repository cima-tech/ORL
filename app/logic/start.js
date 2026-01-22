// app/logic/start.js
import { log, loadUserConfig, STATE, flash } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { initToolbarEvents } from 'toolbar';
import { DrawersManager } from './drawers.js';

export const StartManager = {
    async init() {
        console.log("--> StartManager.init() iniciado");
        
        // 1. PINTAR INTERFAZ PRIMERO (Toolbar y Botones visibles YA)
        initToolbarEvents();
        
        // 2. Registrar el listener de Login
        document.addEventListener('login-success', () => {
            console.log("--> Evento login-success capturado. Arrancando...");
            finishLogin();
        });

        // 3. Eventos globales de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                const drawer = document.getElementById('consoleDrawer');
                if (drawer) drawer.classList.toggle('open');
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.login-drawer.open, .config-drawer.open').forEach(el => {
                    // No cerrar login con escape si no hay usuario
                    if (el.id === 'loginDrawer' && STATE.currentUser.profile.id === 'guest') return;
                    el.classList.remove('open');
                });
                // Cerrar overlay también
                const overlay = document.getElementById('drawerOverlay');
                if(overlay) overlay.classList.remove('visible');
            }
        });

        // 4. Inicializar Lógica de Drawers (Carga datos en 2do plano)
        // Usamos await aquí pero la toolbar ya está visible, así que no parece "colgado"
        await DrawersManager.init();

        // 5. Aplicar tema inicial (si hay uno guardado previo sin login)
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;
        
        console.log("--> Sistema listo. Esperando usuario.");
    },

    async refreshUserList() {
        if (DrawersManager) await DrawersManager.init();
    }
};

// --- FUNCIÓN PRINCIPAL DE ARRANQUE TRAS LOGIN ---

async function finishLogin() {
    // Cerrar drawers manuales si quedaron abiertos
    DrawersManager.closeAll();

    try {
        log("Cargando módulos clínicos...");
        
        const loaded = await ServiceLoader.init();
        if (!loaded) throw new Error("ServiceLoader falló");
        
        // ACTUALIZAR Toolbar (Para mostrar avatar y menú de usuario)
        initToolbarEvents();
        
        // --- FIX TEMAS (Falla 4) ---
        // Aplicar el tema del perfil cargado inmediatamente
        if(STATE.currentUser && STATE.currentUser.preferences) {
            const userTheme = STATE.currentUser.preferences.theme || 'glass';
            document.body.className = `theme-${userTheme}`;
            log(`Tema aplicado: ${userTheme}`);
        }
        // ------------------------------

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
