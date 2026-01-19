// app/logic/toolbar.js
import { $, $$, STATE, rotateWallpaper, log, fmtDate, flash } from 'brain';
import { ServiceLoader } from './service_loader.js'; 
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

/* ================= COMPONENTES UI ================= */

function getNavGroupHTML(isSidebar) {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const p = STATE.currentUser.profile;
    
    // Verificar si hay usuario logueado
    const isLoggedIn = p.id !== "guest";
    
    // Normalizar datos
    const title = p.Title || p.title || "";
    const name = p.name || `${p.firstname} ${p.lastname}`;
    const role = p.Specialty || p.role;
    
    const avatarStyle = p.assets?.avatar_path ? `background-image: url('${p.assets.avatar_path}'); color:transparent;` : '';
    const initials = p.username ? p.username.substring(0,2).toUpperCase() : "U";

    // Si no está logueado, mostrar botón de login
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

    // Usuario logueado - Menú completo
    const userMenu = `
    <div class="user-menu-wrapper">
        <button id="btnUserAvatar" class="avatar-circle" style="${avatarStyle}">${initials}</button>
        <div id="userDropdown" class="user-dropdown hidden">
            <div class="dropdown-header">
                <h4>${title} ${name}</h4>
                <p>${role}</p>
            </div>
            <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Configuración</button>
            <button id="btnThemeSwitcher" class="dropdown-item"><i class="bi bi-palette"></i> Cambiar Tema</button>
            <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar"></i> Alternar Barra/Menú</button>
            <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Fondo</button>
            <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
            <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-power"></i> Salir</button>
        </div>
    </div>`;

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            ${isSidebar ? userMenu : ''} 
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="${activeStyle('AGENDA')}"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" onclick="window.changeMode('BILLING')" style="${activeStyle('BILLING')}"><i class="bi bi-receipt"></i></button>
            ${!isSidebar ? userMenu : ''} 
        </div>
        ${!isSidebar ? '<span class="group-label">Navegación</span>' : ''}
    </div>`;
}

function getHistoryGroupHTML() {
    // Solo mostrar si hay usuario logueado
    if (STATE.currentUser.profile.id === "guest") return '';
    
    return `<div class="toolbar-group"><div class="icon-row"><button id="btnNew" class="icon-btn" title="Nueva"><i class="bi bi-file-earmark-plus"></i></button><button id="btnOpen" class="icon-btn" title="Abrir"><i class="bi bi-folder2-open"></i></button>${STATE.UI.isStoryOpen ? `<button id="btnClose" class="icon-btn" title="Guardar"><i class="bi bi-floppy"></i></button><button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar"><i class="bi bi-x-lg"></i></button>` : ''}</div><span class="group-label">Historia</span></div>`;
}

function getConsultToolsHTML() {
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    return `<div class="v-divider"></div><div class="toolbar-group animate-fade"><div class="icon-row"><button id="btnAddConsulta" class="icon-btn" title="Agregar"><i class="bi bi-plus-lg"></i></button><button id="btnDeleteLast" class="icon-btn" title="Borrar"><i class="bi bi-dash-lg"></i></button></div><span class="group-label">Consulta</span></div>`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    const active = (t) => STATE.currentPreviewDoc === t ? 'background:var(--primary);' : '';
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade" style="background:rgba(0,0,0,0.3); border-radius:12px; padding:0 10px;">
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

/* ================= RENDER ================= */

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;

    // Body Class Layout
    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    // Determinar visibilidad de elementos según estado
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
    html += getModalsHTML(); 

    mount.innerHTML = html;
    bindEvents();
}

function bindEvents() {
    window.changeMode = (m) => { 
        STATE.UI.currentMode = m; 
        STATE.UI.isPreviewMode = false; 
        renderToolbar(); 
    };
    
    window.switchDoc = (t) => { 
        if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); 
    };

    // Botón Login (solo cuando no hay sesión)
    $("#btnOpenLogin")?.addEventListener('click', () => {
        document.getElementById('loginDrawer').classList.add('open');
    });

    // Cerrar Login Drawer
    $(".btn-close-login")?.addEventListener('click', () => {
        document.getElementById('loginDrawer').classList.remove('open');
    });

    // Layout Toggle
    $("#btnToggleLayout")?.addEventListener('click', (e) => {
        e.stopPropagation();
        STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar';
        renderToolbar();
    });

    // Profile Settings Expandido
    $("#btnUserProfile")?.addEventListener('click', (e) => {
        e.stopPropagation();
        openSettingsModal();
    });

    // Theme Switcher
    $("#btnThemeSwitcher")?.addEventListener('click', (e) => {
        e.stopPropagation();
        openThemeSelector();
    });

    // ... (Standard Listeners V5.2) ...
    $("#btnNew")?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar?")) return; 
        resetStory(); 
        STATE.UI.isStoryOpen = true; 
        ServiceLoader.get('patient').initializeNewPatient(); 
        renderToolbar(); 
    });
    
    $("#btnClose")?.addEventListener('click', () => { 
        if(saveCurrentHistory()) flash('Guardado'); 
    });
    
    $("#btnOpen")?.addEventListener('click', () => { 
        $("#searchModal").classList.add('active'); 
        $("#searchValue").focus(); 
        $("#searchResultsList").innerHTML=''; 
    });
    
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal").classList.remove('active'));
    $("#btnDoSearch")?.addEventListener('click', runSearch);
    $("#searchValue")?.addEventListener('keypress', (e)=>{if(e.key==='Enter') runSearch()});
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { if(confirm("¿Borrar?")) { $("#visitsContainer").firstChild?.remove(); }});
    $("#btnExitPreview")?.addEventListener('click', () => { STATE.UI.isPreviewMode = false; renderToolbar(); });
    $("#btnToggleSign")?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; window.switchDoc(STATE.currentPreviewDoc); });
    
    // User Dropdown Logic
    const av=$("#btnUserAvatar"), mn=$("#userDropdown");
    if(av && mn) {
        av.onclick=(e)=>{e.stopPropagation(); mn.classList.toggle('hidden')};
        document.onclick=(e)=>{if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden')};
        $("#btnChangeWallpaper")?.addEventListener('click', (e)=>{e.stopPropagation(); rotateWallpaper()});
        $("#btnLogout")?.addEventListener('click', ()=>logout());
    }
    
    $$(".btn-close-modal").forEach(btn => btn.addEventListener('click', () => {
        $(".settings-modal")?.parentElement.classList.remove('active');
        $(".modal-box")?.parentElement.classList.remove('active');
        $(".theme-modal")?.parentElement.classList.remove('active');
    }));
}

/* ================= FUNCIONES NUEVAS ================= */

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
                theme: "dark",
                default_model: "ORL-001"
            },
            assets: { avatar_path: "", header_path: "", footer_path: "" }
        };
        
        resetStory();
        renderToolbar();
        log("Sesión cerrada");
    }
}

function openSettingsModal() {
    const p = STATE.currentUser.profile;
    const a = STATE.currentUser.assets;
    
    // Llenar campos
    $("#confName").value = p.name || "";
    $("#confTitle").value = p.Title || p.title || "";
    $("#confSpec").value = p.Specialty || p.specialty || "";
    $("#confPhone").value = p.contact?.phone || "";
    $("#confEmail").value = p.contact?.email || "";
    $("#confLocation").value = p.location || "";
    
    // Cargar preview de imágenes
    const prevHeader = $("#previewHeaderSim");
    if(prevHeader) prevHeader.style.backgroundImage = `url('${a.header_path}')`;
    
    $("#settingsModal").classList.add('active');
}

function openThemeSelector() {
    const currentTheme = document.body.className.match(/theme-\w+/)?.[0] || 'theme-glass';
    
    $("#themeModal").classList.add('active');
    
    // Marcar tema actual
    setTimeout(() => {
        $$(".theme-option").forEach(opt => {
            opt.classList.remove('active');
            if(opt.dataset.theme === currentTheme) {
                opt.classList.add('active');
            }
        });
    }, 10);
}

/* ================= MODALES HTML (Expandido) ================= */

function getModalsHTML() {
    return `
    <!-- Modal de Búsqueda -->
    <div id="searchModal" class="modal-overlay">
        <div class="modal-box glass">
            <h3 style="color:var(--accent)">Buscar</h3>
            <input id="searchValue" class="form-input">
            <div id="searchResultsList"></div>
            <button id="btnCancelSearch" class="icon-btn btn-close-modal">X</button>
        </div>
    </div>
    
    <!-- Modal de Configuración Expandido -->
    <div id="settingsModal" class="modal-overlay">
        <div class="settings-modal">
            <div class="settings-sidebar">
                <div class="settings-section-title">Datos del Usuario</div>
                <div class="form-grid" style="grid-template-columns: 1fr;">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input id="confName" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Título (Dr/Dra)</label>
                        <input id="confTitle" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Especialidad</label>
                        <input id="confSpec" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input id="confPhone" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input id="confEmail" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Ubicación</label>
                        <input id="confLocation" class="form-input">
                    </div>
                </div>
                
                <div class="settings-section-title">Imágenes</div>
                <div class="form-grid" style="grid-template-columns: 1fr;">
                    <div class="file-upload-group">
                        <label class="file-upload-label">
                            <i class="bi bi-cloud-arrow-up"></i> Cabecera
                            <input type="file" id="confHeader" class="file-upload-input" accept="image/png">
                        </label>
                    </div>
                    <div class="file-upload-group">
                        <label class="file-upload-label">
                            <i class="bi bi-cloud-arrow-up"></i> Pie de página
                            <input type="file" id="confFooter" class="file-upload-input" accept="image/png">
                        </label>
                    </div>
                    <div class="file-upload-group">
                        <label class="file-upload-label">
                            <i class="bi bi-cloud-arrow-up"></i> Firma
                            <input type="file" id="confSignature" class="file-upload-input" accept="image/png">
                        </label>
                    </div>
                    <div class="file-upload-group">
                        <label class="file-upload-label">
                            <i class="bi bi-cloud-arrow-up"></i> Sello
                            <input type="file" id="confStamp" class="file-upload-input" accept="image/png">
                        </label>
                    </div>
                </div>
                
                <div style="margin-top:20px; text-align:right;">
                    <button class="icon-btn btn-close-modal" style="width:auto; padding:0 20px; font-size:0.9rem;">Cerrar</button>
                </div>
            </div>
            
            <div class="settings-preview-area">
                <div class="settings-section-title" style="position:absolute; top:20px; left:20px;">Vista Previa</div>
                <div class="doc-simulated">
                    <div id="previewHeaderSim" class="doc-sim-header"></div>
                    <div class="doc-sim-body">
                        <p style="margin:5px 0;">Nombre: <span id="previewName">${STATE.currentUser.profile.name || ''}</span></p>
                        <p style="margin:5px 0;">Especialidad: <span id="previewSpec">${STATE.currentUser.profile.Specialty || ''}</span></p>
                        <p style="margin:5px 0;">Teléfono: <span id="previewPhone">${STATE.currentUser.profile.contact?.phone || ''}</span></p>
                    </div>
                    <div class="doc-sim-footer"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal de Selección de Tema -->
    <div id="themeModal" class="modal-overlay">
        <div class="modal-box" style="max-width:500px;">
            <h3 style="color:var(--accent); margin-bottom:20px;">Cambiar Tema Visual</h3>
            <div class="theme-selector">
                <div class="theme-option" data-theme="theme-glass" onclick="switchTheme('glass')">
                    <i class="bi bi-droplet" style="font-size:2rem; display:block; margin-bottom:5px;"></i>
                    Glass
                </div>
                <div class="theme-option" data-theme="theme-liquid" onclick="switchTheme('liquid')">
                    <i class="bi bi-water" style="font-size:2rem; display:block; margin-bottom:5px;"></i>
                    Liquid Glass
                </div>
                <div class="theme-option" data-theme="theme-glassmorphism" onclick="switchTheme('glassmorphism')">
                    <i class="bi bi-snow" style="font-size:2rem; display:block; margin-bottom:5px;"></i>
                    Glassmorphism
                </div>
                <div class="theme-option" data-theme="theme-dusk" onclick="switchTheme('dusk')">
                    <i class="bi bi-sunset" style="font-size:2rem; display:block; margin-bottom:5px;"></i>
                    Dusk
                </div>
            </div>
            <button class="icon-btn btn-close-modal" style="width:100%; margin-top:20px;">Cerrar</button>
        </div>
    </div>
    
    <!-- Modal de Exportación -->
    <div id="exportModal" class="modal-overlay">
        <div class="modal-box glass">
            <h3 style="color:var(--accent);text-align:center;">Exportar</h3>
            <p id="exportFileName" style="text-align:center;color:#94a3b8;font-family:monospace"></p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:20px">
                <button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;font-size:0.9rem">WhatsApp</button>
                <button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;font-size:0.9rem">Email</button>
                <button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;font-size:0.9rem">Descargar</button>
            </div>
            <button id="btnCloseExport" class="icon-btn btn-close-modal" style="margin-top:20px;width:100%">Cerrar</button>
        </div>
    </div>
    `;
}

// Función global para cambiar tema
window.switchTheme = (themeName) => {
    document.body.className = document.body.className.replace(/\btheme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
    localStorage.setItem('CIMA_THEME', themeName);
    log(`Tema cambiado a: ${themeName}`);
    
    // Cerrar modal
    $(".theme-modal")?.parentElement.classList.remove('active');
};

function runSearch() { 
    // Mantener lógica existente
    const query = $("#searchValue").value;
    if(!query) return;
    
    const results = getSearchResults(query);
    const list = $("#searchResultsList");
    list.innerHTML = '';
    
    results.forEach(r => {
        const p = r.patient;
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.cssText = "padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); cursor:pointer;";
        div.innerHTML = `
            <strong>${p.primer_nombre} ${p.primer_apellido}</strong><br>
            <small>${p.documento_numero} - ${new Date(r.lastUpdated).toLocaleDateString()}</small>
        `;
        div.addEventListener('click', () => {
            loadHistoryRecord(r);
            $("#searchModal").classList.remove('active');
        });
        list.appendChild(div);
    });
}

export function initToolbarEvents() { 
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('CIMA_THEME') || 'glass';
    switchTheme(savedTheme);
    
    renderToolbar(); 
}

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); 
    if(!card || STATE.currentUser.profile.id === "guest") return;
    
    STATE.currentPreviewCard = card; 
    STATE.currentPreviewDoc = kind; 
    STATE.UI.isPreviewMode = true;
    
    let html = kind==='INF' 
        ? ServiceLoader.get('informe').buildReportHTML(card) 
        : ServiceLoader.get('recipe').buildRecipeHTML(card);
    
    $("#docPreview").innerHTML = html; 
    renderToolbar();
};
