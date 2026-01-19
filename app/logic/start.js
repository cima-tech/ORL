import { $, log, loadUserConfig, STATE } from 'brain';
import { ServiceLoader } from 'service_loader';
import { initToolbarEvents } from 'toolbar';

let PatientService = null;


const LOCAL_USER_DB_KEY = 'CIMA_USERS_LOCAL_V1';
const LOCAL_USERCFG_PREFIX = 'CIMA_USERCFG_';
const LOCAL_RECENTS_KEY = 'CIMA_RECENT_USERS_V1';

function readLocalUsers() {
    try { return JSON.parse(localStorage.getItem(LOCAL_USER_DB_KEY) || '[]'); } catch { return []; }
}
function writeLocalUsers(list) {
    localStorage.setItem(LOCAL_USER_DB_KEY, JSON.stringify(list || []));
}
function pushRecent(userId) {
    const list = (()=>{ try { return JSON.parse(localStorage.getItem(LOCAL_RECENTS_KEY) || '[]'); } catch { return []; } })();
    const next = [userId, ...list.filter(x=>x!==userId)].slice(0, 6);
    localStorage.setItem(LOCAL_RECENTS_KEY, JSON.stringify(next));
}
function getRecents() {
    try { return JSON.parse(localStorage.getItem(LOCAL_RECENTS_KEY) || '[]'); } catch { return []; }
}
async function fileToDataURL(file) {
    if (!file) return "";
    return new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => resolve("");
        r.readAsDataURL(file);
    });
}
function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}


