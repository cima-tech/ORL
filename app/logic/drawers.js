// app/logic/drawers.js
import { $, STATE, log, flash, showErr, loadUserConfig } from 'brain';
import { ExportManager } from 'export_manager';

export const DrawersManager = {
    catalog: [],
    rolesList: [],

    async init() {
        this.injectHTML();
        
        // CRÍTICO: Forzar cierre del Login para asegurar que arranque cerrado
        const loginDrawer = document.getElementById('loginDrawer');
        if(loginDrawer) loginDrawer.classList.remove('open');
        
        // Renderizar Login inicial (CERRADO)
        this.Login.render();

        try {
            log("Cargando catálogo de usuarios...");
            const [rolesRes, usersRes] = await Promise.all([
                fetch('./app/catalog/roles.json'),
                fetch('./app/catalog/users.json')
            ]);

            if(rolesRes.ok) {
                this.rolesList = await rolesRes.json();
            } else {
                console.warn("No se pudo cargar roles.json");
            }
            
            if(usersRes.ok) {
                const remoteCatalog = await usersRes.json();
                const localCatalog = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
                this.catalog = [...remoteCatalog, ...localCatalog];
                log(`Usuarios cargados: ${this.catalog.length}`);
            } else {
                console.warn("No se pudo cargar users.json. Dependiendo solo de LocalStorage.");
                // Si falla el fetch (ej. CORS), intentamos usar solo local
                this.catalog = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            }
            
            // Re-renderizar Login con datos actualizados
            this.Login.render();

        } catch (e) {
            console.error("Error cargando datos iniciales:", e);
            showErr("Error inicializando catálogo. Revisa la consola (F12).");
        }

        this.bindEvents();
    },

    injectHTML() {
        // Generador correcto de IDs: ID-Drawer y ID-Content
        const createDrawer = (id, icon, title) => `
            <div id="${id}" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi ${icon}"></i> ${title}</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="${id}-content"></div>
            </div>`;

        // Login Drawer SIN clase 'open'
        const loginHTML = `
            <div id="loginDrawer" class="login-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-lock"></i> Acceso Seguro</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="login-content" style="padding: 30px;"></div>
            </div>`;

        const overlayHTML = `<div id="drawerOverlay" class="drawer-overlay"></div>`;

        const html = `
            ${overlayHTML}
            ${loginHTML}
            ${createDrawer('configDrawer', 'bi-gear', 'Configuración')}
            ${createDrawer('createUserDrawer', 'bi-person-plus-fill', 'Crear Usuario')}
            ${createDrawer('exportDrawer', 'bi-share-fill', 'Exportar')}
            <div id="consoleDrawer">
                <div class="console-header"><span>SYSTEM LOG</span><span class="toggle-console">▼</span></div>
                <div id="consoleContent"></div>
            </div>
        `;
        
        if(!document.getElementById('loginDrawer')) {
            document.body.insertAdjacentHTML('beforeend', html);
        }
    },

    bindEvents() {
        document.querySelectorAll('.btn-close-drawer').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAll();
            });
        });

        const overlay = document.getElementById('drawerOverlay');
        if(overlay) {
            overlay.addEventListener('click', () => {
                this.closeAll();
            });
        }

        const ch = document.querySelector('#consoleDrawer .console-header');
        if(ch) ch.addEventListener('click', () => document.getElementById('consoleDrawer').classList.toggle('open'));
    },

    closeAll() {
        document.querySelectorAll('.login-drawer, .config-drawer').forEach(d => d.classList.remove('open'));
        const overlay = document.getElementById('drawerOverlay');
        if(overlay) overlay.classList.remove('visible');
    },

    openDrawer(elementId) {
        this.closeAll();
        const drawer = document.getElementById(elementId);
        if(drawer) {
            drawer.classList.add('open');
            const overlay = document.getElementById('drawerOverlay');
            if(overlay) overlay.classList.add('visible');
        } else {
            console.error(`Drawer no encontrado: ${elementId}`);
        }
    },

    // --- RENDERIZADOR COMPARTIDO ---
    renderSharedForm(user = null, isNew = false) {
        const u = user || {};
        const p = u.profile || { contact: {} };
        const prof = u.professional || {};
        const inst = u.institution || {};
        const comm = u.commercial || { schedule: {} };
        const pref = u.preferences || {};
        const doc = u.documents || { vertical: { page:{}, content_margins_cm: {} }, horizontal: { page:{}, content_margins_cm: {} } };
        const sec = u.security || {};
        const ast = u.assets || {};
        
        const px = isNew ? 'new-' : 'cfg-'; 

        let rolesOptions = '<option value="doctor">Médico</option>';
        if (DrawersManager.rolesList.length > 0) {
            rolesOptions = DrawersManager.rolesList.map(r => 
                `<option value="${r.role}" ${p.role===r.role ? 'selected' : ''}>${r.name}</option>`
            ).join('');
        }

        const renderDay = (key, label) => {
            const d = comm.schedule?.[key] || { active: false, start: '', end: '' };
            return `
            <div style="display:flex; gap:5px; align-items:center; margin-bottom:5px;">
                <input type="checkbox" id="${px}sch_${key}_active" ${d.active?'checked':''}>
                <div style="width:70px; font-size:0.85rem;">${label}</div>
                <input type="time" id="${px}sch_${key}_start" class="form-input" value="${d.start}" style="flex:1;">
                <input type="time" id="${px}sch_${key}_end" class="form-input" value="${d.end}" style="flex:1;">
            </div>`;
        };

        return `
        <div class="config-tabs">
            <button class="config-tab-btn active" onclick="DrawersManager.switchTab(this, 'tab-perfil-${px}')">1. Perfil</button>
            <button class="config-tab-btn" onclick="DrawersManager.switchTab(this, 'tab-prof-${px}')">2. Profesional</button>
            <button class="config-tab-btn" onclick="DrawersManager.switchTab(this, 'tab-sys-${px}')">3. Sistema</button>
            <button class="config-tab-btn" onclick="DrawersManager.switchTab(this, 'tab-img-${px}')">4. Gráficos</button>
        </div>
        <div id="tab-perfil-${px}" class="config-tab-content active">
            <div class="form-section"><div class="form-section-title">Datos Personales</div>
                <div class="form-grid">
                    <div class="span-2"><label class="form-label">Usuario</label><input id="${px}username" class="form-input" value="${p.username||''}" ${!isNew?'readonly':''}></div>
                    <div class="span-2"><label class="form-label">Contraseña</label><input id="${px}password" type="text" class="form-input" value="${p.password||''}"></div>
                    <div class="span-2"><label class="form-label">Rol</label><select id="${px}role" class="form-select">${rolesOptions}</select></div>
                    <div class="span-2"><label class="form-label">ID</label><input id="${px}id" class="form-input" value="${p.id||''}" readonly style="opacity:0.5"></div>
                    <div class="span-1"><label class="form-label">Título</label><input id="${px}title" class="form-input" value="${p.title||''}"></div>
                    <div class="span-1"><label class="form-label">1er Nombre</label><input id="${px}firstname" class="form-input" value="${p.firstname||''}"></div>
                    <div class="span-1"><label class="form-label">2do Nombre</label><input id="${px}secondname" class="form-input" value="${p.secondname||''}"></div>
                    <div class="span-1"><label class="form-label">1er Apellido</label><input id="${px}lastname" class="form-input" value="${p.lastname||''}"></div>
                    <div class="span-1"><label class="form-label">2do Apellido</label><input id="${px}secondlastname" class="form-input" value="${p.secondlastname||''}"></div>
                    <div class="span-1"><label class="form-label">Sangre</label><input id="${px}bloodtype" class="form-input" value="${p.bloodtype||''}"></div>
                    <div class="span-2"><label class="form-label">Ubicación</label><input id="${px}location" class="form-input" value="${p.location||''}"></div>
                </div>
            </div>
            <div class="form-section"><div class="form-section-title">Presentación y Contacto</div>
                <div class="form-grid">
                     <div class="span-2"><label class="form-label">Título L1 (Esp)</label><input id="${px}title_line_1" class="form-input" value="${p.title_line_1||''}"></div>
                     <div class="span-2"><label class="form-label">Título L2 (Inst)</label><input id="${px}title_line_2" class="form-input" value="${p.title_line_2||''}"></div>
                     <div class="span-2"><label class="form-label">Email 1</label><input id="${px}email" class="form-input" value="${p.contact?.email||''}"></div>
                     <div class="span-2"><label class="form-label">Email 2</label><input id="${px}email2" class="form-input" value="${p.contact?.email2||''}"></div>
                     <div class="span-2"><label class="form-label">Tlf 1</label><input id="${px}phone" class="form-input" value="${p.contact?.phone||''}"></div>
                     <div class="span-2"><label class="form-label">Tlf 2</label><input id="${px}phone2" class="form-input" value="${p.contact?.phone2||''}"></div>
                     <div class="span-4"><label class="form-label">Instagram</label><input id="${px}instagram" class="form-input" value="${p.contact?.instagram||''}"></div>
                </div>
            </div>
        </div>
        <div id="tab-prof-${px}" class="config-tab-content">
            <div class="form-section"><div class="form-section-title">Información Profesional</div>
                <div class="form-grid">
                    <div class="span-4"><label class="form-label">Especialidad</label><input id="${px}specialty" class="form-input" value="${prof.specialty||''}"></div>
                    <div class="span-2"><label class="form-label">MPPS</label><input id="${px}license" class="form-input" value="${prof.license_number||''}"></div>
                    <div class="span-2"><label class="form-label">CMM</label><input id="${px}college" class="form-input" value="${prof.college||''}"></div>
                    <div class="span-4"><label class="form-label">Firma (Texto)</label><input id="${px}siglabel" class="form-input" value="${prof.signature_label||''}"></div>
                    <div class="span-4"><label class="form-label">Legal Footer</label><input id="${px}legal" class="form-input" value="${prof.legal_footer||''}"></div>
                </div>
            </div>
            <div class="form-section"><div class="form-section-title">Institución y Comercial</div>
                <div class="form-grid">
                    <div class="span-2"><label class="form-label">Institución</label><input id="${px}inst_name" class="form-input" value="${inst.name||''}"></div>
                    <div class="span-2"><label class="form-label">Servicio</label><input id="${px}inst_service" class="form-input" value="${inst.service||''}"></div>
                    <div class="span-4"><label class="form-label">Dirección</label><input id="${px}inst_addr" class="form-input" value="${inst.address||''}"></div>
                    <div class="span-1"><label class="form-label">Moneda</label><input id="${px}currency" class="form-input" value="${comm.currency||'USD'}"></div>
                    <div class="span-1"><label class="form-label">Monto</label><input id="${px}fee" type="number" class="form-input" value="${comm.consultation_fee||0}"></div>
                    <div class="span-2"><label class="form-label">Info Pago</label><input id="${px}pay" class="form-input" value="${comm.payment_infos||''}"></div>
                </div>
            </div>
            <div class="form-section"><div class="form-section-title">Horarios</div>
                ${renderDay('monday', 'Lunes')}${renderDay('tuesday', 'Martes')}${renderDay('wednesday', 'Miérc')}${renderDay('thursday', 'Jueves')}${renderDay('friday', 'Viernes')}${renderDay('saturday', 'Sábado')}</div>
        </div>
        <div id="tab-sys-${px}" class="config-tab-content">
            <div class="form-section"><div class="form-section-title">Preferencias</div>
                <div class="form-grid">
                    <div class="span-2"><label class="form-label">Tema</label>
                        <select id="${px}theme" class="form-select">
                            <option value="glass" ${pref.theme==='glass'?'selected':''}>Glass</option>
                            <option value="liquid" ${pref.theme==='liquid'?'selected':''}>Liquid</option>
                            <option value="light" ${pref.theme==='light'?'selected':''}>Light</option>
                        </select>
                    </div>
                    <div class="span-2"><label class="form-label">Color</label><input type="color" id="${px}color" class="form-input" value="${pref.primary_color||'#0ea5e9'}"></div>
                    <div class="span-2"><label class="form-label">Zoom</label><input type="number" id="${px}zoom" class="form-input" value="${pref.default_zoom||60}"></div>
                    <div class="span-2"><label class="form-label">Firma Default</label>
                        <select id="${px}sig_def" class="form-select">
                            <option value="true" ${pref.use_digital_signature_default?'selected':''}>Sí</option>
                            <option value="false" ${!pref.use_digital_signature_default?'selected':''}>No</option>
                        </select>
                    </div>
                    <div class="span-4"><label class="form-label">Modelo Default</label>
                        <select id="${px}model" class="form-select">
                            <option value="ORL-001" ${pref.default_model==='ORL-001'?'selected':''}>ORL-001</option>
                            <option value="GEN-001" ${pref.default_model==='GEN-001'?'selected':''}>GEN-001</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="form-section"><div class="form-section-title">Documentos (Márgenes cm)</div>
                <div style="font-weight:bold; color:var(--primary);">Vertical</div>
                <div class="form-grid">
                    <div class="span-1"><input type="number" step="0.1" id="${px}v_top" class="form-input" value="${doc.vertical?.content_margins_cm?.top||1}"></div>
                    <div class="span-1"><input type="number" step="0.1" id="${px}v_bottom" class="form-input" value="${doc.vertical?.content_margins_cm?.bottom||1}"></div>
                    <div class="span-1"><input type="number" step="0.1" id="${px}v_left" class="form-input" value="${doc.vertical?.content_margins_cm?.left||1}"></div>
                    <div class="span-1"><input type="number" step="0.1" id="${px}v_right" class="form-input" value="${doc.vertical?.content_margins_cm?.right||1}"></div>
                </div>
                <div style="font-weight:bold; color:var(--primary);">Horizontal</div>
                <div class="form-grid">
                    <div class="span-1"><input type="number" step="0.1" id="${px}h_top" class="form-input" value="${doc.horizontal?.content_margins_cm?.top||1}"></div>
                    <div class="span-1"><input type="number" step="0.1" id="${px}h_bottom" class="form-input" value="${doc.horizontal?.content_margins_cm?.bottom||1}"></div>
                    <div class="span-1"><input type="number" step="0.1" id="${px}h_left" class="form-input" value="${doc.horizontal?.content_margins_cm?.left||1}"></div>
                    <div class="span-1"><input type="number" step="0.1" id="${px}h_right" class="form-input" value="${doc.horizontal?.content_margins_cm?.right||1}"></div>
                </div>
            </div>
            <div class="form-section"><div class="form-section-title">Seguridad</div>
                <div class="form-grid">
                    <div class="span-2"><label class="form-label">Auto-Lock (min)</label><input type="number" id="${px}autolock" class="form-input" value="${sec.auto_lock_minutes||15}"></div>
                    <div class="span-2"><label class="form-label">Confirmar Borrado</label>
                        <select id="${px}confirm_del" class="form-select">
                            <option value="true" ${sec.require_confirm_before_delete?'selected':''}>Sí</option>
                            <option value="false" ${!sec.require_confirm_before_delete?'selected':''}>No</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div id="tab-img-${px}" class="config-tab-content">
            <div class="form-section"><div class="form-section-title">Archivos</div>
                ${this.renderUploader('Avatar', `${px}avatar`, ast.avatar_path)}${this.renderUploader('Header', `${px}header`, ast.header_path)}${this.renderUploader('Footer', `${px}footer`, ast.footer_path)}${this.renderUploader('Firma', `${px}signature`, ast.signature_path)}${this.renderUploader('Sello', `${px}stamp`, ast.stamp_path)}</div>
        </div>
        <div class="config-actions">
            <button class="icon-btn" onclick="DrawersManager.${isNew ? 'UserCreator.save' : 'Config.save'}('${isNew ? '' : u.profile.id}')" style="width:100%; background:#10b981; color:white;">${isNew ? 'CREAR USUARIO' : 'GUARDAR CAMBIOS'}</button>
        </div>`;
    },

    switchTab(btn, targetId) {
        const parent = btn.closest('.config-tabs').parentElement;
        parent.querySelectorAll('.config-tab-content').forEach(c => c.classList.remove('active'));
        parent.querySelector('#'+targetId).classList.add('active');
        btn.parentElement.querySelectorAll('.config-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

    renderUploader(lbl, key, path) {
        const src = path && path.length > 20 ? path : '';
        return `<div class="asset-uploader"><div class="asset-preview" id="prev-${key}">${src ? `<img src="${src}">` : '<i class="bi bi-image"></i>'}</div><div class="asset-info"><span class="asset-label">${lbl}</span><input type="file" id="in-${key}" accept="image/*" style="width:100%" onchange="DrawersManager.handleImageUpload(this, '${key}')"></div></div>`;
    },

    handleImageUpload(input, key) {
        if (input.files && input.files[0]) {
            const r = new FileReader();
            r.onload = (e) => {
                document.getElementById(`prev-${key}`).innerHTML = `<img src="${e.target.result}">`;
                localStorage.setItem(`TEMP_IMG_${key}`, e.target.result);
            };
            r.readAsDataURL(input.files[0]);
        }
    },

    Login: {
        open() { DrawersManager.openDrawer('loginDrawer'); },
        render() {
            const container = document.getElementById('login-content');
            if(!container) return;
            
            let recentsHTML = '';
            try {
                const recents = JSON.parse(localStorage.getItem('CIMA_RECENT_USERS') || '[]');
                if (recents.length > 0) {
                    const items = recents.map(u => `<div class="recent-user-item" onclick="DrawersManager.Login.prefill('${u.username}')" title="${u.name}"><div class="recent-avatar" style="background-image: url('${u.avatar}');"></div><span>${u.username}</span></div>`).join('');
                    recentsHTML = `<div class="recents-section"><div class="recents-title">Recientes</div><div class="recents-list">${items}</div></div>`;
                }
            } catch(e){}

            container.innerHTML = `
                <div class="login-form">
                    <div style="text-align:center; margin-bottom:20px;"><div style="font-size:3rem; color:#0ea5e9;"><i class="bi bi-hospital"></i></div><h2 style="color:white;">CIMA</h2></div>
                    <div class="form-group"><label>Usuario</label><input id="login-user" type="text" class="login-input" placeholder="Usuario"></div>
                    <div class="form-group"><label>Contraseña</label><input id="login-pass" type="password" class="login-input" placeholder="••••" onkeypress="if(event.key==='Enter') DrawersManager.Login.attemptLogin()"></div>
                    <button class="btn-login-action" onclick="DrawersManager.Login.attemptLogin()">ENTRAR</button>
                    ${recentsHTML}
                    <div class="login-footer"><a href="#" onclick="DrawersManager.UserCreator.open()">Crear Usuario</a></div>
                </div>`;
        },
        prefill(username) {
            document.getElementById('login-user').value = username;
            document.getElementById('login-pass').focus();
        },
        async attemptLogin() {
            const userIn = document.getElementById('login-user').value.trim();
            const passIn = document.getElementById('login-pass').value;
            if(!userIn || !passIn) return showErr("Datos incompletos");

            const user = DrawersManager.catalog.find(u => u.username === userIn || u.email === userIn || u.doc_id === userIn);
            
            if(user && user.password === passIn) {
                try {
                    let fullProfile = null;
                    if(user.config_path.startsWith('local/')) {
                         fullProfile = JSON.parse(localStorage.getItem(`CIMA_USER_CONFIG_${user.id}`));
                    } else {
                         const res = await fetch(user.config_path);
                         fullProfile = await res.json();
                    }
                    
                    if(!fullProfile) throw new Error("Perfil no encontrado");
                    STATE.currentUser = fullProfile;
                    
                    this.addToRecents({ username: user.username, name: user.name, avatar: fullProfile.assets?.avatar_path || user.avatar });
                    
                    DrawersManager.closeAll();
                    
                    document.dispatchEvent(new CustomEvent('login-success'));
                    if(window.finishLogin) window.finishLogin();

                } catch(e) { showErr("Error perfil: " + e.message); }
            } else {
                showErr("Credenciales inválidas. Verifica consola si existen usuarios cargados.");
                console.warn("Usuarios disponibles:", DrawersManager.catalog.map(u=>u.username));
            }
        },
        addToRecents(userObj) {
            let r = JSON.parse(localStorage.getItem('CIMA_RECENT_USERS')||'[]');
            r = r.filter(x => x.username !== userObj.username);
            r.unshift(userObj);
            localStorage.setItem('CIMA_RECENT_USERS', JSON.stringify(r.slice(0,3)));
        }
    },

    Config: {
        open() {
            const el = document.getElementById('configDrawer-content'); // CORREGIDO ID
            if(el) {
                el.innerHTML = DrawersManager.renderSharedForm(STATE.currentUser, false);
                DrawersManager.openDrawer('configDrawer');
            }
        },
        save() {
            const u = STATE.currentUser;
            DrawersManager._collectData(u, 'cfg-');
            const theme = u.preferences.theme || 'glass';
            document.body.className = `theme-${theme}`;
            localStorage.setItem('CIMA_THEME', theme);
            localStorage.setItem(`CIMA_USER_CONFIG_${u.profile.id}`, JSON.stringify(u));
            flash("Guardado");
            setTimeout(() => DrawersManager.closeAll(), 500);
            if(window.initToolbarEvents) window.initToolbarEvents();
        },
        _collectData(u, px) {
             u.profile.username = $(`#${px}username`).value;
             u.profile.password = $(`#${px}password`).value;
             u.profile.role = $(`#${px}role`).value;
             u.profile.title = $(`#${px}title`).value;
             u.profile.firstname = $(`#${px}firstname`).value;
             u.profile.secondname = $(`#${px}secondname`).value;
             u.profile.lastname = $(`#${px}lastname`).value;
             u.profile.secondlastname = $(`#${px}secondlastname`).value;
             u.profile.bloodtype = $(`#${px}bloodtype`).value;
             u.profile.location = $(`#${px}location`).value;
             u.profile.contact.email = $(`#${px}email`).value;
             u.profile.contact.phone = $(`#${px}phone`).value;
             u.profile.contact.email2 = $(`#${px}email2`).value;
             u.profile.contact.phone2 = $(`#${px}phone2`).value;
             u.profile.contact.instagram = $(`#${px}instagram`).value;
             u.profile.title_line_1 = $(`#${px}title_line_1`).value;
             u.profile.title_line_2 = $(`#${px}title_line_2`).value;
             u.professional.specialty = $(`#${px}specialty`).value;
             u.professional.license_number = $(`#${px}license`).value;
             u.professional.college = $(`#${px}college}`).value;
             u.professional.signature_label = $(`#${px}siglabel}`).value;
             u.professional.legal_footer = $(`#${px}legal`).value;
             u.institution.name = $(`#${px}inst_name`).value;
             u.institution.service = $(`#${px}inst_service`).value;
             u.institution.address = $(`#${px}inst_addr}`).value;
             if(!u.commercial) u.commercial = { schedule: {} };
             u.commercial.currency = $(`#${px}currency`).value;
             u.commercial.consultation_fee = $(`#${px}fee}`).value;
             u.commercial.payment_infos = $(`#${px}pay`).value;
             ['monday','tuesday','wednesday','thursday','friday','saturday'].forEach(day => {
                 if(!u.commercial.schedule[day]) u.commercial.schedule[day] = {};
                 u.commercial.schedule[day].active = $(`#${px}sch_${day}_active`).checked;
                 u.commercial.schedule[day].start = $(`#${px}sch_${day}_start`).value;
                 u.commercial.schedule[day].end = $(`#${px}sch_${day}_end`).value;
             });
             u.preferences.theme = $(`#${px}theme`).value;
             u.preferences.primary_color = $(`#${px}color`).value;
             u.preferences.default_zoom = $(`#${px}zoom`).value;
             u.preferences.use_digital_signature_default = $(`#${px}sig_def`).value === 'true';
             u.preferences.default_model = $(`#${px}model`).value;
             if(!u.documents) u.documents = { vertical: { content_margins_cm: {} }, horizontal: { content_margins_cm: {} } };
             u.documents.vertical.content_margins_cm.top = $(`#${px}v_top`).value;
             u.documents.vertical.content_margins_cm.bottom = $(`#${px}v_bottom}`).value;
             u.documents.vertical.content_margins_cm.left = $(`#${px}v_left`).value;
             u.documents.vertical.content_margins_cm.right = $(`#${px}v_right}`).value;
             u.documents.horizontal.content_margins_cm.top = $(`#${px}h_top`).value;
             u.documents.horizontal.content_margins_cm.bottom = $(`#${px}h_bottom}`).value;
             u.documents.horizontal.content_margins_cm.left = $(`#${px}h_left}`).value;
             u.documents.horizontal.content_margins_cm.right = $(`#${px}h_right}`).value;
             u.security.auto_lock_minutes = $(`#${px}autolock}`).value;
             u.security.require_confirm_before_delete = $(`#${px}confirm_del`).value === 'true';
             ['avatar','header','footer','signature','stamp'].forEach(k => {
                 const temp = localStorage.getItem(`TEMP_IMG_${px}${k}`);
                 if(temp) {
                     u.assets[`${k}_path`] = temp;
                     localStorage.setItem(`CIMA_IMG_${u.profile.id}_${k}`, temp);
                 }
             });
        }
    },

    UserCreator: {
        open() {
            const el = document.getElementById('createUserDrawer-content'); // CORREGIDO ID
            if(el) {
                let nextId = 3;
                try { DrawersManager.catalog.forEach(x => { const n = parseInt(x.id.replace('u','')); if(n >= nextId) nextId = n + 1; }); } catch(e){}
                const id = 'u' + String(nextId).padStart(3,'0');
                const empty = { profile: { id }, professional: {}, institution: {}, commercial: { schedule: {} }, preferences: { theme: 'glass', default_model: 'ORL-001' }, assets: {}, security: {}, documents: { vertical: {}, horizontal: {} } };
                el.innerHTML = DrawersManager.renderSharedForm(empty, true);
                DrawersManager.openDrawer('createUserDrawer');
            }
        },
        save() {
            const px = 'new-';
            const user = $(`#${px}username`).value;
            const pass = $(`#${px}password`).value;
            if(!user || !pass) return showErr("Usuario y clave requeridos");
            let nextId = 3;
            DrawersManager.catalog.forEach(x => { const n = parseInt(x.id.replace('u','')); if(n >= nextId) nextId = n + 1; });
            const id = 'u' + String(nextId).padStart(3,'0');
            const newUser = { id, active: true, config_path: `local/user_${id}.json`, profile: { id, contact: {} }, professional: {}, institution: {}, commercial: { schedule: {} }, preferences: {}, assets: {}, security: {}, documents: { vertical: {}, horizontal: {} } };
            DrawersManager.Config._collectData(newUser, px);
            const entry = { id, username: user, password: pass, email: newUser.profile.contact.email, doc_id: '', name: newUser.profile.firstname, role: newUser.profile.role, avatar: newUser.assets.avatar_path, config_path: newUser.config_path };
            const db = JSON.parse(localStorage.getItem('CIMA_USERS_DB')||'[]');
            db.push(entry);
            localStorage.setItem('CIMA_USERS_DB', JSON.stringify(db));
            localStorage.setItem(`CIMA_USER_CONFIG_${id}`, JSON.stringify(newUser));
            DrawersManager.catalog.push(entry);
            flash("Usuario creado");
            DrawersManager.closeAll();
            DrawersManager.Login.render();
        }
    },

    Export: {
        open() {
            const el = document.getElementById('exportDrawer-content'); // CORREGIDO ID
            if(el) {
                el.innerHTML = `<div class="form-section"><div class="form-section-title">Documentos</div><div style="display:flex; flex-direction:column; gap:10px;"><div class="checkbox-group"><input type="checkbox" id="chk-informe" checked> <label>Informe</label></div><div class="checkbox-group"><input type="checkbox" id="chk-recipe" checked> <label>Récipe</label></div></div></div><div class="form-section"><div class="form-section-title">Acciones</div><button class="btn btn-primary" onclick="DrawersManager.Export.download()" style="width:100%; margin-bottom:10px;">Descargar</button><button class="btn btn-success" onclick="DrawersManager.Export.share()" style="width:100%;">WhatsApp</button></div>`;
                DrawersManager.openDrawer('exportDrawer');
            }
        },
        download() {
            const inf = document.getElementById('chk-informe').checked;
            const rec = document.getElementById('chk-recipe').checked;
            ExportManager.processExport(STATE.currentPreviewCard, { informe: inf, recipe: rec });
        },
        share() { ExportManager.shareViaWhatsApp(STATE.currentPreviewCard); }
    }
};

window.DrawersManager = DrawersManager;
