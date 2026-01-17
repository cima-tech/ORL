// app/logic/start.js
import { $, flash, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';

// Referencias a servicios que se cargarán después
let PatientService = null;

export const StartManager = {
    
    async init() {
        const loginScreen = document.getElementById('login-screen');
        if(loginScreen) loginScreen.classList.remove('hidden');

        try {
            // Cargar lista de usuarios
            const response = await fetch('./app/catalog/users.json');
            const users = await response.json();
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
            <div class="user-card animate-fade" onclick="window.prepareLogin('${u.config_path}')">
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

// 1. Preparar Login (Cargar config pero no iniciar aún)
window.prepareLogin = async (configPath) => {
    try {
        // Cargamos la config para ver si tiene password
        const userLoaded = await loadUserConfig(configPath);
        if (!userLoaded) throw new Error("No se pudo leer la configuración del usuario");

        const profile = STATE.currentUser.profile;

        if (profile.password) {
            // Si tiene password, pedirlo
            const pwd = prompt(`Ingrese contraseña para ${profile.username}:`);
            if (pwd === profile.password) {
                // Contraseña correcta
                finishLogin();
            } else {
                flash("Contraseña incorrecta", true);
            }
        } else {
            // Si no tiene password, pasar directo
            finishLogin();
        }

    } catch (e) {
        console.error(e);
        flash(e.message, true);
    }
};

// 2. Finalizar Login (Cargar Servicios y UI)
async function finishLogin() {
    const loginScreen = document.getElementById('login-screen');
    if(loginScreen) loginScreen.classList.add('loading');

    try {
        console.log("Iniciando carga de servicios...");
        
        // Cargar Servicios (Cartucho ORL)
        const servicesLoaded = await ServiceLoader.init();
        if (!servicesLoaded) throw new Error("Error crítico cargando servicios médicos");

        // Iniciar UI
        initToolbarEvents();

        // Hooks Globales
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = $;

        // Listeners
        attachGlobalListeners();

        // Ocultar Login
        setTimeout(() => {
            if(loginScreen) {
                loginScreen.style.opacity = '0';
                setTimeout(() => loginScreen.classList.add('hidden'), 500);
            }
            PatientService.toggleConditionalFields();
        }, 800);

    } catch (e) {
        console.error(e);
        flash(e.message, true);
        if(loginScreen) loginScreen.classList.remove('loading');
    }
}

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
