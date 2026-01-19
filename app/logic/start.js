// app/logic/start.js - VERSIÓN CORREGIDA
import { log as brainLog, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';

// Helpers locales (NO usar nombres conflictivos)
const $local = (selector) => document.querySelector(selector);
const $$local = (selector) => Array.from(document.querySelectorAll(selector));

let PatientService = null;

export const StartManager = {
    async init() {
        // Inicializar eventos globales
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                $local('#consoleDrawer').classList.toggle('open');
            }
            if (e.key === 'Escape') {
                $local('.login-drawer.open')?.classList.remove('open');
                $local('.config-drawer.open')?.classList.remove('open');
            }
        });

        // Cargar usuarios para login
        try {
            const response = await fetch('./app/catalog/users.json');
            const users = await response.json();
            this.renderUserList(users);
        } catch (e) { 
            console.error(e); 
            brainLog("Error cargando usuarios", true); 
        }

        // Inicializar toolbar
        initToolbarEvents();
        
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;
    },

    renderUserList(users) {
        const list = $local('#user-list-container');
        if(!list) return;
        
        list.innerHTML = users.map(u => {
            const hasImg = u.avatar && u.avatar !== "";
            const avatarHtml = hasImg 
                ? `<div class="user-avatar-lg" style="background-image: url('${u.avatar}');"></div>`
                : `<div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>`;

            const roleDisplay = u.Specialty || u.role;

            return `
            <div class="user-wrapper" id="user-wrapper-${u.id}">
                <div class="user-card-content" onclick="window.selectUser('${u.id}', '${u.config_path}')">
                    ${avatarHtml}
                    <div class="user-info">
                        <h3>${u.name}</h3>
                        <p>${roleDisplay}</p>
                        <span class="username">@${u.username}</span>
                    </div>
                </div>
                <div id="pwd-area-${u.id}" class="password-area hidden">
                    <input type="password" id="pwd-input-${u.id}" class="login-input" 
                           placeholder="Contraseña" 
                           onkeypress="if(event.key==='Enter') window.verifyPassword('${u.id}')"
                           onclick="event.stopPropagation()">
                </div>
            </div>`;
        }).join('');
    }
};

window.selectUser = async (id, configPath) => {
    $$local('.password-area').forEach(el => el.classList.add('hidden'));
    
    await loadUserConfig(configPath);
    const pwd = STATE.currentUser.profile.password;

    if (pwd) {
        const area = $local(`#pwd-area-${id}`);
        area.classList.remove('hidden');
        $local(`#pwd-input-${id}`).focus();
    } else {
        finishLogin();
    }
};

window.verifyPassword = (id) => {
    const input = $local(`#pwd-input-${id}`);
    const actual = STATE.currentUser.profile.password;
    if (input.value === actual) {
        finishLogin();
    } else {
        input.style.borderColor = "#ef4444";
        brainLog("Contraseña incorrecta", true);
        setTimeout(() => input.style.borderColor = "", 500);
    }
};

async function finishLogin() {
    const loginDrawer = $local('#loginDrawer');
    loginDrawer.classList.remove('open');
    
    try {
        brainLog("Cargando módulos...");
        if (!await ServiceLoader.init()) throw new Error("Fallo en ServiceLoader");
        
        // Re-renderizar toolbar con usuario logueado
        initToolbarEvents();
        
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = $local; // Asignamos al global

        // Configurar listeners del formulario paciente
        const form = $local('#patientForm');
        if(form) form.addEventListener('change', (e) => {
             if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'].includes(e.target.id)) 
                 PatientService.updatePatientHeader();
             if(e.target.id.includes('nacimiento')) PatientService.calcularCampos();
             if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
        });
        
        const visits = $local('#visitsContainer');
        if(visits) visits.addEventListener('click', handleVisitClicks);

        setTimeout(() => {
            PatientService.toggleConditionalFields();
            brainLog(`Bienvenido/a ${STATE.currentUser.profile.name}`);
        }, 300);
    } catch (e) { 
        console.error(e); 
        brainLog(e.message, true); 
    }
}

function handleVisitClicks(e) {
    const btn = e.target.closest('.visit-toggle-btn');
    if(btn) {
        btn.closest('.visit-card').querySelector('.visit-body').classList.toggle('hidden');
        const i = btn.querySelector('i');
        i.classList.toggle('bi-chevron-right'); 
        i.classList.toggle('bi-chevron-down');
    }
    if(e.target.classList.contains('chip')) {
        e.target.classList.toggle('active');
    }
    if(e.target.closest('.btn-inf')) window.openDocGlobal('INF', e.target.closest('.visit-card').id);
    if(e.target.closest('.btn-rp')) window.openDocGlobal('RP', e.target.closest('.visit-card').id);
}
