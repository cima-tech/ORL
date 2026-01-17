// app/logic/toolbar.js
import { $, STATE, rotateWallpaper, log, fmtDate, flash } from 'brain';
import { ServiceLoader } from './service_loader.js'; 
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

/* ================= COMPONENTES DE UI ================= */

function getNavGroupHTML(isSidebar) {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const p = STATE.currentUser.profile;
    
    // Normalización de Mayúsculas/Minúsculas del JSON
    const title = p.Title || p.title || "";
    const specialty = p.Specialty || p.specialty || p.role;
    const fullName = `${title} ${p.firstname} ${p.lastname}`;
    
    const avatarStyle = p.assets?.avatar_path ? `background-image: url('${p.assets.avatar_path}'); color:transparent;` : '';
    const initials = p.firstname ? p.firstname[0] : "U";

    // Botones del menú de usuario
    const userMenu = `
    <div class="user-menu-wrapper">
        <button id="btnUserAvatar" class="avatar-circle" style="${avatarStyle}">${initials}</button>
        <div id="userDropdown" class="user-dropdown hidden">
            <div class="dropdown-header">
                <h4>${fullName}</h4>
                <p>${specialty}</p>
            </div>
            <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Configuración</button>
            <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar"></i> Alternar Barra/Menú</button>
            <button id="btnToggleTheme" class="dropdown-item"><i class="bi bi-palette"></i> Cambiar Tema (WIP)</button>
            <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
            <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-power"></i> Salir</button>
        </div>
    </div>`;

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            ${isSidebar ? userMenu : ''} <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="${activeStyle('AGENDA')}"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" onclick="window.changeMode('BILLING')" style="${activeStyle('BILLING')}"><i class="bi bi-receipt"></i></button>
            ${!isSidebar ? userMenu : ''} </div>
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

/* ================= RENDERIZADO ADAPTATIVO ================= */

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;

    // 1. Manejo de Layout (Clases en Body)
    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    // 2. Control de Visibilidad de Capas
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

    // 3. Construcción del HTML según el Layout
    let html = '';
    const containerClass = isSidebar ? 'layout-sidebar' : 'layout-toolbar';
    
    html += `<div class="toolbar-container ${containerClass}"><div class="floating-bar">`;

    if (isSidebar) {
        // ORDEN SIDEBAR: Nav (User) -> Preview -> Consulta -> Historia
        html += getNavGroupHTML(true);
        html += `<div class="v-divider"></div>`;
        html += getPreviewGroupHTML();
        html += getConsultToolsHTML();
        html += getHistoryGroupHTML();
    } else {
        // ORDEN TOOLBAR: Historia -> Consulta -> Preview -> Nav (User)
        if (STATE.UI.currentMode === 'CONSULTATION') {
            html += getHistoryGroupHTML();
            html += getConsultToolsHTML();
            html += getPreviewGroupHTML();
            html += `<div class="v-divider"></div>`;
        }
        html += getNavGroupHTML(false);
    }

    html += `</div></div>`;
    
    // Modales (Configuración y Exportar)
    html += getModalsHTML(); 

    mount.innerHTML = html;
    bindEvents();
}

/* ================= EVENTOS ================= */

function bindEvents() {
    window.changeMode = (m) => { STATE.UI.currentMode = m; STATE.UI.isPreviewMode = false; renderToolbar(); };
    window.switchDoc = (t) => { if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); };

    // Layout Toggle Logic
    $("#btnToggleLayout")?.addEventListener('click', (e) => {
        e.stopPropagation();
        STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar';
        flash(`Cambiado a modo ${STATE.UI.layout.toUpperCase()}`);
        renderToolbar();
    });

    // Profile Settings Logic
    $("#btnUserProfile")?.addEventListener('click', (e) => {
        e.stopPropagation();
        openSettingsModal();
    });

    // ... Listeners Standard (Copy from V5.1) ...
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
    
    // User Menu Toggle
    const av=$("#btnUserAvatar"), mn=$("#userDropdown");
    if(av && mn) {
        av.onclick=(e)=>{e.stopPropagation(); mn.classList.toggle('hidden')};
        document.onclick=(e)=>{if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden')};
    }
    
    // Modal Close buttons
    $$(".btn-close-modal").forEach(btn => btn.addEventListener('click', () => {
        $(".settings-modal")?.parentElement.classList.remove('active');
        $(".modal-box")?.parentElement.classList.remove('active');
    }));
}

/* ================= MODAL DE CONFIGURACIÓN ================= */

function openSettingsModal() {
    const p = STATE.currentUser.profile;
    const a = STATE.currentUser.assets;
    
    // Llenar campos
    $("#confName").value = p.name || "";
    $("#confTitle").value = p.Title || "";
    $("#confSpec").value = p.Specialty || "";
    $("#confPhone").value = p.contact?.phone || "";
    $("#confEmail").value = p.contact?.email || "";
    
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
                    <div class="form-group"><label>Email</label><input id="confEmail" class="form-input"></div>
                </div>
                <div style="margin-top:20px; text-align:right;">
                    <button class="icon-btn btn-close-modal" style="width:auto; padding:0 20px; font-size:0.9rem;">Cancelar</button>
                    <button class="icon-btn" style="width:auto; padding:0 20px; font-size:0.9rem; background:var(--primary);">Guardar (Sim)</button>
                </div>
            </div>
            
            <div class="settings-preview-area">
                <div class="settings-section-title" style="position:absolute; top:20px; left:20px;">Vista Previa Documentos</div>
                <div class="doc-simulated">
                    <div id="previewHeaderSim" class="doc-sim-header"></div>
                    <div class="doc-sim-body">
                        Lorem ipsum dolor sit amet...
                    </div>
                    <div class="doc-sim-footer"></div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function runSearch() { /* (Igual a V5.1) */ }
export function initToolbarEvents() { renderToolbar(); }
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); if(!card) return;
    STATE.currentPreviewCard = card; STATE.currentPreviewDoc = kind; STATE.UI.isPreviewMode = true;
    let html = kind==='INF' ? ServiceLoader.get('informe').buildReportHTML(card) : ServiceLoader.get('recipe').buildRecipeHTML(card);
    $("#docPreview").innerHTML = html; renderToolbar();
};
