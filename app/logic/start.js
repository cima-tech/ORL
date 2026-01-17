// app/logic/start.js
import { $, flash, loadUserConfig } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';
import { ServiceLoader as SL } from 'service_loader'; // Alias para uso interno

// Referencias a servicios que se cargarán después
let PatientService = null;

export const StartManager = {
    
    async init() {
        // 1. Mostrar pantalla de carga/login
        const loginScreen = document.getElementById('login-screen');
        if(loginScreen) loginScreen.classList.remove('hidden');

        try {
            // 2. Cargar lista de usuarios disponibles
            const response = await fetch('./app/catalog/users.json');
            const users = await response.json();
            
            // 3. Renderizar lista
            this.renderUserList(users);
            
        } catch (e) {
            console.error(e);
            flash("Error cargando lista de usuarios", true);
        }
    },

    renderUserList(users) {
        const list = document.getElementById('user-list-container');
        if(!list) return;
        
        list.innerHTML = users.map(u => `
            <div class="user-card animate-fade" onclick="window.attemptLogin('${u.config_path}')">
                <div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>
                <div class="user-info">
                    <h3>${u.name}</h3>
                    <p>${u.role}</p>
                </div>
                <i class="bi bi-chevron-right"></i>
            </div>
        `).join('');
    }
};

// Función global para el onclick del HTML
window.attemptLogin = async (configPath) => {
    const loginScreen = document.getElementById('login-screen');
    
    // 1. Efecto visual
    if(loginScreen) loginScreen.classList.add('loading');
    
    try {
        // 2. Cargar Brain (Configuración del usuario seleccionado)
        const userLoaded = await loadUserConfig(configPath);
        if (!userLoaded) throw new Error("Error cargando perfil");

        // 3. Cargar Servicios (Cartucho ORL)
        const servicesLoaded = await ServiceLoader.init();
        if (!servicesLoaded) throw new Error("Error cargando servicios");

        // 4. Iniciar UI (Toolbar)
        initToolbarEvents();

        // 5. Hooks Globales (Patient Service ahora sí existe)
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = $; // jQuery-like global

        // 6. Listeners del DOM (Formulario)
        attachGlobalListeners();

        // 7. Ocultar Login y Mostrar App
        setTimeout(() => {
            if(loginScreen) {
                loginScreen.style.opacity = '0';
                setTimeout(() => loginScreen.classList.add('hidden'), 500);
            }
            // Inicializar checkboxes y otros estados
            PatientService.toggleConditionalFields();
        }, 800); // Pequeño delay dramático

    } catch (e) {
        console.error(e);
        flash(e.message, true);
        if(loginScreen) loginScreen.classList.remove('loading');
    }
};

function attachGlobalListeners() {
    const formContainer = document.getElementById('patientForm');
    if(formContainer) {
        formContainer.addEventListener('change', (e) => {
            const t = e.target.id;
            if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido','documento_tipo','documento_numero'].includes(t)) PatientService.updatePatientHeader();
            if(['fecha_nacimiento','peso_kg','talla_cm'].includes(t)) PatientService.calcularCampos();
            if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
        });
    }
    
    // Delegación Visitas
    const visits = document.getElementById('visitsContainer');
    if(visits) {
        visits.addEventListener('click', (e) => {
            const btn = e.target.closest('.visit-toggle-btn');
            if(btn) {
                btn.closest('.visit-card').querySelector('.visit-body').classList.toggle('hidden');
                const i = btn.querySelector('i');
                i.classList.toggle('bi-chevron-right'); i.classList.toggle('bi-chevron-down');
            }
            if(e.target.closest('.btn-inf')) window.openDocGlobal('INF', e.target.closest('.visit-card').id);
            if(e.target.closest('.btn-rp')) window.openDocGlobal('RP', e.target.closest('.visit-card').id);
        });
    }
}