export const StartManager = {
    async init() {
        const loginScreen = document.getElementById('login-screen');
        if(loginScreen) loginScreen.classList.add('hidden'); // legacy overlay off

        // Toolbar pre-login
        initToolbarEvents();
        window.openAuthDrawer?.('login');
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                document.getElementById('consoleDrawer').classList.toggle('open');
            }
        });

        try {
            const users = await this.loadUsersMerged();
            this.bindAuthDrawer();
            await this.loadModelsIntoSelect();
            this.renderUserList(users);
            this.renderRecents(users);
            document.getElementById('authOverlay')?.classList.remove('hidden');
        } catch (e) { console.error(e); log("Error cargando usuarios", true); }
    },

    
    bindAuthDrawer() {
        const ov = document.getElementById('authOverlay');
        const close = document.getElementById('btnCloseAuth');
        const tabL = document.getElementById('tabLogin');
        const tabC = document.getElementById('tabCreate');
        const pL = document.getElementById('authPaneLogin');
        const pC = document.getElementById('authPaneCreate');

        const setPane = (which) => {
            const isLogin = which === 'login';
            tabL?.classList.toggle('active', isLogin);
            tabC?.classList.toggle('active', !isLogin);
            pL?.classList.toggle('hidden', !isLogin);
            pC?.classList.toggle('hidden', isLogin);
        };

        tabL?.addEventListener('click', () => setPane('login'));
        tabC?.addEventListener('click', () => setPane('create'));
        close?.addEventListener('click', () => ov?.classList.add('hidden'));
        ov?.addEventListener('click', (e) => { if (e.target === ov) ov.classList.add('hidden'); });

        // Create user actions
        document.getElementById('btnCreateUser')?.addEventListener('click', () => this.handleCreateUser());
        document.getElementById('btnDownloadUser')?.addEventListener('click', () => this.handleDownloadUser());
    },

    async loadModelsIntoSelect() {
        const sel = document.getElementById('cu_model');
        if (!sel) return;
        try {
            const resp = await fetch('./app/catalog/models.json');
            const models = await resp.json();
            sel.innerHTML = Object.keys(models).map(id => `<option value="${id}">${id} — ${models[id].name || ''}</option>`).join('');
        } catch (e) { console.error(e); }
    },

    renderRecents(users) {
        const row = document.getElementById('recentUsersRow');
        if (!row) return;
        const rec = getRecents();
        const byId = Object.fromEntries((users||[]).map(u => [u.id, u]));
        const cards = rec.map(id => byId[id]).filter(Boolean).map(u => {
            const hasImg = u.avatar && u.avatar !== "";
            const avatarHtml = hasImg
                ? `<div class="user-avatar-lg" style="background-image:url('${u.avatar}'); color:transparent;"></div>`
                : `<div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>`;
            const roleDisplay = u.Specialty || u.role || '';
            return `<div class="user-wrapper" style="min-width:240px;" onclick="window.selectUser('${u.id}', '${u.config_path || ''}')">
                      <div class="user-card-content">
                        ${avatarHtml}
                        <div class="user-info">
                          <h3>${u.name}</h3>
                          <p>${roleDisplay}</p>
                          <span class="username">@${u.username}</span>
                        </div>
                      </div>
                    </div>`;
        }).join('');
        row.innerHTML = cards || `<div class="muted">Aún no hay usuarios recientes.</div>`;
    },

    async loadUsersMerged() {
        const remoteResp = await fetch('./app/catalog/users.json');
        const remote = await remoteResp.json();
        const local = readLocalUsers();
        // merge by id, local overrides
        const mapu = new Map(remote.map(u => [u.id, u]));
        local.forEach(u => mapu.set(u.id, u));
        return Array.from(mapu.values());
    },

    async handleDownloadUser() {
        const cfg = await this.buildUserConfigFromForm();
        downloadText('user.json', JSON.stringify(cfg, null, 2));
    },

    async handleCreateUser() {
        const users = await this.loadUsersMerged();
        const newUser = await this.buildUserPublicFromForm();
        const cfg = await this.buildUserConfigFromForm();

        // Save public user entry
        const local = readLocalUsers();
        const nextLocal = [newUser, ...local.filter(u => u.id !== newUser.id)];
        writeLocalUsers(nextLocal);

        // Save config in localStorage
        localStorage.setItem(LOCAL_USERCFG_PREFIX + newUser.id, JSON.stringify(cfg));

        // Refresh list
        const merged = await this.loadUsersMerged();
        this.renderUserList(merged);
        this.renderRecents(merged);

        log(`Usuario creado: ${newUser.username}`);
        // Switch to login
        document.getElementById('tabLogin')?.click();
    },

    async buildUserPublicFromForm() {
        const id = (document.getElementById('cu_id')?.value || '').trim() || ('u' + Math.floor(Math.random()*900+100));
        const username = (document.getElementById('cu_username')?.value || '').trim() || id;
        const name = (document.getElementById('cu_name')?.value || '').trim() || username;
        const Title = (document.getElementById('cu_title')?.value || '').trim();
        const Specialty = (document.getElementById('cu_specialty')?.value || '').trim();
        const model = document.getElementById('cu_model')?.value || 'ORL-001';

        const avatarFile = document.getElementById('cu_avatar')?.files?.[0];
        const avatar = await fileToDataURL(avatarFile);

        return {
            id,
            username,
            name,
            role: "doctor",
            Title,
            Specialty,
            avatar: avatar || "",
            config_path: "" // localStorage backed
        };
    },

    async buildUserConfigFromForm() {
        const id = (document.getElementById('cu_id')?.value || '').trim() || ('u' + Math.floor(Math.random()*900+100));
        const username = (document.getElementById('cu_username')?.value || '').trim() || id;
        const password = (document.getElementById('cu_password')?.value || '').trim();
        const Title = (document.getElementById('cu_title')?.value || '').trim();
        const name = (document.getElementById('cu_name')?.value || '').trim();
        const Specialty = (document.getElementById('cu_specialty')?.value || '').trim();
        const location = (document.getElementById('cu_location')?.value || '').trim();

        const model = document.getElementById('cu_model')?.value || 'ORL-001';

        const header = await fileToDataURL(document.getElementById('cu_header')?.files?.[0]);
        const footer = await fileToDataURL(document.getElementById('cu_footer')?.files?.[0]);
        const signature = await fileToDataURL(document.getElementById('cu_signature')?.files?.[0]);
        const stamp = await fileToDataURL(document.getElementById('cu_stamp')?.files?.[0]);
        const avatar = await fileToDataURL(document.getElementById('cu_avatar')?.files?.[0]);

        return {
            profile: {
                id,
                role: "doctor",
                username,
                password: password || "",
                title: Title,
                firstname: name.split(' ')[0] || name,
                lastname: name.split(' ').slice(1).join(' ') || "",
                title_line_1: Specialty,
                contact: {},
                location
            },
            professional: { specialty: Specialty },
            preferences: { theme: "dark", default_model: model },
            assets: {
                avatar_path: avatar || "",
                header_path: header || "",
                footer_path: footer || "",
                signature_path: signature || "",
                stamp_path: stamp || ""
            }
        };
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
    
    if (configPath) {
        await loadUserConfig(configPath);
    } else {
        const raw = localStorage.getItem(LOCAL_USERCFG_PREFIX + id);
        if (raw) {
            try {
                const cfg = JSON.parse(raw);
                STATE.currentUser = { ...STATE.currentUser, ...cfg };
                log(`Perfil cargado (local): ${STATE.currentUser.profile.username}`);
            } catch(e) { console.error(e); }
        } else {
            await loadUserConfig();
        }
    }
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
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.opacity = '0';
    
    try {
        STATE.AUTH.isLoggedIn = true;
        pushRecent(STATE.currentUser.profile.id);
        document.getElementById('authOverlay')?.classList.add('hidden');
        log("Cargando módulos...");
        if (!await ServiceLoader.init()) throw new Error("Fallo en ServiceLoader");
        
        initToolbarEvents();
        
        PatientService = ServiceLoader.get('patient');
        window.togglePatientDetailsGlobal = PatientService.togglePatientDetails;
        window.updatePatientHeaderGlobal = PatientService.updatePatientHeader;
        window.$ = $;

        const form = document.getElementById('patientForm');
        if(form) form.addEventListener('change', (e) => {
             if(['primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'].includes(e.target.id)) PatientService.updatePatientHeader();
             if(e.target.id.includes('nacimiento')) PatientService.calcularCampos();
             if(e.target.type === 'checkbox') PatientService.toggleConditionalFields();
        });
        
        const visits = document.getElementById('visitsContainer');
        if(visits) visits.addEventListener('click', handleVisitClicks);

        setTimeout(() => {
            loginScreen.classList.add('hidden');
            PatientService.toggleConditionalFields();
        }, 500);
    } catch (e) { console.error(e); log(e.message, true); }
}

function handleVisitClicks(e) {
    const btn = e.target.closest('.visit-toggle-btn');
    if(btn) {
        btn.closest('.visit-card').querySelector('.visit-body').classList.toggle('hidden');
        const i = btn.querySelector('i');
        i.classList.toggle('bi-chevron-right'); i.classList.toggle('bi-chevron-down');
    }
    if(e.target.classList.contains('chip')) {
        e.target.classList.toggle('active');
    }
    if(e.target.closest('.btn-inf')) window.openDocGlobal('INF', e.target.closest('.visit-card').id);
    if(e.target.closest('.btn-rp')) window.openDocGlobal('RP', e.target.closest('.visit-card').id);
}
