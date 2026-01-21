import { $, STATE, log, flash, showErr, loadUserConfig } from 'brain';

export const DrawersManager = {
    
    init() {
        // 1. Drawer Login
        if (!document.getElementById('loginDrawer')) {
            const html = `
            <div id="loginDrawer" class="login-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-badge"></i> Iniciar Sesión</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="user-list-container" class="user-list"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // 2. Drawer Configuración
        if (!document.getElementById('configDrawer')) {
            const html = `
            <div id="configDrawer" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-gear"></i> Configuración</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="config-content"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // 3. Drawer Crear Usuario
        if (!document.getElementById('createUserDrawer')) {
            const html = `
            <div id="createUserDrawer" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-plus-fill"></i> Crear Nuevo Usuario</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="create-user-content"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // 4. Console Drawer
        if (!document.getElementById('consoleDrawer')) {
            const html = `
            <div id="consoleDrawer">
                <div class="console-header">
                    <span>SYSTEM LOG (Ctrl+Shift+L)</span>
                    <span class="toggle-console">▼</span>
                </div>
                <div id="consoleContent"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // Bindear cierres
        document.querySelectorAll('.btn-close-drawer').forEach(btn => {
            btn.addEventListener('click', () => {
                const drawer = btn.closest('.login-drawer, .config-drawer');
                if(drawer) drawer.classList.remove('open');
            });
        });

        // Toggle Consola
        const ch = document.querySelector('#consoleDrawer .console-header');
        if(ch) {
            ch.addEventListener('click', () => {
                const d = document.getElementById('consoleDrawer');
                d.classList.toggle('open');
                d.querySelector('.toggle-console').textContent = d.classList.contains('open') ? '▲' : '▼';
            });
        }
    },

    Login: {
        open() {
            document.getElementById('loginDrawer').classList.add('open');
        },
        renderList(users) {
            const list = document.getElementById('user-list-container');
            if(!list) return;
            
            list.innerHTML = users.map(u => {
                const savedImg = localStorage.getItem(`CIMA_IMG_${u.id}_avatar`);
                const hasImg = savedImg || (u.avatar && u.avatar !== "");
                // Fix visual para avatar
                const imgStyle = hasImg 
                    ? `background-image: url('${savedImg || u.avatar}'); background-size:cover;` 
                    : '';
                const initial = u.username ? u.username.substring(0,2).toUpperCase() : 'U';
                
                return `
                <div class="user-wrapper" id="user-wrapper-${u.id}">
                    <div class="user-card-content" onclick="DrawersManager.Login.selectUser('${u.id}', '${u.config_path}')">
                        <div class="user-avatar-lg" style="${imgStyle}">${!hasImg ? initial : ''}</div>
                        <div class="user-info">
                            <h3>${u.name}</h3>
                            <p>${u.specialty || u.role}</p>
                            <span class="username">@${u.username}</span>
                        </div>
                    </div>
                    <div id="pwd-area-${u.id}" class="password-area hidden">
                        <div style="position:relative;">
                            <input type="password" id="pwd-input-${u.id}" class="login-input" 
                                   placeholder="Contraseña" 
                                   onkeypress="if(event.key==='Enter') DrawersManager.Login.verifyPassword('${u.id}')" 
                                   onclick="event.stopPropagation(); this.focus()">
                            <i class="bi bi-lock-fill" style="position:absolute; right:10px; top:10px; color:#64748b;"></i>
                        </div>
                    </div>
                </div>`;
            }).join('');
        },
        async selectUser(id, configPath) {
            document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
            
            const localConfig = localStorage.getItem(`CIMA_USER_CONFIG_${id}`);
            
            if(localConfig) { 
                try { 
                    STATE.currentUser = JSON.parse(localConfig); 
                    log("Config local cargada: " + id); 
                } catch(e) { 
                    await loadUserConfig(configPath); 
                } 
            } else { 
                await loadUserConfig(configPath); 
            }

            const pwd = STATE.currentUser?.profile?.password;

            if (pwd) { 
                const area = document.getElementById(`pwd-area-${id}`); 
                if(area) {
                    area.classList.remove('hidden'); 
                    setTimeout(() => document.getElementById(`pwd-input-${id}`).focus(), 100);
                }
            } else { 
                // CORRECCIÓN: Usar document.dispatchEvent
                document.dispatchEvent(new CustomEvent('login-success'));
            }
        },
        verifyPassword(id) {
            const input = document.getElementById(`pwd-input-${id}`);
            const actual = STATE.currentUser?.profile?.password;
            
            if (input && input.value === actual) {
                document.getElementById('loginDrawer').classList.remove('open');
                // CORRECCIÓN CRÍTICA: Usar document.dispatchEvent para que start.js lo escuche
                document.dispatchEvent(new CustomEvent('login-success'));
            } else {
                if(input) {
                    input.style.borderColor = "#ef4444";
                    input.classList.add('shake');
                    log("Password incorrecto", true);
                    setTimeout(() => { input.style.borderColor = ""; input.classList.remove('shake'); }, 500);
                }
            }
        }
    },

    Config: {
        open() {
            const content = document.getElementById('config-content');
            if (!content) return;
            const u = STATE.currentUser || {};
            const p = u.profile || {};
            const prof = u.professional || {};
            const inst = u.institution || {};
            const pref = u.preferences || {};
            const ast = u.assets || {};

            const html = `
            <div class="config-tabs">
                <button class="config-tab-btn active" onclick="DrawersManager.Config.tab('perfil')">Perfil</button>
                <button class="config-tab-btn" onclick="DrawersManager.Config.tab('prof')">Profesional</button>
                <button class="config-tab-btn" onclick="DrawersManager.Config.tab('inst')">Institución</button>
                <button class="config-tab-btn" onclick="DrawersManager.Config.tab('img')">Imágenes</button>
            </div>
            
            <div id="tab-perfil" class="config-tab-content active">
                <div class="form-section"><div class="form-section-title">Datos Personales</div><div class="form-grid">
                    <div class="span-1"><label class="form-label">Título</label><input id="cfg-title" class="form-input" value="${p.title||''}"></div>
                    <div class="span-1"><label class="form-label">Nombre</label><input id="cfg-firstname" class="form-input" value="${p.firstname||''}"></div>
                    <div class="span-1"><label class="form-label">Apellido</label><input id="cfg-lastname" class="form-input" value="${p.lastname||''}"></div>
                    <div class="span-1"><label class="form-label">Sangre</label><input id="cfg-blood" class="form-input" value="${p.bloodtype||''}"></div>
                    <div class="span-2"><label class="form-label">Email</label><input id="cfg-email" class="form-input" value="${p.contact?.email||''}"></div>
                    <div class="span-2"><label class="form-label">Teléfono</label><input id="cfg-phone" class="form-input" value="${p.contact?.phone||''}"></div>
                </div></div>
            </div>

            <div id="tab-prof" class="config-tab-content">
                <div class="form-section"><div class="form-section-title">Datos Profesionales</div><div class="form-grid">
                    <div class="span-4"><label class="form-label">Especialidad</label><input id="cfg-spec" class="form-input" value="${prof.specialty||''}"></div>
                    <div class="span-2"><label class="form-label">Matrícula</label><input id="cfg-lic" class="form-input" value="${prof.license_number||''}"></div>
                    <div class="span-2"><label class="form-label">Colegio</label><input id="cfg-col" class="form-input" value="${prof.college||''}"></div>
                    <div class="span-4"><label class="form-label">Etiqueta Firma</label><input id="cfg-siglabel" class="form-input" value="${prof.signature_label||''}"></div>
                </div></div>
            </div>

            <div id="tab-inst" class="config-tab-content">
                <div class="form-section"><div class="form-section-title">Institución</div><div class="form-grid">
                    <div class="span-4"><label class="form-label">Nombre</label><input id="cfg-instname" class="form-input" value="${inst.name||''}"></div>
                    <div class="span-4"><label class="form-label">Dirección</label><input id="cfg-instaddr" class="form-input" value="${inst.address||''}"></div>
                </div></div>
                <div class="form-section"><div class="form-section-title">Preferencias</div><div class="form-grid">
                    <div class="span-2"><label class="form-label">Color</label><input type="color" id="cfg-color" class="form-input" value="${pref.primary_color||'#0ea5e9'}"></div>
                    <div class="span-2"><label class="form-label">Modelo</label><input id="cfg-model" class="form-input" value="${pref.default_model||'ORL-001'}" readonly></div>
                </div></div>
            </div>

            <div id="tab-img" class="config-tab-content">
                <div class="form-section">
                    ${this.renderUploader('Avatar', 'avatar', ast.avatar_path)}
                    ${this.renderUploader('Encabezado', 'header', ast.header_path)}
                    ${this.renderUploader('Pie de Página', 'footer', ast.footer_path)}
                    ${this.renderUploader('Firma', 'signature', ast.signature_path)}
                    ${this.renderUploader('Sello', 'stamp', ast.stamp_path)}
                </div>
            </div>

            <div class="config-actions">
                <button class="icon-btn" onclick="DrawersManager.Config.save()" style="width:100%; background:#10b981; color:white;">Guardar Cambios</button>
            </div>`;

            content.innerHTML = html;
            document.getElementById('configDrawer').classList.add('open');
            this.bindUploaders();
        },
        tab(name) {
            document.querySelectorAll('.config-tab-content').forEach(el => el.classList.remove('active'));
            document.getElementById(`tab-${name}`).classList.add('active');
            document.querySelectorAll('.config-tab-btn').forEach(el => el.classList.remove('active'));
            event.target.classList.add('active');
        },
        renderUploader(lbl, key, path) {
            const src = path && path.length > 20 ? path : '';
            return `
            <div class="asset-uploader">
                <div class="asset-preview" id="prev-${key}">
                    ${src ? `<img src="${src}">` : '<i class="bi bi-image"></i>'}
                </div>
                <div class="asset-info">
                    <span class="asset-label">${lbl}</span>
                    <input type="file" id="in-${key}" accept="image/*" style="width:100%">
                </div>
            </div>`;
        },
        bindUploaders() {
            ['avatar','header','footer','signature','stamp'].forEach(k => {
                const inp = document.getElementById(`in-${k}`);
                if(inp) {
                    inp.addEventListener('change', e => {
                        if(e.target.files[0]) {
                            const r = new FileReader();
                            r.onload = ev => {
                                document.getElementById(`prev-${k}`).innerHTML = `<img src="${ev.target.result}">`;
                                localStorage.setItem(`TEMP_IMG_${k}`, ev.target.result);
                            };
                            r.readAsDataURL(e.target.files[0]);
                        }
                    });
                }
            });
        },
        save() {
            const u = STATE.currentUser;
            if(!u.profile) return;

            u.profile.title = $('#cfg-title').value;
            u.profile.firstname = $('#cfg-firstname').value;
            u.profile.lastname = $('#cfg-lastname').value;
            u.profile.bloodtype = $('#cfg-blood').value;
            u.profile.contact.email = $('#cfg-email').value;
            u.profile.contact.phone = $('#cfg-phone').value;
            
            u.professional.specialty = $('#cfg-spec').value;
            u.professional.license_number = $('#cfg-lic').value;
            u.professional.college = $('#cfg-col').value;
            u.professional.signature_label = $('#cfg-siglabel').value;
            
            u.institution.name = $('#cfg-instname').value;
            u.institution.address = $('#cfg-instaddr').value;
            u.preferences.primary_color = $('#cfg-color').value;

            ['avatar','header','footer','signature','stamp'].forEach(k => {
                const temp = localStorage.getItem(`TEMP_IMG_${k}`);
                if(temp) {
                    u.assets[`${k}_path`] = temp;
                    localStorage.setItem(`CIMA_IMG_${u.profile.id}_${k}`, temp);
                    localStorage.removeItem(`TEMP_IMG_${k}`);
                }
            });

            localStorage.setItem(`CIMA_USER_CONFIG_${u.profile.id}`, JSON.stringify(u));
            flash("Configuración guardada");
            setTimeout(() => document.getElementById('configDrawer').classList.remove('open'), 500);
            
            if(window.DrawersManager.renderToolbar) window.DrawersManager.renderToolbar();
        }
    },

    UserCreator: {
        open() {
            const el = document.getElementById('create-user-content');
            if(!el) return;
            let id = 3;
            try {
                const db = JSON.parse(localStorage.getItem('CIMA_USERS_DB')||'[]');
                db.forEach(u => {
                    const num = parseInt(u.id.replace('u',''));
                    if(num >= id) id = num + 1;
                });
            } catch(e){}
            const nextId = 'u' + String(id).padStart(3,'0');

            el.innerHTML = `
            <div class="form-section"><div class="form-section-title">Nuevo Usuario</div>
                <div class="form-grid">
                    <div class="span-2"><label class="form-label">Usuario</label><input id="nu-user" class="form-input"></div>
                    <div class="span-2"><label class="form-label">Password</label><input id="nu-pass" type="password" class="form-input"></div>
                    <div class="span-2"><label class="form-label">Nombre</label><input id="nu-name" class="form-input"></div>
                    <div class="span-2"><label class="form-label">Rol</label>
                        <select id="nu-role" class="form-select">
                            <option value="doctor">Médico</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="span-4"><label class="form-label">ID Sistema</label><input value="${nextId}" readonly class="form-input" style="opacity:0.5"></div>
                </div>
                <button class="icon-btn" onclick="DrawersManager.UserCreator.save('${nextId}')" style="width:100%; background:#10b981; margin-top:10px;">Crear</button>
            </div>`;
            document.getElementById('createUserDrawer').classList.add('open');
        },
        save(id) {
            const user = $('#nu-user').value;
            const pass = $('#nu-pass').value;
            const name = $('#nu-name').value;
            if(!user || !pass || !name) return showErr("Complete todos los campos");

            const newUser = {
                id: id,
                username: user,
                name: name,
                role: $('#nu-role').value,
                config_path: `local/user_${id}.json`,
                profile: { id, username: user, password: pass, firstname: name, contact: {}, assets: {} },
                preferences: { theme: 'glass', default_model: 'ORL-001' },
                assets: {}, professional: {}, institution: {}
            };

            const db = JSON.parse(localStorage.getItem('CIMA_USERS_DB')||'[]');
            db.push(newUser);
            localStorage.setItem('CIMA_USERS_DB', JSON.stringify(db));
            localStorage.setItem(`CIMA_USER_CONFIG_${id}`, JSON.stringify(newUser));
            
            flash("Usuario creado");
            document.getElementById('createUserDrawer').classList.remove('open');
            if(window.refreshUserList) window.refreshUserList();
        }
    }
};

window.DrawersManager = DrawersManager;
