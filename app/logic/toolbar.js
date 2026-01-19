// app/logic/toolbar.js
import { $, $$, STATE, rotateWallpaper, log, flash } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js';

/* ================= COMPONENTES UI ================= */

function getNavGroupHTML(isSidebar) {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const p = STATE.currentUser.profile;
    
    const isLoggedIn = p.id !== "guest";
    
    const title = p.Title || p.title || "";
    const name = p.name || `${p.firstname} ${p.lastname}`;
    const role = p.Specialty || p.role;
    
    // CORRECCIÓN: Usar ruta absoluta para GitHub Pages
    const avatarPath = p.assets?.avatar_path ? 
        (p.assets.avatar_path.startsWith('./') ? p.assets.avatar_path.substring(1) : p.assets.avatar_path) : '';
    
    const avatarStyle = avatarPath ? `background-image: url('${avatarPath}'); color:transparent;` : '';
    const initials = p.name ? p.name.substring(0,2).toUpperCase() : "U";

    if (!isLoggedIn) {
        return `
        <div class="toolbar-group">
            <div class="icon-row">
                <button id="btnOpenLogin" class="icon-btn" title="Iniciar Sesión">
                    <i class="bi bi-person-circle"></i>
                </button>
            </div>
            ${!isSidebar ? '<span class="group-label">Login</span>' : ''}
        </div>`;
    }

    const userMenu = `
    <div class="user-menu-wrapper">
        <button id="btnUserAvatar" class="avatar-circle" style="${avatarStyle}">${initials}</button>
        <div id="userDropdown" class="user-dropdown hidden">
            <div class="dropdown-header">
                <h4>${title} ${name}</h4>
                <p>${role}</p>
            </div>
            <button id="btnUserConfig" class="dropdown-item"><i class="bi bi-person-gear"></i> Configuración</button>
            <button id="btnChangeTheme" class="dropdown-item"><i class="bi bi-palette"></i> Cambiar Tema</button>
            <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar"></i> Alternar Barra/Menú</button>
            <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Fondo</button>
            <div class="dropdown-divider"></div>
            <button id="btnLogout" class="dropdown-item text-danger"><i class="bi bi-power"></i> Salir</button>
        </div>
    </div>`;

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            ${isSidebar ? userMenu : ''} 
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}">
                <i class="bi bi-speedometer2"></i>
            </button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}">
                <i class="bi bi-heart-pulse"></i>
            </button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="${activeStyle('AGENDA')}">
                <i class="bi bi-calendar-week"></i>
            </button>
            <button class="icon-btn" title="Facturación" onclick="window.changeMode('BILLING')" style="${activeStyle('BILLING')}">
                <i class="bi bi-receipt"></i>
            </button>
            ${!isSidebar ? userMenu : ''} 
        </div>
        ${!isSidebar ? '<span class="group-label">Navegación</span>' : ''}
    </div>`;
}

function getHistoryGroupHTML() {
    if (STATE.currentUser.profile.id === "guest") return '';
    
    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnNew" class="icon-btn" title="Nueva"><i class="bi bi-file-earmark-plus"></i></button>
            <button id="btnOpen" class="icon-btn" title="Abrir"><i class="bi bi-folder2-open"></i></button>
            ${STATE.UI.isStoryOpen ? `
                <button id="btnClose" class="icon-btn" title="Guardar"><i class="bi bi-floppy"></i></button>
                <button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar"><i class="bi bi-x-lg"></i></button>
            ` : ''}
        </div>
        <span class="group-label">Historia</span>
    </div>`;
}

function getConsultToolsHTML() {
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnAddConsulta" class="icon-btn" title="Agregar"><i class="bi bi-plus-lg"></i></button>
            <button id="btnDeleteLast" class="icon-btn" title="Borrar"><i class="bi bi-dash-lg"></i></button>
        </div>
        <span class="group-label">Consulta</span>
    </div>`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    
    const active = (t) => STATE.currentPreviewDoc === t ? 'background:var(--primary);' : '';
    
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group preview-group">
        <div class="icon-row">
            <button onclick="window.switchDoc('INF')" class="icon-btn" style="font-size:0.7rem; width:auto; ${active('INF')}">INF</button>
            <button onclick="window.switchDoc('RP')" class="icon-btn" style="font-size:0.7rem; width:auto; ${active('RP')}">RP</button>
            <div class="v-divider" style="height:20px;"></div>
            <button id="btnToggleSign" class="icon-btn" title="Firmar"><i class="bi bi-pen-fill"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Exportar"><i class="bi bi-share-fill"></i></button>
            <button id="btnExitPreview" class="icon-btn"><i class="bi bi-x-lg"></i></button>
        </div>
        <span class="group-label" style="color:var(--success);">Vista Previa</span>
    </div>`;
}

