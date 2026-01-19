{
type: "file",
fileName: "toolbar.js",
fullContent: `
// app/logic/toolbar.js
import { $, $$, STATE, rotateWallpaper, log, flash } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js';

/* ================= COMPONENTES UI ================= */

function getNavGroupHTML(isSidebar) {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const p = STATE.currentUser.profile;
    const assets = STATE.currentUser.assets || {};
    
    const isLoggedIn = p.id !== "guest";
    
    const title = p.Title || p.title || "";
    const name = p.name || \`\${p.firstname} \${p.lastname}\`;
    const role = p.Specialty || p.role;
    
    // Avatar logic
    const avatarPath = assets.avatar_path ? assets.avatar_path : '';
    const avatarStyle = avatarPath ? \`background-image: url('\${avatarPath}'); color:transparent; background-size: cover;\` : '';
    const initials = p.firstname ? p.firstname.substring(0,2).toUpperCase() : "GU";

    if (!isLoggedIn) {
        return \`
        <div class="toolbar-group">
            <div class="icon-row">
                <button id="btnOpenLogin" class="icon-btn" title="Iniciar Sesión">
                    <i class="bi bi-person-circle"></i>
                </button>
            </div>
            \${!isSidebar ? '<span class="group-label">Login</span>' : ''}
        </div>\`;
    }

    const userMenu = \`
    <div class="user-menu-wrapper">
        <button id="btnUserAvatar" class="avatar-circle" style="\${avatarStyle}">\${initials}</button>
        <div id="userDropdown" class="user-dropdown hidden glass-panel">
            <div class="dropdown-header">
                <div class="dropdown-avatar-lg" style="\${avatarStyle}">\${!avatarPath ? initials : ''}</div>
                <h4>\${title} \${name}</h4>
                <p>\${role}</p>
            </div>
            <div class="dropdown-body">
                <button id="btnUserConfig" class="dropdown-item"><i class="bi bi-gear-wide-connected"></i> Configuración Global</button>
                <button id="btnChangeTheme" class="dropdown-item"><i class="bi bi-palette"></i> Cambiar Tema (\${localStorage.getItem('CIMA_THEME') || 'Glass'})</button>
                <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar"></i> Alternar Diseño</button>
                <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-image"></i> Rotar Fondo</button>
            </div>
            <div class="dropdown-footer">
                <button id="btnLogout" class="dropdown-item text-danger"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</button>
            </div>
        </div>
    </div>\`;

    return \`
    <div class="toolbar-group">
        <div class="icon-row">
            \${isSidebar ? userMenu : ''} 
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="\${activeStyle('DASHBOARD')}">
                <i class="bi bi-grid-1x2"></i>
            </button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="\${activeStyle('CONSULTATION')}">
                <i class="bi bi-activity"></i>
            </button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="\${activeStyle('AGENDA')}">
                <i class="bi bi-calendar-check"></i>
            </button>
            <button class="icon-btn" title="Finanzas" onclick="window.changeMode('BILLING')" style="\${activeStyle('BILLING')}">
                <i class="bi bi-currency-dollar"></i>
            </button>
            \${!isSidebar ? userMenu : ''} 
        </div>
        \${!isSidebar ? '<span class="group-label">Navegación</span>' : ''}
    </div>\`;
}

function getHistoryGroupHTML() {
    if (STATE.currentUser.profile.id === "guest") return '';
    return \`
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnNew" class="icon-btn" title="Nueva Historia"><i class="bi bi-person-plus"></i></button>
            <button id="btnOpen" class="icon-btn" title="Buscar Paciente"><i class="bi bi-search"></i></button>
            \${STATE.UI.isStoryOpen ? \`
                <button id="btnClose" class="icon-btn" title="Guardar Cambios"><i class="bi bi-cloud-arrow-up"></i></button>
                <button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar Ficha"><i class="bi bi-x-circle"></i></button>
            \` : ''}
        </div>
        <span class="group-label">Historia</span>
    </div>\`;
}

function getConsultToolsHTML() {
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    return \`
    <div class="v-divider"></div>
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnAddConsulta" class="icon-btn" title="Agregar Consulta"><i class="bi bi-journal-plus"></i></button>
            <button id="btnDeleteLast" class="icon-btn" title="Borrar Última"><i class="bi bi-trash3"></i></button>
        </div>
        <span class="group-label">Acciones</span>
    </div>\`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    const active = (t) => STATE.currentPreviewDoc === t ? 'background:var(--primary); color:white;' : '';
    
    return \`
    <div class="v-divider"></div>
    <div class="toolbar-group preview-group">
        <div class="icon-row">
            <button onclick="window.switchDoc('INF')" class="icon-btn" style="font-size:0.75rem; width:auto; padding:0 10px; \${active('INF')}">INFORME</button>
            <button onclick="window.switchDoc('RP')" class="icon-btn" style="font-size:0.75rem; width:auto; padding:0 10px; \${active('RP')}">RÉCIPE</button>
            <div class="v-divider" style="height:20px; margin:0 5px;"></div>
            <button id="btnToggleSign" class="icon-btn" title="Firmar Documento" style="\${STATE.USE_SIG ? 'color:#4ade80' : ''}"><i class="bi bi-pen-fill"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Descargar PNG"><i class="bi bi-download"></i></button>
            <button id="btnShareWhatsapp" class="icon-btn" title="Enviar WhatsApp"><i class="bi bi-whatsapp"></i></button>
            <button id="btnExitPreview" class="icon-btn text-danger"><i class="bi bi-x-lg"></i></button>
        </div>
        <span class="group-label" style="color:var(--success);">Vista Previa</span>
    </div>\`;
}

/* ================= RENDER PRINCIPAL ================= */

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;

    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    // Manejo de visibilidad de contenedores
    const toggle = (id, show) => document.getElementById(id)?.classList.toggle('hidden', !show);
    const isLoggedIn = STATE.currentUser.profile.id !== "guest";
    const isConsultation = STATE.UI.currentMode === 'CONSULTATION';

    toggle('previewShell', STATE.UI.isPreviewMode && isLoggedIn);
    toggle('patientForm', !STATE.UI.isPreviewMode && STATE.UI.isStoryOpen && isConsultation && isLoggedIn);
    toggle('visitsContainer', !STATE.UI.isPreviewMode && STATE.UI.isStoryOpen && isConsultation && isLoggedIn);

    let html = \`<div class="toolbar-container \${isSidebar ? 'layout-sidebar' : 'layout-toolbar'}"><div class="floating-bar">\`;

    if (isSidebar) {
        html += getNavGroupHTML(true);
        html += \`<div class="v-divider"></div>\`;
        html += getPreviewGroupHTML();
        html += getConsultToolsHTML();
        html += getHistoryGroupHTML();
    } else {
        if (isConsultation && isLoggedIn) {
            html += getHistoryGroupHTML();
            html += getConsultToolsHTML();
            html += getPreviewGroupHTML();
            html += \`<div class="v-divider"></div>\`;
        }
        html += getNavGroupHTML(false);
    }

    html += \`</div></div>\`;
    mount.innerHTML = html;
    bindEvents();
}

/* ================= CONFIG DRAWER & LOGIC ================= */

// Estructura de pestañas para configuración
const CONFIG_TABS = [
    { id: 'profile', icon: 'bi-person-vcard', label: 'Perfil' },
    { id: 'professional', icon: 'bi-briefcase', label: 'Profesional' },
    { id: 'institution', icon: 'bi-building', label: 'Institución' },
    { id: 'docs', icon: 'bi-file-earmark-text', label: 'Documentos' },
    { id: 'assets', icon: 'bi-images', label: 'Gráficos' }
];

function openConfigDrawer() {
    const configContent = document.getElementById('config-content');
    if (!configContent) return;
    
    const user = STATE.currentUser;
    const p = user.profile || {};
    const pro = user.professional || {};
    const inst = user.institution || {};
    const docs = user.documents?.vertical?.content_margins_cm || { top:1, bottom:1, left:1, right:1 };
    
    // Generar Navegación de Pestañas
    let navHTML = '<div class="config-tabs-nav">';
    CONFIG_TABS.forEach((tab, index) => {
        navHTML += \`
            <button class="tab-btn \${index === 0 ? 'active' : ''}" onclick="window.switchConfigTab('\${tab.id}')">
                <i class="bi \${tab.icon}"></i> \${tab.label}
            </button>\`;
    });
    navHTML += '</div>';

    // Generar Contenido de Pestañas
    let contentHTML = '<div class="config-tabs-content">';

    // 1. PERFIL
    contentHTML += \`
    <div id="tab-profile" class="tab-pane active">
        <div class="form-grid">
            <div class="span-2"><label>Nombre Completo</label><input id="cfg-name" class="form-input" value="\${p.name || ''}"></div>
            <div class="span-1"><label>Título (Dr/Dra)</label><input id="cfg-title" class="form-input" value="\${p.title || ''}"></div>
            <div class="span-1"><label>Usuario</label><input class="form-input" value="\${p.username || ''}" disabled></div>
            <div class="span-1"><label>Teléfono 1</label><input id="cfg-phone" class="form-input" value="\${p.contact?.phone || ''}"></div>
            <div class="span-1"><label>Teléfono 2</label><input id="cfg-phone2" class="form-input" value="\${p.contact?.phone2 || ''}"></div>
            <div class="span-2"><label>Email Principal</label><input id="cfg-email" class="form-input" value="\${p.contact?.email || ''}"></div>
            <div class="span-4"><label>Ubicación</label><input id="cfg-location" class="form-input" value="\${p.location || ''}"></div>
        </div>
    </div>\`;

    // 2. PROFESIONAL
    contentHTML += \`
    <div id="tab-professional" class="tab-pane hidden">
        <div class="form-grid">
            <div class="span-2"><label>Especialidad</label><input id="cfg-specialty" class="form-input" value="\${pro.specialty || ''}"></div>
            <div class="span-2"><label>N° Licencia / MPPS</label><input id="cfg-license" class="form-input" value="\${pro.license_number || ''}"></div>
            <div class="span-2"><label>Colegio Médico</label><input id="cfg-college" class="form-input" value="\${pro.college || ''}"></div>
            <div class="span-2"><label>Etiqueta Firma</label><input id="cfg-sign-label" class="form-input" value="\${pro.signature_label || ''}"></div>
            <div class="span-4"><label>Pie Legal (Footer)</label><textarea id="cfg-legal" class="form-input" rows="3">\${pro.legal_footer || ''}</textarea></div>
        </div>
    </div>\`;

    // 3. INSTITUCION
    contentHTML += \`
    <div id="tab-institution" class="tab-pane hidden">
        <div class="form-grid">
            <div class="span-4"><label>Nombre Institución</label><input id="cfg-inst-name" class="form-input" value="\${inst.name || ''}"></div>
            <div class="span-4"><label>Dirección</label><input id="cfg-inst-addr" class="form-input" value="\${inst.address || ''}"></div>
            <div class="span-2"><label>Servicio / Dpto</label><input id="cfg-inst-service" class="form-input" value="\${inst.service || ''}"></div>
        </div>
    </div>\`;

    // 4. DOCUMENTOS
    contentHTML += \`
    <div id="tab-docs" class="tab-pane hidden">
        <h4>Márgenes de Impresión (cm)</h4>
        <div class="form-grid">
            <div class="span-1"><label>Superior</label><input type="number" step="0.1" id="cfg-margin-top" class="form-input" value="\${docs.top}"></div>
            <div class="span-1"><label>Inferior</label><input type="number" step="0.1" id="cfg-margin-bottom" class="form-input" value="\${docs.bottom}"></div>
            <div class="span-1"><label>Izquierdo</label><input type="number" step="0.1" id="cfg-margin-left" class="form-input" value="\${docs.left}"></div>
            <div class="span-1"><label>Derecho</label><input type="number" step="0.1" id="cfg-margin-right" class="form-input" value="\${docs.right}"></div>
        </div>
    </div>\`;

    // 5. ASSETS (Gráficos)
    const assetRow = (label, key) => \`
        <div class="asset-row">
            <div class="asset-info">
                <label>\${label}</label>
                <div class="asset-path">\${user.assets?.[key] || 'No definido'}</div>
            </div>
            <div class="asset-actions">
                <label class="btn-upload">
                    <i class="bi bi-upload"></i> Subir
                    <input type="file" accept="image/png" onchange="window.handleAssetUpload(this, '\${key}')" hidden>
                </label>
                \${user.assets?.[key] ? \`<button class="btn-preview" onclick="window.open('\${user.assets[key]}', '_blank')"><i class="bi bi-eye"></i></button>\` : ''}
            </div>
        </div>\`;

    contentHTML += \`
    <div id="tab-assets" class="tab-pane hidden">
        <div class="assets-list">
            \${assetRow('Avatar Usuario', 'avatar_path')}
            \${assetRow('Cabecera (Header)', 'header_path')}
            \${assetRow('Pie de Página (Footer)', 'footer_path')}
            \${assetRow('Firma Digital', 'signature_path')}
            \${assetRow('Sello Húmedo', 'stamp_path')}
        </div>
    </div>\`;

    contentHTML += '</div>'; // End content

    // Acciones Footer
    const footerHTML = \`
        <div class="config-actions">
            <button class="icon-btn success" onclick="window.saveConfigGlobal()" style="width:100%; justify-content:center;">
                <i class="bi bi-save"></i> Guardar Configuración
            </button>
        </div>\`;

    configContent.innerHTML = navHTML + contentHTML + footerHTML;
    document.getElementById('configDrawer').classList.add('open');
}

// Helpers Globales para la UI de Configuración
window.switchConfigTab = (tabId) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    
    // Activar
    const btn = document.querySelector(\`.tab-btn[onclick*="\${tabId}"]\`);
    if(btn) btn.classList.add('active');
    document.getElementById(\`tab-\${tabId}\`).classList.remove('hidden');
};

window.handleAssetUpload = (input, key) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Simulamos guardado actualizando el estado local
            if(!STATE.currentUser.assets) STATE.currentUser.assets = {};
            STATE.currentUser.assets[key] = e.target.result; // Data URL
            flash('Imagen cargada temporalmente. Guarde para aplicar.');
            openConfigDrawer(); // Recargar para ver cambios
        }
        reader.readAsDataURL(input.files[0]);
    }
};

window.saveConfigGlobal = () => {
    // Aquí mapeamos todos los inputs de vuelta al objeto STATE
    // (Simplificado para el ejemplo, deberías mapear todos)
    const p = STATE.currentUser.profile;
    p.name = $('#cfg-name').value;
    p.title = $('#cfg-title').value;
    if(!p.contact) p.contact = {};
    p.contact.phone = $('#cfg-phone').value;
    // ... mapear el resto ...
    
    flash('Configuración guardada (En memoria)');
    document.getElementById('configDrawer').classList.remove('open');
    renderToolbar(); // Refrescar UI con nuevos datos
};

/* ================= EVENT BINDING ================= */

function bindEvents() {
    window.changeMode = (m) => { 
        STATE.UI.currentMode = m; 
        STATE.UI.isPreviewMode = false; 
        renderToolbar(); 
    };
    
    window.switchDoc = (t) => { 
        if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); 
    };

    // Listeners básicos
    document.getElementById('btnOpenLogin')?.addEventListener('click', () => document.getElementById('loginDrawer').classList.add('open'));
    
    document.querySelectorAll('.btn-close-drawer').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.login-drawer, .config-drawer').classList.remove('open');
        });
    });

    document.getElementById('btnToggleLayout')?.addEventListener('click', (e) => {
        STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar';
        renderToolbar();
    });

    document.getElementById('btnUserConfig')?.addEventListener('click', openConfigDrawer);
    document.getElementById('btnChangeTheme')?.addEventListener('click', () => {
        const themes = ['glass', 'liquid', 'light', 'dusk'];
        const current = document.body.className.match(/theme-(\\w+)/)?.[1] || 'glass';
        const next = themes[(themes.indexOf(current) + 1) % themes.length];
        document.body.className = \`theme-\${next}\`;
        localStorage.setItem('CIMA_THEME', next);
    });

    document.getElementById('btnNew')?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar historia actual?")) return; 
        resetStory(); 
        STATE.UI.isStoryOpen = true; 
        try { ServiceLoader.get('patient').initializeNewPatient(); } catch(e) { console.error(e); }
        renderToolbar(); 
    });
    
    document.getElementById('btnClose')?.addEventListener('click', () => { 
        if(saveCurrentHistory()) flash('Guardado'); 
    });
    
    document.getElementById('btnOpen')?.addEventListener('click', () => { 
        const query = prompt("Buscar paciente (nombre o documento):");
        if(query) {
            const results = getSearchResults(query);
            if(results.length > 0) loadHistoryRecord(results[0]);
            else alert("No se encontraron resultados.");
        }
    });
    
    document.getElementById('btnAddConsulta')?.addEventListener('click', handleAddConsulta);
    
    document.getElementById('btnDeleteLast')?.addEventListener('click', () => { 
        if(confirm("¿Borrar última consulta?")) document.getElementById('visitsContainer').firstChild?.remove(); 
    });
    
    document.getElementById('btnExitPreview')?.addEventListener('click', () => { 
        STATE.UI.isPreviewMode = false; 
        renderToolbar(); 
    });
    
    document.getElementById('btnToggleSign')?.addEventListener('click', () => { 
        STATE.USE_SIG = !STATE.USE_SIG; 
        window.switchDoc(STATE.currentPreviewDoc); 
    });

    document.getElementById('btnOpenExport')?.addEventListener('click', async () => {
        const { exportToPNG } = await import('./service_loader.js').then(m => m.ServiceLoader.get('export'));
        exportToPNG();
    });
    
    document.getElementById('btnShareWhatsapp')?.addEventListener('click', async () => {
         const { shareViaWhatsApp } = await import('./service_loader.js').then(m => m.ServiceLoader.get('export'));
         shareViaWhatsApp();
    });

    // Dropdown Logic
    const avatarBtn = document.getElementById('btnUserAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if(avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if(!userDropdown.classList.contains('hidden') && !userDropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    document.getElementById('btnChangeWallpaper')?.addEventListener('click', rotateWallpaper);
    document.getElementById('btnLogout')?.addEventListener('click', logout);
}

function logout() {
    if(confirm("¿Cerrar sesión?")) {
        STATE.currentUser = { profile: { id: "guest", role: "guest" }, preferences: {}, assets: {} };
        resetStory();
        renderToolbar();
        log("Sesión cerrada");
    }
}

export function initToolbarEvents() { renderToolbar(); }

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); 
    if(!card || STATE.currentUser.profile.id === "guest") return;
    
    STATE.currentPreviewCard = card; 
    STATE.currentPreviewDoc = kind; 
    STATE.UI.isPreviewMode = true;
    
    const mod = kind === 'INF' ? ServiceLoader.get('informe') : ServiceLoader.get('recipe');
    const html = kind === 'INF' ? mod.buildReportHTML(card) : mod.buildRecipeHTML(card);
    
    document.getElementById('docPreview').innerHTML = html; 
    renderToolbar();
};
`
}
