import { $, $$, STATE, loadUserConfig, log, flash, showErr } from 'brain';

export const DrawersManager = {
    
    // --- INICIALIZACIÓN ---
    init() {
        // 1. Inyectar Drawer de Login
        if (!document.getElementById('loginDrawer')) {
            const loginHTML = `
            <div id="loginDrawer" class="login-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-badge"></i> Iniciar Sesión</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="user-list-container" class="user-list"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', loginHTML);
        }

        // 2. Inyectar Drawer de Configuración
        if (!document.getElementById('configDrawer')) {
            const configHTML = `
            <div id="configDrawer" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-gear"></i> Configuración</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="config-content"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', configHTML);
        }

        // 3. Inyectar Drawer de Crear Usuario
        if (!document.getElementById('createUserDrawer')) {
            const createUserHTML = `
            <div id="createUserDrawer" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-plus-fill"></i> Crear Nuevo Usuario</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="create-user-content"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', createUserHTML);
        }

        // 4. Consola (Ya existe en HTML, pero aseguramos listeners si es necesario)
        // Nota: Inyectamos HTML solo si falta. El listener global de ESC está en start.js.

        // Bindear eventos globales de cierre para TODOS los drawers
        document.querySelectorAll('.btn-close-drawer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                btn.closest('.login-drawer, .config-drawer').classList.remove('open');
            });
        });
    },

    // --- MODULO LOGIN ---
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
                const avatarHtml = hasImg 
                    ? `<div class="user-avatar-lg" style="background-image: url('${savedImg || u.avatar}'); background-size:cover;"></div>` 
                    : `<div class="user-avatar-lg">${u.username.substring(0,2).toUpperCase()}</div>`;

                const roleDisplay = u.specialty || u.role;

                return `
                <div class="user-wrapper" id="user-wrapper-${u.id}">
                    <div class="user-card-content" onclick="window.DrawersManager.Login.selectUser('${u.id}', '${u.config_path}')">
                        ${avatarHtml}
                        <div class="user-info">
                            <h3>${u.name}</h3>
                            <p>${roleDisplay}</p>
                            <span class="username">@${u.username}</span>
                        </div>
                    </div>
                    <div id="pwd-area-${u.id}" class="password-area hidden">
                        <div style="position:relative;">
                            <input type="password" id="pwd-input-${u.id}" class="login-input" 
                                   placeholder="Contraseña" 
                                   onkeypress="if(event.key==='Enter') window.DrawersManager.Login.verifyPassword('${u.id}')"
                                   onclick="event.stopPropagation(); this.focus()">
                            <i class="bi bi-lock-fill" style="position:absolute; right:10px; top:10px; color:#64748b;"></i>
                        </div>
                    </div>
                </div>`;
            }).join('');
        },
        selectUser(id, configPath) {
            document.querySelectorAll('.password-area').forEach(el => el.classList.add('hidden'));
            
            // Cargar config local si existe (prioridad) o del JSON
            const localConfig = localStorage.getItem(`CIMA_USER_CONFIG_${id}`);
            
            if(localConfig) { 
                try { 
                    STATE.currentUser = JSON.parse(localConfig); 
                    log("Config local cargada para " + id); 
                } catch(e) { loadUserConfig(configPath); } 
            } else { 
                loadUserConfig(configPath); 
            }

            const pwd = STATE.currentUser.profile.password;

            if (pwd) { 
                const area = document.getElementById(`pwd-area-${id}`); 
                area.classList.remove('hidden'); 
                document.getElementById(`pwd-input-${id}`).focus(); 
            } else { 
                // Disparar evento de login exitoso para que start.js tome el control
                window.dispatchEvent(new CustomEvent('login-success')); 
            }
        },
        verifyPassword(id) {
            const input = document.getElementById(`pwd-input-${id}`);
            const actual = STATE.currentUser.profile.password;
            if (input.value === actual) {
                // Éxito
                document.getElementById('loginDrawer').classList.remove('open');
                window.dispatchEvent(new CustomEvent('login-success'));
            } else {
                input.style.borderColor = "#ef4444";
                input.classList.add('shake');
                log("Contraseña incorrecta", true);
                setTimeout(() => { input.style.borderColor = ""; input.classList.remove('shake'); }, 500);
            }
        }
    },

    // --- MODULO CONFIGURACIÓN ---
    Config: {
        open() {
            const configContent = document.getElementById('config-content');
            if (!configContent) return;
            
            const user = STATE.currentUser;
            const p = user.profile || {};
            const prof = user.professional || {};
            const inst = user.institution || {};
            const prefs = user.preferences || {};
            const sec = user.security || {};
            const assets = user.assets || {};

            // Buffer temporal para imagenes
            if (!window.tempImageBuffer) window.tempImageBuffer = {};

            const html = `
            <div class="config-tabs">
                <button class="config-tab-btn active" onclick="window.DrawersManager.Config.switchTab('perfil')">Perfil</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.Config.switchTab('prof')">Profesional</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.Config.switchTab('inst')">Institución</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.Config.switchTab('prefs')">Preferencias</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.Config.switchTab('assets')">Imágenes</button>
            </div>
            <div id="tab-perfil" class="config-tab-content active">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-person"></i> Datos Personales</div>
                    <div class="form-grid">
                        <div class="span-1"><label class="form-label">Título</label><input id="cfg-title" class="form-input" value="${p.title || ''}"></div>
                        <div class="span-1"><label class="form-label">Primer Nombre</label><input id="cfg-firstname" class="form-input" value="${p.firstname || ''}"></div>
                        <div class="span-1"><label class="form-label">Segundo Nombre</label><input id="cfg-secondname" class="form-input" value="${p.secondname || ''}"></div>
                        <div class="span-1"><label class="form-label">Primer Apellido</label><input id="cfg-lastname" class="form-input" value="${p.lastname || ''}"></div>
                        <div class="span-1"><label class="form-label">Segundo Apellido</label><input id="cfg-secondlastname" class="form-input" value="${p.secondlastname || ''}"></div>
                        <div class="span-1"><label class="form-label">Tipo Sangre</label><input id="cfg-bloodtype" class="form-input" value="${p.bloodtype || ''}"></div>
                        <div class="span-4"><label class="form-label">Ubicación</label><input id="cfg-location" class="form-input" value="${p.location || ''}"></div>
                    </div>
                </div>
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-telephone"></i> Contacto</div>
                    <div class="form-grid">
                        <div class="span-2"><label class="form-label">Teléfono Principal</label><input id="cfg-phone" class="form-input" value="${p.contact?.phone || ''}"></div>
                        <div class="span-2"><label class="form-label">Teléfono Secundario</label><input id="cfg-phone2" class="form-input" value="${p.contact?.phone2 || ''}"></div>
                        <div class="span-2"><label class="form-label">Email Principal</label><input id="cfg-email" class="form-input" value="${p.contact?.email || ''}"></div>
                        <div class="span-2"><label class="form-label">Email Alternativo</label><input id="cfg-email2" class="form-input" value="${p.contact?.email2 || ''}"></div>
                        <div class="span-4"><label class="form-label">Instagram</label><input id="cfg-instagram" class="form-input" value="${p.contact?.instagram || ''}"></div>
                    </div>
                </div>
            </div>
            <div id="tab-prof" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-briefcase"></i> Datos Legales</div>
                    <div class="form-grid">
                        <div class="span-2"><label class="form-label">Especialidad (Línea 1)</label><input id="cfg-specialty" class="form-input" value="${prof.specialty || p.title_line_1 || ''}"></div>
                        <div class="span-2"><label class="form-label">Cargo / Detalle (Línea 2)</label><input id="cfg-title2" class="form-input" value="${p.title_line_2 || ''}"></div>
                        <div class="span-2"><label class="form-label">Matrícula MPPS</label><input id="cfg-license" class="form-input" value="${prof.license_number || ''}"></div>
                        <div class="span-2"><label class="form-label">Colegio Médico (CMM)</label><input id="cfg-college" class="form-input" value="${prof.college || ''}"></div>
                        <div class="span-4"><label class="form-label">Etiqueta de Firma</label><input id="cfg-sig-label" class="form-input" value="${prof.signature_label || ''}"></div>
                        <div class="span-4"><label class="form-label">Pie de Página Legal</label><input id="cfg-legal-footer" class="form-input" value="${prof.legal_footer || ''}"></div>
                    </div>
                </div>
            </div>
            <div id="tab-inst" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-hospital"></i> Datos Institucionales</div>
                    <div class="form-grid">
                        <div class="span-2"><label class="form-label">Nombre Institución</label><input id="cfg-inst-name" class="form-input" value="${inst.name || ''}"></div>
                        <div class="span-2"><label class="form-label">Servicio</label><input id="cfg-inst-service" class="form-input" value="${inst.service || ''}"></div>
                        <div class="span-4"><label class="form-label">Dirección</label><input id="cfg-inst-address" class="form-input" value="${inst.address || ''}"></div>
                    </div>
                </div>
            </div>
            <div id="tab-prefs" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-sliders"></i> Preferencias</div>
                    <div class="form-grid">
                        <div class="span-2"><label class="form-label">Color Primario</label><input type="color" id="cfg-pcolor" class="form-input" value="${prefs.primary_color || '#0ea5e9'}"></div>
                        <div class="span-2"><label class="form-label">Zoom Default (%)</label><input type="number" id="cfg-zoom" class="form-input" value="${prefs.default_zoom || 60}"></div>
                        <div class="span-2"><label class="form-label">Firma Digital por Defecto</label>
                            <select id="cfg-sig-default" class="form-select">
                                <option value="true" ${prefs.use_digital_signature_default ? 'selected' : ''}>Sí</option>
                                <option value="false" ${!prefs.use_digital_signature_default ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div class="span-2"><label class="form-label">Auto-lock (min)</label><input type="number" id="cfg-autolock" class="form-input" value="${sec.auto_lock_minutes || 15}"></div>
                    </div>
                </div>
            </div>
            <div id="tab-assets" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-images"></i> Imágenes</div>
                    ${this.renderAssetUploader('Avatar', 'avatar', assets.avatar_path)}
                    ${this.renderAssetUploader('Encabezado (Header)', 'header', assets.header_path)}
                    ${this.renderAssetUploader('Pie de Página (Footer)', 'footer', assets.footer_path)}
                    ${this.renderAssetUploader('Firma Digital', 'signature', assets.signature_path)}
                    ${this.renderAssetUploader('Sello Húmedo', 'stamp', assets.stamp_path)}
                </div>
            </div>
            <div class="config-actions">
                <button class="icon-btn" onclick="window.DrawersManager.Config.save()" style="width:100%; background:var(--primary); color:white; height:45px; font-size:1rem;"><i class="bi bi-save"></i> GUARDAR CAMBIOS</button>
            </div>`;
            
            configContent.innerHTML = html;
            document.getElementById('configDrawer').classList.add('open');
            this.initAssetPreviews();
        },
        switchTab(tabName) {
            document.querySelectorAll('.config-tabs .config-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.config-tabs .config-tab-btn[onclick*="'${tabName}'"]`).classList.add('active');
            document.querySelectorAll('.config-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tabName}`).classList.add('active');
        },
        save() {
            const user = STATE.currentUser;
            user.profile.title = $('#cfg-title').value;
            user.profile.firstname = $('#cfg-firstname').value;
            user.profile.secondname = $('#cfg-secondname').value;
            user.profile.lastname = $('#cfg-lastname').value;
            user.profile.secondlastname = $('#cfg-secondlastname').value;
            user.profile.bloodtype = $('#cfg-bloodtype').value;
            user.profile.location = $('#cfg-location').value;
            
            user.profile.contact.phone = $('#cfg-phone').value;
            user.profile.contact.phone2 = $('#cfg-phone2').value;
            user.profile.contact.email = $('#cfg-email').value;
            user.profile.contact.email2 = $('#cfg-email2').value;
            user.profile.contact.instagram = $('#cfg-instagram').value;
            
            user.professional.specialty = $('#cfg-specialty').value;
            user.profile.title_line_1 = $('#cfg-specialty').value; // Sync visual
            user.profile.title_line_2 = $('#cfg-title2').value;
            user.professional.license_number = $('#cfg-license').value;
            user.professional.college = $('#cfg-college').value;
            user.professional.signature_label = $('#cfg-sig-label').value;
            user.professional.legal_footer = $('#cfg-legal-footer').value;
            
            user.institution.name = $('#cfg-inst-name').value;
            user.institution.service = $('#cfg-inst-service').value;
            user.institution.address = $('#cfg-inst-address').value;
            
            user.preferences.primary_color = $('#cfg-pcolor').value;
            user.preferences.default_zoom = $('#cfg-zoom').value;
            user.preferences.use_digital_signature_default = $('#cfg-sig-default').value === 'true';
            user.security.auto_lock_minutes = $('#cfg-autolock').value;
            
            ['avatar', 'header', 'footer', 'signature', 'stamp'].forEach(key => {
                const input = document.getElementById(`input-${key}`);
                if (input.files && input.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const base64 = e.target.result;
                        localStorage.setItem(`CIMA_IMG_${STATE.currentUser.profile.id}_${key}`, base64);
                        user.assets[`${key}_path`] = base64;
                        
                        document.getElementById(`preview-${key}`).innerHTML = `<img src="${base64}">`;
                        
                        if(key === 'avatar') {
                            // Refrescar toolbar para ver la foto nueva
                            // Nota: Se asume que toolbar.js está expuesto globalmente o se puede re-renderizar vía evento.
                            // Lo más limpio es disparar un evento.
                            window.dispatchEvent(new CustomEvent('user-avatar-updated'));
                        }
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });

            try { 
                localStorage.setItem(`CIMA_USER_CONFIG_${STATE.currentUser.profile.id}`, JSON.stringify(user)); 
                flash('Guardado.'); 
            } catch(e) { 
                showErr('Error: ' + e.message); 
            }
            
            setTimeout(() => {
                document.getElementById('configDrawer').list.remove('open');
            }, 1000);
        },
        renderAssetUploader(label, key, currentPath) {
            const src = currentPath && currentPath.length > 10 ? currentPath : '';
            return `<div class="asset-uploader">
                <div class="asset-preview" id="preview-${key}">${src ? `<img src="${src}" onerror="this.style.display='none'">` : '<i class="bi bi-image" style="font-size:1.5rem; color:#64748b;"></i>'}</div>
                <div class="asset-info">
                    <span class="asset-label">${label}</span>
                    <input type="file" id="input-${key}" accept="image/*" style="font-size:0.75rem; width:100%;">
                </div>
            </div>`;
        },
        initAssetPreviews() {
            ['avatar', 'header', 'footer', 'signature', 'stamp'].forEach(key => {
                const input = document.getElementById(`input-${key}`);
                if(!input) return;
                
                const savedImg = localStorage.getItem(`CIMA_IMG_${STATE.currentUser.profile.id}_${key}`);
                if (savedImg) { 
                    const preview = document.getElementById(`preview-${key}`); 
                    if(preview) preview.innerHTML = `<img src="${savedImg}">`; 
                }
                input.addEventListener('change', (e) => {
                    if (e.target.files[0]) { 
                        const url = URL.createObjectURL(e.target.files[0]); 
                        const preview = document.getElementById(`preview-${key}`); 
                        if(preview) preview.innerHTML = `<img src="${url}">`; 
                    }
                });
            });
        }
    },

    // --- MÓDULO CREAR USUARIO ---
    UserCreator: {
        open() {
            const content = document.getElementById('create-user-content');
            if (!content) return;
            
            // Generar ID sugerido buscando el más alto
            let nextIdNum = 3; // Default u003
            try {
                const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
                const allIds = localDB.map(u => parseInt(u.id.replace('u', '')));
                if(allIds.length > 0) {
                    nextIdNum = Math.max(...allIds) + 1;
                }
            } catch(e) { console.warn("Error calculando ID", e); }
            const nextId = `u${String(nextIdNum).padStart(3, '0')}`;

            const html = `
            <div class="config-tabs">
                <button class="config-tab-btn active" onclick="window.DrawersManager.UserCreator.switchTab('acceso')">Acceso</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.UserCreator.switchTab('perfil')">Perfil</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.UserCreator.switchTab('prof')">Profesional</button>
                <button class="config-tab-btn" onclick="window.DrawersManager.UserCreator.switchTab('img')">Imágenes</button>
            </div>
            <div id="tab-acceso" class="config-tab-content active">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-shield-lock"></i> Datos de Cuenta</div>
                    <div class="form-grid">
                        <div class="span-2"><label class="form-label">Usuario *</label><input id="new-username" class="form-input" placeholder="Ej: mlopez"></div>
                        <div class="span-2"><label class="form-label">Contraseña *</label><input id="new-password" type="password" class="form-input"></div>
                        <div class="span-2"><label class="form-label">Rol *</label>
                            <select id="new-role" class="form-select">
                                <option value="doctor">Médico</option>
                                <option value="assistant">Asistente</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div class="span-2"><label class="form-label">Modelo por Defecto</label>
                            <select id="new-model" class="form-select">
                                <option value="ORL-001">Otorrinolaringología</option>
                                <option value="GEN-001">Medicina General</option>
                            </select>
                        </div>
                        <div class="span-4"><label class="form-label">ID Generado</label><input class="form-input" value="${nextId}" readonly style="opacity:0.7"></div>
                    </div>
                </div>
            </div>
            <div id="tab-perfil" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-person"></i> Datos Personales</div>
                    <div class="form-grid">
                        <div class="span-1"><label class="form-label">Título</label><input id="new-title" class="form-input"></div>
                        <div class="span-1"><label class="form-label">1er Nombre *</label><input id="new-firstname" class="form-input"></div>
                        <div class="span-1"><label class="form-label">2do Nombre</label><input id="new-secondname" class="form-input"></div>
                        <div class="span-1"><label class="form-label">1er Apellido *</label><input id="new-lastname" class="form-input"></div>
                        <div class="span-4"><label class="form-label">Ubicación</label><input id="new-location" class="form-input"></div>
                        <div class="span-2"><label class="form-label">Email</label><input id="new-email" class="form-input"></div>
                        <div class="span-2"><label class="form-label">Teléfono</label><input id="new-phone" class="form-input"></div>
                    </div>
                </div>
            </div>
            <div id="tab-prof" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-briefcase"></i> Datos Profesionales</div>
                    <div class="form-grid">
                        <div class="span-4"><label class="form-label">Especialidad</label><input id="new-specialty" class="form-input" placeholder="Especialidad para membretes"></div>
                        <div class="span-2"><label class="form-label">Matrícula</label><input id="new-license" class="form-input"></div>
                        <div class="span-2"><label class="form-label">Colegio Médico</label><input id="new-college" class="form-input"></div>
                        <div class="span-4"><label class="form-label">Etiqueta de Firma</label><input id="new-sig-label" class="form-input"></div>
                    </div>
                </div>
            </div>
            <div id="tab-img" class="config-tab-content">
                <div class="form-section">
                    <div class="form-section-title"><i class="bi bi-images"></i> Cargar Gráficos</div>
                    ${this.renderAssetCreator('Avatar', 'avatar')}
                    ${this.renderAssetCreator('Firma', 'signature')}
                    ${this.renderAssetCreator('Sello', 'stamp')}
                </div>
            </div>
            <div class="config-actions">
                <button class="icon-btn" onclick="window.DrawersManager.UserCreator.save('${nextId}')" style="width:100%; background:#10b981; color:white; height:45px; font-size:1rem;">
                    <i class="bi bi-person-plus"></i> CREAR USUARIO
                </button>
            </div>`;
            
            content.innerHTML = html;
            document.getElementById('createUserDrawer').classList.add('open');
            document.getElementById('new-username').focus();
        },
        save(userId) {
            const username = $('#new-username').value;
            const password = $('#new-password').value;
            const firstname = $('#new-firstname').value;
            const lastname = $('#new-lastname').value;
            if(!username || !password || !firstname || !lastname) { showErr("Los campos Usuario, Contraseña y Nombres son obligatorios"); return; }
            
            const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
            if(localDB.find(u => u.username === username)) { showErr("El nombre de usuario ya existe en esta sesión"); return; }

            const newUser = {
                id: userId,
                username: username,
                password: password,
                name: `${firstname} ${lastname}`, // Usado en login list
                title: $('#new-title').value || '',
                specialty: $('#new-specialty').value || '',
                role: $('#new-role').value,
                avatar: '', // Se rellena si sube imagen
                config_path: `local/user_${userId}.json`, // Ruta ficticia
                profile: {
                    id: userId,
                    role: $('#new-role').value,
                    username: username,
                    password: password,
                    title: $('#new-title').value,
                    firstname: firstname,
                    secondname: $('#new-secondname').value,
                    lastname: lastname,
                    secondlastname: '',
                    contact: {
                        email: $('#new-email').value,
                        phone: $('#new-phone').value
                    },
                    location: $('#new-location').value,
                    title_line_1: $('#new-specialty').value,
                    title_line_2: "Consultorio"
                },
                professional: {
                    specialty: $('#new-specialty').value,
                    license_number: $('#new-license').value,
                    college: $('#new-college').value,
                    signature_label: $('#new-sig-label').value
                },
                assets: {
                    avatar_path: "",
                    signature_path: "",
                    stamp_path: ""
                },
                preferences: {
                    theme: "glass",
                    default_model: $('#new-model').value
                }
            };
            localDB.push(newUser);
            localStorage.setItem('CIMA_USERS_DB', JSON.stringify(localDB));

            localStorage.setItem(`CIMA_USER_CONFIG_${userId}`, JSON.stringify(newUser));

            // Procesar Imágenes si existen
            ['avatar', 'signature', 'stamp'].forEach(key => {
                const input = document.getElementById(`input-new-${key}`);
                if (input && input.files && input.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const base64 = e.target.result;
                        localStorage.setItem(`CIMA_IMG_${userId}_${key}`, base64);
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });

            flash(`Usuario ${username} creado correctamente`);
            document.getElementById('createUserDrawer').classList.remove('open');
            if(window.refreshUserList) window.refreshUserList();
        },
        switchTab(tabName) {
            document.querySelectorAll('#createUserDrawer .config-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`#createUserDrawer .config-tab-btn[onclick*="'${tabName}'"]`).classList.add('active');
            document.querySelectorAll('#createUserDrawer .config-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tabName}`).classList.add('active');
        },
        renderAssetCreator(label, key) {
            return `
            <div class="asset-uploader">
                <div class="asset-preview" id="preview-new-${key}">
                    <i class="bi bi-image" style="font-size:1.5rem; color:#64748b;"></i>
                </div>
                <div class="asset-info">
                    <span class="asset-label">${label}</span>
                    <input type="file" id="input-new-${key}" accept="image/*" style="font-size:0.75rem; width:100%;">
                </div>
            </div>
            `;
        }
    }
};

// Exponer globalmente para que funcionen los onclick de los HTML templates
window.DrawersManager = DrawersManager;