/* ================= RENDER PRINCIPAL ================= */

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;

    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    const previewShell = document.getElementById('previewShell');
    const form = document.getElementById('patientForm');
    const visits = document.getElementById('visitsContainer');

    if (STATE.UI.isPreviewMode && STATE.currentUser.profile.id !== "guest") {
        previewShell.classList.remove('hidden');
        form.classList.add('hidden');
        visits.classList.add('hidden');
    } else {
        previewShell.classList.add('hidden');
        if (STATE.UI.isStoryOpen && STATE.UI.currentMode === 'CONSULTATION' && STATE.currentUser.profile.id !== "guest") {
            form.classList.remove('hidden');
            visits.classList.remove('hidden');
        } else {
            form.classList.add('hidden');
            visits.classList.add('hidden');
        }
    }

    let html = `<div class="toolbar-container ${isSidebar ? 'layout-sidebar' : 'layout-toolbar'}"><div class="floating-bar">`;

    if (isSidebar) {
        html += getNavGroupHTML(true);
        html += `<div class="v-divider"></div>`;
        html += getPreviewGroupHTML();
        html += getConsultToolsHTML();
        html += getHistoryGroupHTML();
    } else {
        if (STATE.UI.currentMode === 'CONSULTATION' && STATE.currentUser.profile.id !== "guest") {
            html += getHistoryGroupHTML();
            html += getConsultToolsHTML();
            html += getPreviewGroupHTML();
            html += `<div class="v-divider"></div>`;
        }
        html += getNavGroupHTML(false);
    }

    html += `</div></div>`;
    mount.innerHTML = html;
    bindEvents();
}

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

    document.getElementById('btnOpenLogin')?.addEventListener('click', () => {
        document.getElementById('loginDrawer').classList.add('open');
    });

    document.querySelectorAll('.btn-close-drawer').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.login-drawer, .config-drawer').classList.remove('open');
        });
    });

    document.getElementById('btnToggleLayout')?.addEventListener('click', (e) => {
        e.stopPropagation();
        STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar';
        renderToolbar();
    });

    document.getElementById('btnUserConfig')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openConfigDrawer();
    });

    document.getElementById('btnChangeTheme')?.addEventListener('click', (e) => {
        e.stopPropagation();
        rotateTheme();
    });

    document.getElementById('btnNew')?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar historia actual?")) return; 
        resetStory(); 
        STATE.UI.isStoryOpen = true; 
        ServiceLoader.get('patient').initializeNewPatient(); 
        renderToolbar(); 
    });
    
    document.getElementById('btnClose')?.addEventListener('click', () => { 
        if(saveCurrentHistory()) flash('Guardado'); 
    });
    
    document.getElementById('btnOpen')?.addEventListener('click', () => { 
        const query = prompt("Buscar paciente (nombre o documento):");
        if(query) {
            const results = getSearchResults(query);
            if(results.length > 0) {
                loadHistoryRecord(results[0]);
            } else {
                alert("No se encontraron resultados.");
            }
        }
    });
    
    document.getElementById('btnAddConsulta')?.addEventListener('click', handleAddConsulta);
    
    document.getElementById('btnDeleteLast')?.addEventListener('click', () => { 
        if(confirm("¿Borrar última consulta?")) { 
            document.getElementById('visitsContainer').firstChild?.remove(); 
        }
    });
    
    document.getElementById('btnExitPreview')?.addEventListener('click', () => { 
        STATE.UI.isPreviewMode = false; 
        renderToolbar(); 
    });
    
    document.getElementById('btnToggleSign')?.addEventListener('click', () => { 
        STATE.USE_SIG = !STATE.USE_SIG; 
        window.switchDoc(STATE.currentPreviewDoc); 
    });

    const avatarBtn = document.getElementById('btnUserAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if(avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if(!userDropdown.classList.contains('hidden') && 
               !userDropdown.contains(e.target) && 
               !avatarBtn.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    document.getElementById('btnChangeWallpaper')?.addEventListener('click', (e) => {
        e.stopPropagation();
        rotateWallpaper();
    });
    
    document.getElementById('btnLogout')?.addEventListener('click', () => logout());
}

