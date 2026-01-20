import { log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from './service_loader.js'; // Importa el archivo limpio
import { initToolbarEvents } from 'toolbar';
import { DrawersManager } from './drawers.js'; // Importar para inicializar

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

        // Cargar usuarios HYBRIDA (JSON + LocalStorage)
        try {
            // 1. Fetch original
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            
            // 2. Fetch local
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            
            // 3. Fusionar (Prioridad a LocalStorage si hay conflicto por id/username, aqui solo concatenamos)
            const mergedUsers = [...originalUsers, ...localDB];
            
            this.renderUserList(mergedUsers);
        } catch (e) { 
            console.error(e); 
            log("Error cargando usuarios", true); 
        }

        // Inicializar toolbar
        initToolbarEvents();
        
        // Inicializar DrawersManager (Inyecta HTML nuevo)
        DrawersManager.init();
        
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
        document.body.className = `theme-${savedTheme}`;
    },

    renderUserList(users) {
        const list = document.getElementById('user-list-container');
        if(!list) return;
        list.innerHTML = users.map(u => {
            const savedImg = localStorage.getItem(`CIMA_IMG_${u.id}_avatar`);
            const hasImg = savedImg || (u.avatar && u.avatar !== "");
            const avatarHtml = hasImg 
                ? `<div class="user-avatar-lg" style="background-image: url('${savedImg || u.avatar}'); background-size:cover;"></div>` 
                : `<div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>`;

            const roleDisplay = u.specialty || u.role;

            return `
            <div class="user-wrapper" id="user-wrapper-${u.id}">
                <div class="user-card-content" onclick="selectUser('${u.id}', '${u.config_path}')">
                    ${avatarHtml}
                    <div class="user-info">
                        <h3>${u.name}</h3>
                        <p>${roleDisplay}</p>
                        <span class="username">@${u.username}</span>
                    </div>
                </div>
                <div id="pwd-area-${u.id}" class="password-area hidden">
                    <div style="position:relative;">
                        <input type="password" id="pwd-input-${u.id}" class="login-input" placeholder="Contraseña" onkeypress="if(event.key==='Enter') verifyPassword('${u.id}')" onclick="event.stopPropagation(); this.focus()">
                        <i class="bi bi-lock-fill" style="position:absolute; right:10px; top:10px; color:#64748b;"></i>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // Nueva función para refrescar la lista tras crear usuario
    async refreshUserList() {
        try {
            const response = await fetch('./app/catalog/users.json');
            const originalUsers = await response.json();
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            const mergedUsers = [...originalUsers, ...localDB];
            this.renderUserList(mergedUsers);
        } catch(e) { console.error(e); }
    }
};

async function selectUser(id, configPath) {
    document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
    
    // Cargar config local si existe (prioridad) o del JSON
    const localConfig = localStorage.getItem(`CIMA_USER_CONFIG_${id}`);
    
    if(localConfig) { 
        try { 
            STATE.currentUser = JSON.parse(localConfig); 
            log("Config local cargada para " + id); 
        } catch(e) { await loadUserConfig(configPath); } 
    } else { 
        await loadUserConfig(configPath); 
    }

    const pwd = STATE.currentUser.profile.password;

    if (pwd) { 
        const area = document.getElementById(`pwd-area-${id}`); 
        area.classList.remove('hidden'); 
        document.getElementById(`pwd-input-${id}`).focus(); 
    } else { 
        finishLogin(); 
    }
}

function verifyPassword(id) {
    const input = document.getElementById(`pwd-input-${id}`);
    const actual = STATE.currentUser.profile.password;
    if (input.value === actual) { 
        finishLogin(); 
    } else { 
        input.style.borderColor = "#ef4444"; 
        input.classList.add('shake'); 
        log("Contraseña incorrecta", true); 
        setTimeout(() => { input.style.borderColor = ""; input.classList.remove('shake'); }, 500); 
    }
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
    if(btn) { 
        btn.closest('.visit-card').querySelector('.visit-body').classList.toggle('hidden'); 
        const i = btn.querySelector('i'); 
        i.classList.toggle('bi-chevron-right'); 
        i.classList.toggle('bi-chevron-down'); 
    }
    if(e.target.classList.contains('chip')) e.target.classList.toggle('active');
    if(e.target.closest('.btn-inf')) window.openDocGlobal('INF', e.target.closest('.visit-card').id);
    if(e.target.closest('.btn-rp')) window.openDocGlobal('RP', e.target.closest('.visit-card').id);
}

window.selectUser = selectUser;
window.verifyPassword = verifyPassword;
window.refreshUserList = () => StartManager.refreshUserList();
