// app/logic/toolbar.js
import { $, $$, STATE, rotateWallpaper, log, fmtDate, flash } from 'brain';
import { ServiceLoader } from './service_loader.js'; 
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

/* ================= COMPONENTES UI ================= */

function getNavGroupHTML(isSidebar) {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const p = STATE.currentUser.profile;
    
    // Normalizar datos (Title vs title)
    const title = p.Title || p.title || "";
    const name = p.name || `${p.firstname} ${p.lastname}`;
    const role = p.Specialty || p.role;
    
    const avatarStyle = p.assets?.avatar_path ? `background-image: url('${p.assets.avatar_path}'); color:transparent;` : '';
    const initials = p.username ? p.username.substring(0,2).toUpperCase() : "U";

    const userMenu = `
    <div class="user-menu-wrapper">
        <button id="btnUserAvatar" class="avatar-circle" style="${avatarStyle}">${initials}</button>
        <div id="userDropdown" class="user-dropdown hidden">
            <div class="dropdown-header">
                <h4>${title} ${name}</h4>
                <p>${role}</p>
            </div>
            <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Configuración</button>
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
    return `<div class="toolbar-group"><div class="icon-row"><button id="btnNew" class="icon-btn" title="Nueva"><i class="bi bi-file-earmark-plus"></i></button><button id="btnOpen" class="icon-btn" title="Abrir"><i class="bi bi-folder2-open"></i></button>${STATE.UI.isStoryOpen ? `<button id="btnClose" class="icon-btn" title="Guardar"><i class="bi bi-floppy"></i></button><button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar"><i class="bi bi-x-lg"></i></button>` : ''}</div><span class="group-label">Historia</span></div>`;
}

function getConsultToolsHTML() {
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode) return '';
    return `<div class="v-divider"></div><div class="toolbar-group animate-fade"><div class="icon-row"><button id="btnAddConsulta" class="icon-btn" title="Agregar"><i class="bi bi-plus-lg"></i></button><button id="btnDeleteLast" class="icon-btn" title="Borrar"><i class="bi bi-dash-lg"></i></button></div><span class="group-label">Consulta</span></div>`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode) return '';
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

function getAuthGroupHTML() {
    return `
    <div class="toolbar-group">
      <div class="icon-row">
        <button id="btnAuthLogin" class="icon-btn" title="Iniciar sesión"><i class="bi bi-person-check"></i></button>
        <button id="btnAuthCreate" class="icon-btn" title="Crear usuario"><i class="bi bi-person-plus"></i></button>
      </div>
      <span class="group-label">Acceso</span>
    </div>`;
}

/* ================= RENDER ================= */

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;

    

    const isLoggedIn = !!STATE.AUTH?.isLoggedIn;
// Body Class Layout
    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    // Visibility
    const previewShell = document.getElementById('previewShell');
    const form = document.getElementById('patientForm');
    const visits = document.getElementById('visitsContainer');

    if (STATE.UI.isPreviewMode) {
        previewShell.classList.remove('hidden');
        form.classList.add('hidden'); visits.classList.add('hidden');
    } else {
        previewShell.classList.add('hidden');
        if (STATE.UI.isStoryOpen && STATE.UI.currentMode === 'CONSULTATION') {
            form.classList.remove('hidden'); visits.classList.remove('hidden');
        } else {
            form.classList.add('hidden'); visits.classList.add('hidden');
        }
    }

    let html = `<div class="toolbar-container ${isSidebar ? 'layout-sidebar' : 'layout-toolbar'}"><div class="floating-bar">`;

    // Pre-login toolbar (no requiere ServiceLoader)
    if (!isLoggedIn) {
        html += getAuthGroupHTML();
        html += `</div></div>`;
        mount.innerHTML = html;
        bindEvents();
        return;
    }

    if (isSidebar) {
        html += getNavGroupHTML(true);
        html += `<div class="v-divider"></div>`;
        html += getPreviewGroupHTML();
        html += getConsultToolsHTML();
        html += getHistoryGroupHTML();
    } else {
        if (STATE.UI.currentMode === 'CONSULTATION') {
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
    // Pre-login drawer open helpers (evita onclick inline)
    window.openAuthDrawer = (pane='login') => {
        const ov = document.getElementById('authOverlay');
        if(!ov) return;
        ov.classList.remove('hidden');
        const tabL = document.getElementById('tabLogin');
        const tabC = document.getElementById('tabCreate');
        const pL = document.getElementById('authPaneLogin');
        const pC = document.getElementById('authPaneCreate');
        const set = (which) => {
            const isLogin = which==='login';
            tabL?.classList.toggle('active', isLogin);
            tabC?.classList.toggle('active', !isLogin);
            pL?.classList.toggle('hidden', !isLogin);
            pC?.classList.toggle('hidden', isLogin);
        };
        set(pane);
    };
    document.getElementById('btnAuthLogin')?.addEventListener('click', (e)=>{ e.stopPropagation(); window.openAuthDrawer('login'); });
    document.getElementById('btnAuthCreate')?.addEventListener('click', (e)=>{ e.stopPropagation(); window.openAuthDrawer('create'); });

    window.changeMode = (m) => { STATE.UI.currentMode = m; STATE.UI.isPreviewMode = false; renderToolbar(); };
    window.switchDoc = (t) => { if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); };

    // Layout Toggle
    $("#btnToggleLayout")?.addEventListener('click', (e) => {
        e.stopPropagation();
        STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar';
        renderToolbar();
    });

    // Profile Settings
    $("#btnUserProfile")?.addEventListener('click', (e) => {
        e.stopPropagation();
        openSettingsModal();
    });

    // ... (Standard Listeners V5.2) ...
    $("#btnNew")?.addEventListener('click', () => { if(STATE.UI.isStoryOpen && !confirm("¿Cerrar?")) return; resetStory(); STATE.UI.isStoryOpen = true; ServiceLoader.get('patient').initializeNewPatient(); renderToolbar(); });
    $("#btnClose")?.addEventListener('click', () => { if(saveCurrentHistory()) flash('Guardado'); });
    $("#btnOpen")?.addEventListener('click', () => { $("#searchModal").classList.add('active'); $("#searchValue").focus(); $("#searchResultsList").innerHTML=''; });
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal").classList.remove('active'));
    $("#btnDoSearch")?.addEventListener('click', runSearch);
    $("#searchValue")?.addEventListener('keypress', (e)=>{if(e.key==='Enter') runSearch()});
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { if(confirm("¿Borrar?")) { $("#visitsContainer").firstChild?.remove(); }});
    $("#btnExitPreview")?.addEventListener('click', () => { STATE.UI.isPreviewMode = false; renderToolbar(); });
    $("#btnToggleSign")?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; window.switchDoc(STATE.currentPreviewDoc); });
    
    const av=$("#btnUserAvatar"), mn=$("#userDropdown");
    if(av && mn) {
        av.onclick=(e)=>{e.stopPropagation(); mn.classList.toggle('hidden')};
        document.onclick=(e)=>{if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden')};
        $("#btnChangeWallpaper")?.addEventListener('click', (e)=>{e.stopPropagation(); rotateWallpaper()});
        $("#btnLogout")?.addEventListener('click', ()=>location.reload());
    }
    
    $$(".btn-close-modal").forEach(btn => btn.addEventListener('click', () => {
        $(".settings-modal")?.parentElement.classList.remove('active');
        $(".modal-box")?.parentElement.classList.remove('active');
    }));
}

/* ================= MODAL SETTINGS ================= */

function openSettingsModal() {
    const p = STATE.currentUser.profile;
    const a = STATE.currentUser.assets;
    
    // Llenar campos
    $("#confName").value = p.name || "";
    $("#confTitle").value = p.Title || p.title || "";
    $("#confSpec").value = p.Specialty || p.specialty || "";
    $("#confPhone").value = p.contact?.phone || "";
    
    // Preview Visual (Simulado)
    const prevHeader = $("#previewHeaderSim");
    if(prevHeader) prevHeader.style.backgroundImage = `url('${a.header_path}')`;
    
    $("#settingsModal").classList.add('active');
}

function getModalsHTML() {
    return `
    <div id="searchModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent)">Buscar</h3><input id="searchValue" class="form-input"><div id="searchResultsList"></div><button id="btnCancelSearch" class="icon-btn btn-close-modal">X</button></div></div>
    
    <div id="settingsModal" class="modal-overlay">
        <div class="settings-modal">
            <div class="settings-sidebar">
                <div class="settings-section-title">Datos del Usuario</div>
                <div class="form-grid" style="grid-template-columns: 1fr;">
                    <div class="form-group"><label>Nombre Completo</label><input id="confName" class="form-input"></div>
                    <div class="form-group"><label>Título (Dr/Dra)</label><input id="confTitle" class="form-input"></div>
                    <div class="form-group"><label>Especialidad</label><input id="confSpec" class="form-input"></div>
                    <div class="form-group"><label>Teléfono</label><input id="confPhone" class="form-input"></div>
                </div>
                <div style="margin-top:20px; text-align:right;">
                    <button class="icon-btn btn-close-modal" style="width:auto; padding:0 20px; font-size:0.9rem;">Cerrar</button>
                </div>
            </div>
            <div class="settings-preview-area">
                <div class="settings-section-title" style="position:absolute; top:20px; left:20px;">Vista Previa</div>
                <div class="doc-simulated">
                    <div id="previewHeaderSim" class="doc-sim-header"></div>
                    <div class="doc-sim-body"></div>
                    <div class="doc-sim-footer"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="exportModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);text-align:center;">Exportar</h3><p id="exportFileName" style="text-align:center;color:#94a3b8;font-family:monospace"></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:20px"><button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;font-size:0.9rem">WhatsApp</button><button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;font-size:0.9rem">Email</button><button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;font-size:0.9rem">Descargar</button></div><button id="btnCloseExport" class="icon-btn btn-close-modal" style="margin-top:20px;width:100%">Cerrar</button></div></div>
    `;
}

function runSearch() { /* (Igual V5.2) */ }
export function initToolbarEvents() { renderToolbar(); }
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); if(!card) return;
    STATE.currentPreviewCard = card; STATE.currentPreviewDoc = kind; STATE.UI.isPreviewMode = true;
    let html = kind==='INF' ? ServiceLoader.get('informe').buildReportHTML(card) : ServiceLoader.get('recipe').buildRecipeHTML(card);
    $("#docPreview").innerHTML = html; renderToolbar();
};