/* ================= FUNCIONES DE NEGOCIO ================= */

function logout() {
    if(confirm("¿Cerrar sesión?")) {
        STATE.currentUser = {
            profile: {
                id: "guest",
                role: "guest",
                username: "guest",
                title: "",
                firstname: "Usuario",
                lastname: "",
                title_line_1: "",
                contact: {},
                location: ""
            },
            preferences: {
                theme: "glass",
                default_model: "ORL-001"
            },
            assets: {}
        };
        
        resetStory();
        renderToolbar();
        log("Sesión cerrada");
    }
}

function rotateTheme() {
    const themes = ['glass', 'liquid', 'light', 'dusk'];
    const currentTheme = document.body.className.match(/theme-(\w+)/)?.[1] || 'glass';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    document.body.className = `theme-${nextTheme}`;
    localStorage.setItem('CIMA_THEME', nextTheme);
    log(`Tema cambiado a: ${nextTheme}`);
}

function openConfigDrawer() {
    const configContent = document.getElementById('config-content');
    if (!configContent) return;
    
    const user = STATE.currentUser;
    
    const formHTML = `
        <div class="config-section">
            <h4><i class="bi bi-person"></i> Perfil</h4>
            <div class="form-grid">
                <div class="span-2">
                    <label>Nombre Completo</label>
                    <input class="form-input" id="config-name" value="${user.profile.name || ''}">
                </div>
                <div class="span-1">
                    <label>Título</label>
                    <input class="form-input" id="config-title" value="${user.profile.title || ''}">
                </div>
                <div class="span-1">
                    <label>Especialidad</label>
                    <input class="form-input" id="config-specialty" value="${user.profile.Specialty || ''}">
                </div>
            </div>
        </div>
        
        <div class="config-section">
            <h4><i class="bi bi-telephone"></i> Contacto</h4>
            <div class="form-grid">
                <div class="span-1">
                    <label>Teléfono</label>
                    <input class="form-input" id="config-phone" value="${user.profile.contact?.phone || ''}">
                </div>
                <div class="span-1">
                    <label>Email</label>
                    <input class="form-input" id="config-email" value="${user.profile.contact?.email || ''}">
                </div>
                <div class="span-2">
                    <label>Ubicación</label>
                    <input class="form-input" id="config-location" value="${user.profile.location || ''}">
                </div>
            </div>
        </div>
        
        <div class="config-actions">
            <button class="icon-btn" onclick="saveConfig()" style="width:100%; background:var(--primary);">
                <i class="bi bi-save"></i> Guardar Cambios
            </button>
        </div>
    `;
    
    configContent.innerHTML = formHTML;
    document.getElementById('configDrawer').classList.add('open');
}

// Función global para guardar configuración
window.saveConfig = async () => {
    const updatedUser = {
        ...STATE.currentUser,
        profile: {
            ...STATE.currentUser.profile,
            name: document.getElementById('config-name').value,
            title: document.getElementById('config-title').value,
            Specialty: document.getElementById('config-specialty').value,
            contact: {
                ...STATE.currentUser.profile.contact,
                phone: document.getElementById('config-phone').value,
                email: document.getElementById('config-email').value
            },
            location: document.getElementById('config-location').value
        }
    };
    
    STATE.currentUser = updatedUser;
    
    log("Configuración actualizada (guardar persistente pendiente)");
    document.getElementById('configDrawer').classList.remove('open');
};

export function initToolbarEvents() { 
    renderToolbar(); 
}

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); 
    if(!card || STATE.currentUser.profile.id === "guest") return;
    
    STATE.currentPreviewCard = card; 
    STATE.currentPreviewDoc = kind; 
    STATE.UI.isPreviewMode = true;
    
    let html = kind === 'INF' 
        ? ServiceLoader.get('informe').buildReportHTML(card) 
        : ServiceLoader.get('recipe').buildRecipeHTML(card);
    
    document.getElementById('docPreview').innerHTML = html; 
    renderToolbar();
};

