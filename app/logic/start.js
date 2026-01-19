import { $, log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';

let PatientService = null;

export const StartManager = {
    async init() {
        // Inicializar toolbar inmediatamente (muestra botón login)
        initToolbarEvents();
        
        // Cargar lista de usuarios para el drawer
        try {
            const response = await fetch('./app/catalog/users.json');
            const users = await response.json();
            this.renderUserList(users);
        } catch (e) { 
            console.error(e); 
            log("Error cargando usuarios", true); 
        }

        // Atajo teclado para console drawer
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                document.getElementById('consoleDrawer').classList.toggle('open');
            }
        });
    },

    renderUserList(users) {
        const list = document.getElementById('user-list-container');
        if(!list) return;
        
        list.innerHTML = users.map(u => {
            const hasImg = u.avatar && u.avatar !== "";
            const avatarHtml = hasImg 
                ? `<div class="user-avatar-lg" style="background-image: url('${u.avatar}'); color:transparent;"></div>`
                : `<div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>`;

            // Normalizar mayúsculas para display
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
    document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
    
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
        input.style.borderColor = "var(--danger)";
        log("Contraseña incorrecta", true);
        setTimeout(() => input.style.borderColor = "var(--primary)", 500);
    }
};

async function finishLogin() {
    const loginDrawer = document.getElementById('loginDrawer');
    loginDrawer.classList.remove('open');
    
    try {
        log("Cargando módulos...");
        if (!await ServiceLoader.init()) throw new Error("Fallo en ServiceLoader");
        
        // Re-renderizar toolbar con usuario logueado
        initToolbarEvents();
        
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = $;

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
            log(`Bienvenido/a ${STATE.currentUser.profile.name}`);
        }, 300);
    } catch (e) { 
        console.error(e); 
        log(e.message, true); 
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
