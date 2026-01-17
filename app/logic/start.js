// app/logic/start.js
import { $, log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';

let PatientService = null;

export const StartManager = {
    async init() {
        const loginScreen = document.getElementById('login-screen');
        if(loginScreen) loginScreen.classList.remove('hidden');
        
        // Atajo teclado Consola
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                document.getElementById('consoleDrawer').classList.toggle('open');
            }
        });

        try {
            const response = await fetch('./app/catalog/users.json');
            const users = await response.json();
            this.renderUserList(users);
        } catch (e) {
            console.error(e); log("Error cargando usuarios", true);
        }
    },

    renderUserList(users) {
        const list = document.getElementById('user-list-container');
        if(!list) return;
        
        list.innerHTML = users.map(u => {
            const hasImg = u.avatar && u.avatar !== "";
            const avatarHtml = hasImg 
                ? `<div class="user-avatar-lg" style="background-image: url('${u.avatar}'); color:transparent;"></div>`
                : `<div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>`;

            return `
            <div class="user-wrapper" style="margin-bottom:10px;">
                <div class="user-card" onclick="window.selectUser('${u.id}', '${u.config_path}')">
                    ${avatarHtml}
                    <div class="user-info">
                        <h3>${u.name}</h3>
                        <p>${u.role}</p>
                        <p style="font-size:0.75rem; opacity:0.5; margin-top:2px;">@${u.username}</p>
                    </div>
                    <i class="bi bi-chevron-right" style="margin-left:auto; opacity:0.5;"></i>
                </div>
                <div id="pwd-area-${u.id}" class="password-prompt hidden">
                    <input type="password" id="pwd-input-${u.id}" class="form-input" 
                           placeholder="Contraseña..." style="text-align:center;"
                           onkeypress="if(event.key==='Enter') window.verifyPassword('${u.id}')">
                </div>
            </div>
            `;
        }).join('');
    }
};

window.selectUser = async (id, configPath) => {
    // Ocultar otros inputs
    document.querySelectorAll('.password-prompt').forEach(el => el.classList.add('hidden'));
    
    // Cargar config para validar requerimiento de pass
    await loadUserConfig(configPath);
    const pwd = STATE.currentUser.profile.password;

    if (pwd) {
        const area = document.getElementById(`pwd-area-${id}`);
        area.classList.remove('hidden');
        document.getElementById(`pwd-input-${id}`).focus();
    } else {
        finishLogin();
    }
};

window.verifyPassword = (id) => {
    const input = document.getElementById(`pwd-input-${id}`);
    const actual = STATE.currentUser.profile.password;
    if (input.value === actual) {
        finishLogin();
    } else {
        input.classList.add('input-error');
        log("Contraseña incorrecta", true);
        setTimeout(() => input.classList.remove('input-error'), 500);
    }
};

async function finishLogin() {
    const loginScreen = document.getElementById('login-screen');
    const box = loginScreen.querySelector('.login-box');
    
    // Animación de salida
    box.style.transform = "scale(0.95)";
    box.style.opacity = "0";

    try {
        log("Cargando módulos...");
        if (!await ServiceLoader.init()) throw new Error("Fallo en ServiceLoader");
        
        initToolbarEvents();
        
        // Hooks Globales
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = $;

        // Listeners Globales
        const form = document.getElementById('patientForm');
        if(form) form.addEventListener('change', (e) => {
             if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'].includes(e.target.id)) PatientService.updatePatientHeader();
             if(e.target.id.includes('nacimiento')) PatientService.calcularCampos();
             if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
        });
        
        // Delegación de eventos (Chips, Cards, Preview)
        const visits = document.getElementById('visitsContainer');
        if(visits) visits.addEventListener('click', handleVisitClicks);

        setTimeout(() => {
            loginScreen.classList.add('hidden');
            PatientService.toggleConditionalFields();
        }, 300);
    } catch (e) { console.error(e); log(e.message, true); }
}

function handleVisitClicks(e) {
    // Expandir/Colapsar Card
    const btn = e.target.closest('.visit-toggle-btn');
    if(btn) {
        btn.closest('.visit-card').querySelector('.visit-body').classList.toggle('hidden');
        const i = btn.querySelector('i');
        i.classList.toggle('bi-chevron-right'); i.classList.toggle('bi-chevron-down');
    }
    // Chips Interactivos
    if(e.target.classList.contains('chip')) {
        e.target.classList.toggle('active');
        // (Futuro: Lógica para insertar texto en textarea)
    }
    // Botones Preview (Redirigen a Toolbar Preview)
    if(e.target.closest('.btn-inf')) window.openDocGlobal('INF', e.target.closest('.visit-card').id);
    if(e.target.closest('.btn-rp')) window.openDocGlobal('RP', e.target.closest('.visit-card').id);
}
