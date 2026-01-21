import { $, STATE, log, flash, showErr, loadUserConfig } from 'brain';
import { ExportManager } from 'export_manager';

export const DrawersManager = {
    catalog: [], // Almacena el catálogo ligero en memoria

    async init() {
        // 1. Inyectar HTML Base
        this.injectHTML();

        // 2. Cargar Catálogo de Usuarios (Credenciales)
        try {
            const response = await fetch('./app/catalog/users.json');
            const remoteCatalog = await response.json();
            const localCatalog = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            
            // Unificar catálogos
            this.catalog = [...remoteCatalog, ...localCatalog];
            
            // Renderizar formulario de login
            this.Login.render();

        } catch (e) {
            console.error("Error cargando catálogo", e);
            log("Error crítico cargando usuarios", true);
        }

        this.bindEvents();
    },

    injectHTML() {
        const createDrawer = (id, icon, title) => `
            <div id="${id}" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi ${icon}"></i> ${title}</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="${id}-content"></div>
            </div>`;

        // Login Drawer (Estructura base)
        const loginHTML = `
            <div id="loginDrawer" class="login-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-lock"></i> Acceso Seguro</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="login-content" style="padding: 30px;">
                    </div>
            </div>`;

        const html = `
            ${loginHTML}
            ${createDrawer('configDrawer', 'bi-gear', 'Configuración')}
            ${createDrawer('createUserDrawer', 'bi-person-plus-fill', 'Crear Usuario')}
            ${createDrawer('exportDrawer', 'bi-share-fill', 'Exportar')}
            <div id="consoleDrawer">
                <div class="console-header"><span>SYSTEM LOG</span><span class="toggle-console">▼</span></div>
                <div id="consoleContent"></div>
            </div>
        `;
        
        if(!document.getElementById('loginDrawer')) document.body.insertAdjacentHTML('beforeend', html);
    },

    bindEvents() {
        document.querySelectorAll('.btn-close-drawer').forEach(btn => {
            btn.addEventListener('click', () => {
                const drawer = btn.closest('.login-drawer, .config-drawer');
                if(drawer) drawer.classList.remove('open');
            });
        });
        const ch = document.querySelector('#consoleDrawer .console-header');
        if(ch) ch.addEventListener('click', () => document.getElementById('consoleDrawer').classList.toggle('open'));
    },

    // --- MODULO LOGIN (ENTERPRISE STYLE) ---
    Login: {
        open() { document.getElementById('loginDrawer').classList.add('open'); },
        
        render() {
            const container = document.getElementById('login-content');
            if(!container) return;

            // 1. Obtener Recientes
            let recentsHTML = '';
            try {
                const recents = JSON.parse(localStorage.getItem('CIMA_RECENT_USERS') || '[]');
                if (recents.length > 0) {
                    const items = recents.map(u => `
                        <div class="recent-user-item" onclick="DrawersManager.Login.prefill('${u.username}')" title="${u.name}">
                            <div class="recent-avatar" style="background-image: url('${u.avatar}');"></div>
                            <span>${u.username}</span>
                        </div>
                    `).join('');
                    
                    recentsHTML = `
                        <div class="recents-section">
                            <div class="recents-title">Volver a entrar como:</div>
                            <div class="recents-list">${items}</div>
                        </div>
                    `;
                }
            } catch(e) {}

            // 2. Renderizar Formulario
            container.innerHTML = `
                <div class="login-form">
                    <div style="text-align:center; margin-bottom:20px;">
                        <div style="font-size:3rem; color:var(--primary);"><i class="bi bi-hospital"></i></div>
                        <h2 style="margin:10px 0; color:white;">Bienvenido a CIMA</h2>
                        <p style="color:#94a3b8; font-size:0.9rem;">Gestión Clínica Inteligente</p>
                    </div>

                    <div class="form-group">
                        <label>Usuario, Email o Documento</label>
                        <div class="input-wrapper">
                            <i class="bi bi-person"></i>
                            <input id="login-user" type="text" placeholder="Ej: tudraorl">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Contraseña</label>
                        <div class="input-wrapper">
                            <i class="bi bi-key"></i>
                            <input id="login-pass" type="password" placeholder="••••••••" onkeypress="if(event.key==='Enter') DrawersManager.Login.attemptLogin()">
                            <button class="eye-btn" onclick="DrawersManager.Login.togglePass()"><i class="bi bi-eye"></i></button>
                        </div>
                    </div>

                    <button class="btn-login-action" onclick="DrawersManager.Login.attemptLogin()">
                        INICIAR SESIÓN <i class="bi bi-arrow-right"></i>
                    </button>

                    ${recentsHTML}

                    <div class="login-footer">
                        ¿No tienes cuenta? <a href="#" onclick="DrawersManager.UserCreator.open()">Crear Usuario</a>
                    </div>
                </div>
            `;
        },

        prefill(username) {
            document.getElementById('login-user').value = username;
            document.getElementById('login-pass').focus();
        },

        togglePass() {
            const input = document.getElementById('login-pass');
            input.type = input.type === 'password' ? 'text' : 'password';
        },

        async attemptLogin() {
            const userInput = document.getElementById('login-user').value.trim();
            const passInput = document.getElementById('login-pass').value;

            if (!userInput || !passInput) return showErr("Ingrese credenciales completas");

            // Buscar en el catálogo
            const user = DrawersManager.catalog.find(u => 
                u.username === userInput || 
                u.email === userInput || 
                u.doc_id === userInput
            );

            if (user && user.password === passInput) {
                // EXITO: Cargar configuración completa
                try {
                    log(`Credenciales válidas. Cargando perfil de ${user.name}...`);
                    
                    // Si es usuario local recién creado, config_path es simbólico, cargamos de localStorage
                    let fullProfile = null;
                    
                    if (user.config_path.startsWith('local/')) {
                        fullProfile = JSON.parse(localStorage.getItem(`CIMA_USER_CONFIG_${user.id}`));
                    } else {
                        // Usuario del sistema (fetch JSON real)
                        const res = await fetch(user.config_path);
                        fullProfile = await res.json();
                    }

                    if (!fullProfile) throw new Error("Perfil corrupto o no encontrado");

                    // Setear Estado Global
                    STATE.currentUser = fullProfile;

                    // Guardar en Recientes
                    this.addToRecents({
                        username: user.username,
                        name: user.name,
                        avatar: fullProfile.assets?.avatar_path || user.avatar
                    });

                    // Finalizar
                    document.getElementById('loginDrawer').classList.remove('open');
                    document.dispatchEvent(new CustomEvent('login-success'));
                    if(window.finishLogin) window.finishLogin();

                } catch (err) {
                    console.error(err);
                    showErr("Error cargando perfil del usuario: " + err.message);
                }
            } else {
                showErr("Usuario o contraseña incorrectos");
                document.getElementById('login-pass').value = '';
                document.querySelector('.login-form').classList.add('shake');
                setTimeout(()=>document.querySelector('.login-form').classList.remove('shake'), 500);
            }
        },

        addToRecents(userObj) {
            try {
                let recents = JSON.parse(localStorage.getItem('CIMA_RECENT_USERS') || '[]');
                // Filtrar si ya existe para ponerlo de primero
                recents = recents.filter(u => u.username !== userObj.username);
                recents.unshift(userObj);
                // Mantener solo 3
                if (recents.length > 3) recents.pop();
                localStorage.setItem('CIMA_RECENT_USERS', JSON.stringify(recents));
            } catch(e) {}
        }
    },

    // --- RENDERIZADOR COMPARTIDO DE FORMULARIOS ---
    renderSharedForm(user = null, isNew = false) {
        const u = user || { 
            profile: { contact: {} }, professional: {}, institution: {}, commercial: { schedule: {} }, preferences: {}, assets: {}, security: {} 
        };
        const p = u.profile;
        const c = u.commercial || { schedule: {} };
        const px = isNew ? 'new-' : 'cfg-'; 

        return `
        <div class="config-tabs">
            <button class="config-tab-btn active" onclick="DrawersManager.switchTab(this, 'tab-perfil-${px}')">Perfil</button>
            <button class="config-tab-btn" onclick="DrawersManager.switchTab(this, 'tab-prof-${px}')">Profesional</button>
            <button class="config-tab-btn" onclick="DrawersManager.switchTab(this, 'tab-prefs-${px}')">Preferencias</button>
        </div>

        <div id="tab-perfil-${px}" class="config-tab-content active">
            <div class="form-section">
                <div class="form-section-title"><i class="bi bi-shield-lock"></i> Cuenta</div>
                <div class="form-grid">
                    <div class="span-2"><label class="form-label">Usuario</label><input id="${px}username" class="form-input" value="${p.username||''}" ${!isNew ? 'readonly style="opacity:0.7"' : ''}></div>
                    <div class="span-2"><label class="form-label">Contraseña</label><input id="${px}password" type="password" class="form-input" value="${p.password||''}"></div>
                    <div class="span-2"><label class="form-label">Rol</label>
                        <select id="${px}role" class="form-select">
                            <option value="doctor" ${p.role==='doctor'?'selected':''}>Médico</option>
                            <option value="assistant" ${p.role==='assistant'?'selected':''}>Asistente</option>
                            <option value="admin" ${p.role==='admin'?'selected':''}>Admin</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title"><i class="bi bi-person"></i> Datos Personales</div>
                <div class="form-grid">
                    <div class="span-1"><label class="form-label">Título</label><input id="${px}title" class="form-input" value="${p.title||''}"></div>
                    <div class="span-1"><label class="form-label">Nombre</label><input id="${px}firstname" class="form-input" value="${p.firstname||''}"></div>
                    <div class="span-2"><label class="form-label">Apellido</label><input id="${px}lastname" class="form-input" value="${p.lastname||''}"></div>
                    <div class="span-2"><label class="form-label">Email</label><input id="${px}email" class="form-input" value="${p.contact?.email||''}"></div>
                    <div class="span-2"><label class="form-label">Teléfono</label><input id="${px}phone" class="form-input" value="${p.contact?.phone||''}"></div>
                </div>
            </div>
        </div>

        <div id="tab-prof-${px}" class="config-tab-content">
            <div class="form-section">
                <div class="form-section-title"><i class="bi bi-briefcase"></i> Datos Profesionales</div>
                <div class="form-grid">
                    <div class="span-4"><label class="form-label">Especialidad</label><input id="${px}specialty" class="form-input" value="${u.professional?.specialty||''}"></div>
                    <div class="span-2"><label class="form-label">Matrícula</label><input id="${px}license" class="form-input" value="${u.professional?.license_number||''}"></div>
                    <div class="span-2"><label class="form-label">Colegio</label><input id="${px}college" class="form-input" value="${u.professional?.college||''}"></div>
                    <div class="span-4"><label class="form-label">Firma (Texto)</label><input id="${px}siglabel" class="form-input" value="${u.professional?.signature_label||''}"></div>
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title"><i class="bi bi-building"></i> Consultorio</div>
                <div class="form-grid">
                    <div class="span-4"><label class="form-label">Dirección</label><input id="${px}inst_addr" class="form-input" value="${u.institution?.address||''}"></div>
                    <div class="span-2"><label class="form-label">Honorarios</label><input id="${px}fee" type="number" class="form-input" value="${c.consultation_fee||0}"></div>
                    <div class="span-2"><label class="form-label">Moneda</label><input id="${px}currency" class="form-input" value="${c.currency||'USD'}"></div>
                </div>
            </div>
        </div>

        <div id="tab-prefs-${px}" class="config-tab-content">
            <div class="form-section">
                <div class="form-section-title"><i class="bi bi-images"></i> Gráficos</div>
                ${this.renderUploader('Avatar', `${px}avatar`, u.assets?.avatar_path)}
                ${this.renderUploader('Firma', `${px}signature`, u.assets?.signature_path)}
                ${this.renderUploader('Sello', `${px}stamp`, u.assets?.stamp_path)}
                ${this.renderUploader('Header', `${px}header`, u.assets?.header_path)}
                ${this.renderUploader('Footer', `${px}footer`, u.assets?.footer_path)}
            </div>
        </div>

        <div class="config-actions">
            <button class="icon-btn" onclick="DrawersManager.${isNew ? 'UserCreator.save' : 'Config.save'}('${isNew ? '' : u.profile.id}')" style="width:100%; background:#10b981; color:white; height:45px; font-size:1rem;">
                <i class="bi bi-check-lg"></i> ${isNew ? 'CREAR USUARIO' : 'GUARDAR CAMBIOS'}
            </button>
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
        return `
        <div class="asset-uploader">
            <div class="asset-preview" id="prev-${key}">${src ? `<img src="${src}">` : '<i class="bi bi-image"></i>'}</div>
            <div class="asset-info">
                <span class="asset-label">${lbl}</span>
                <input type="file" id="in-${key}" accept="image/*" style="width:100%" onchange="DrawersManager.handleImageUpload(this, '${key}')">
            </div>
        </div>`;
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

    // --- MODULO CONFIGURACION ---
    Config: {
        open() {
            const container = document.getElementById('config-content');
            if(container) {
                container.innerHTML = DrawersManager.renderSharedForm(STATE.currentUser, false);
                document.getElementById('configDrawer').classList.add('open');
            }
        },
        save() {
            const u = STATE.currentUser;
            const px = 'cfg-';
            DrawersManager._collectData(u, px);
            localStorage.setItem(`CIMA_USER_CONFIG_${u.profile.id}`, JSON.stringify(u));
            flash("Perfil actualizado");
            setTimeout(() => document.getElementById('configDrawer').classList.remove('open'), 500);
            if(window.DrawersManager.renderToolbar) window.DrawersManager.renderToolbar();
        }
    },

    // --- MODULO CREAR USUARIO ---
    UserCreator: {
        open() {
            const container = document.getElementById('create-user-content');
            if(container) {
                let nextId = 3;
                try {
                     // Calcular ID basado en el catálogo en memoria (que incluye locales)
                     DrawersManager.catalog.forEach(x => {
                         const n = parseInt(x.id.replace('u',''));
                         if(n >= nextId) nextId = n + 1;
                     });
                } catch(e){}
                const newIdStr = 'u' + String(nextId).padStart(3,'0');
                
                const emptyUser = { 
                    profile: { id: newIdStr }, professional: {}, institution: {}, commercial: {}, preferences: {}, assets: {}, security: {} 
                };
                container.innerHTML = DrawersManager.renderSharedForm(emptyUser, true);
                document.getElementById('createUserDrawer').classList.add('open');
            }
        },
        save() {
            const px = 'new-';
            const username = $(`#${px}username`).value;
            const password = $(`#${px}password`).value;
            const firstname = $(`#${px}firstname`).value;

            if(!username || !password || !firstname) return showErr("Usuario, contraseña y nombre son obligatorios");

            // Crear ID (calculado de nuevo por seguridad)
            let nextId = 3;
            DrawersManager.catalog.forEach(x => { const n = parseInt(x.id.replace('u','')); if(n >= nextId) nextId = n + 1; });
            const id = 'u' + String(nextId).padStart(3,'0');

            const newUser = { 
                id: id,
                active: true,
                config_path: `local/user_${id}.json`, 
                profile: { id: id, contact: {} }, 
                professional: {}, institution: {}, commercial: {}, preferences: { theme: 'glass', default_model: 'ORL-001' }, assets: {}, security: {} 
            };

            DrawersManager._collectData(newUser, px);

            // 1. Guardar Config Completa
            localStorage.setItem(`CIMA_USER_CONFIG_${id}`, JSON.stringify(newUser));

            // 2. Actualizar Catálogo Local (Credenciales)
            const entry = {
                id: id,
                username: newUser.profile.username,
                password: newUser.profile.password,
                name: `${newUser.profile.firstname} ${newUser.profile.lastname || ''}`,
                role: newUser.profile.role,
                avatar: newUser.assets.avatar_path || '',
                config_path: newUser.config_path
            };

            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB')||'[]');
            localDB.push(entry);
            localStorage.setItem('CIMA_USERS_DB', JSON.stringify(localDB));

            // 3. Recargar Memoria
            DrawersManager.catalog.push(entry);

            flash(`Usuario ${username} creado`);
            document.getElementById('createUserDrawer').classList.remove('open');
        }
    },

    // Helper para recolectar datos del formulario
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

         u.professional.specialty = $(`#${px}specialty`).value;
         u.professional.license_number = $(`#${px}license`).value;
         u.professional.college = $(`#${px}college`).value;
         u.professional.signature_label = $(`#${px}siglabel`).value;

         u.institution.address = $(`#${px}inst_addr`).value;
         
         if(!u.commercial) u.commercial = {};
         u.commercial.currency = $(`#${px}currency`).value;
         u.commercial.consultation_fee = $(`#${px}fee`).value;

         // Guardar imágenes
         ['avatar','header','footer','signature','stamp'].forEach(k => {
             const temp = localStorage.getItem(`TEMP_IMG_${px}${k}`);
             if(temp) {
                 u.assets[`${k}_path`] = temp;
                 localStorage.setItem(`CIMA_IMG_${u.profile.id}_${k}`, temp);
                 localStorage.removeItem(`TEMP_IMG_${px}${k}`);
             }
         });
    },

    // --- MODULO EXPORT (Se mantiene igual) ---
    Export: {
        open() {
            const content = document.getElementById('export-content');
            if(!content) return;
            content.innerHTML = `
            <div class="form-section"><div class="form-section-title">Documentos</div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="checkbox-group" style="padding:15px; background:rgba(255,255,255,0.05); border-radius:8px;">
                        <input type="checkbox" id="chk-informe" checked> <label for="chk-informe" style="font-size:1.1rem">📄 Informe</label>
                    </div>
                    <div class="checkbox-group" style="padding:15px; background:rgba(255,255,255,0.05); border-radius:8px;">
                        <input type="checkbox" id="chk-recipe" checked> <label for="chk-recipe" style="font-size:1.1rem">💊 Récipe</label>
                    </div>
                </div>
            </div>
            <div class="form-section" style="margin-top:20px;"><div class="form-section-title">Acciones</div>
                <button class="btn btn-primary" onclick="DrawersManager.Export.download()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px;">
                    <i class="bi bi-download"></i> Descargar
                </button>
                <button class="btn btn-success" onclick="DrawersManager.Export.share()" style="width:100%; justify-content:center; padding:12px;">
                    <i class="bi bi-whatsapp"></i> WhatsApp
                </button>
            </div>`;
            document.getElementById('exportDrawer').classList.add('open');
        },
        download() {
            const inf = document.getElementById('chk-informe').checked;
            const rec = document.getElementById('chk-recipe').checked;
            ExportManager.processExport(STATE.currentPreviewCard, { informe: inf, recipe: rec });
        },
        share() {
            ExportManager.shareViaWhatsApp(STATE.currentPreviewCard);
        }
    }
};

window.DrawersManager = DrawersManager;
