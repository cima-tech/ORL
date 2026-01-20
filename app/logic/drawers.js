import { $, $$, STATE, log, flash, showErr } from 'brain';

export const DrawersManager = {
    init() {
        // Inyectar el contenedor del drawer en el body dinámicamente (para no tocar index.html)
        if (!document.getElementById('createUserDrawer')) {
            const drawerHTML = `
            <div id="createUserDrawer" class="config-drawer">
                <div class="drawer-header">
                    <h3><i class="bi bi-person-plus-fill"></i> Crear Nuevo Usuario</h3>
                    <button class="icon-btn btn-close-drawer"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="drawer-content" id="create-user-content"></div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', drawerHTML);
            
            // Bind Close Event
            document.querySelector('#createUserDrawer .btn-close-drawer').addEventListener('click', () => {
                document.getElementById('createUserDrawer').classList.remove('open');
            });
        }
    },

    openCreateUser() {
        const content = document.getElementById('create-user-content');
        if (!content) return;

        // Generar ID sugerido
        const existingUsers = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
        const nextIdNum = existingUsers.length + 3; // Partimos de u003 aprox
        const nextId = `u${String(nextIdNum).padStart(3, '0')}`;

        const html = `
        <div class="config-tabs">
            <button class="config-tab-btn active" onclick="switchCreateUserTab('acceso')">Acceso</button>
            <button class="config-tab-btn" onclick="switchCreateUserTab('perfil')">Perfil</button>
            <button class="config-tab-btn" onclick="switchCreateUserTab('prof')">Profesional</button>
            <button class="config-tab-btn" onclick="switchCreateUserTab('img')">Imágenes</button>
        </div>

        <!-- TAB ACCESO -->
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

        <!-- TAB PERFIL -->
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

        <!-- TAB PROFESIONAL -->
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

        <!-- TAB IMÁGENES -->
        <div id="tab-img" class="config-tab-content">
            <div class="form-section">
                <div class="form-section-title"><i class="bi bi-images"></i> Cargar Gráficos</div>
                ${renderAssetCreator('Avatar', 'avatar')}
                ${renderAssetCreator('Firma', 'signature')}
                ${renderAssetCreator('Sello', 'stamp')}
            </div>
        </div>

        <div class="config-actions">
            <button class="icon-btn" onclick="DrawersManager.saveNewUser('${nextId}')" style="width:100%; background:#10b981; color:white; height:45px; font-size:1rem;">
                <i class="bi bi-person-plus"></i> CREAR USUARIO
            </button>
        </div>
        `;
        
        content.innerHTML = html;
        document.getElementById('createUserDrawer').classList.add('open');
        document.getElementById('new-username').focus();
    },

    saveNewUser(userId) {
        // Validaciones
        const username = $('#new-username').value;
        const password = $('#new-password').value;
        const firstname = $('#new-firstname').value;
        const lastname = $('#new-lastname').value;

        if(!username || !password || !firstname || !lastname) {
            showErr("Los campos Usuario, Contraseña y Nombres son obligatorios");
            return;
        }

        // Verificar duplicado en localStorage
        const localDB = JSON.parse(localStorage.getItem('CIMA_USERS_DB') || '[]');
        if(localDB.find(u => u.username === username)) {
            showErr("El nombre de usuario ya existe");
            return;
        }

        const timestamp = new Date().toISOString();

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

        // Guardar en LocalStorage (Simulando DB)
        localDB.push(newUser);
        localStorage.setItem('CIMA_USERS_DB', JSON.stringify(localDB));

        // Guardar Config Completa del usuario
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
        
        // Refrescar lista de login
        if(window.refreshUserList) window.refreshUserList();
    }
};

// Helper para inputs de imagen
function renderAssetCreator(label, key) {
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

// Función global para tabs
window.switchCreateUserTab = (tabName) => {
    document.querySelectorAll('#createUserDrawer .config-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`#createUserDrawer .config-tab-btn[onclick*="'${tabName}'"]`).classList.add('active');
    document.querySelectorAll('#createUserDrawer .config-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
};
