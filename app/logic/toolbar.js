// app/logic/toolbar.js
import { $, STATE, rotateWallpaper, log, fmtDate } from 'brain';
import { ServiceLoader } from './service_loader.js'; 
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

function getNavGroupHTML() {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); border-color:white; box-shadow:0 0 10px rgba(255,255,255,0.1);' : '';
    
    const p = STATE.currentUser.profile;
    const fullName = `${p.title} ${p.firstname} ${p.lastname}`;
    const subLine = p.title_line_1 || p.role;
    const initials = p.firstname ? p.firstname[0] + (p.lastname ? p.lastname[0] : '') : "DR";
    
    const avatarStyle = p.assets?.avatar_path 
        ? `background-image: url('${p.assets.avatar_path}'); background-size: cover; color: transparent;` 
        : '';

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="${activeStyle('AGENDA')}"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" onclick="window.changeMode('BILLING')" style="${activeStyle('BILLING')}"><i class="bi bi-receipt"></i></button>
            <button class="icon-btn" title="Inbox" style="position:relative;"><i class="bi bi-inbox"></i><span class="badge-dot"></span></button>
            
            <div class="user-menu-wrapper">
                <button id="btnUserAvatar" class="avatar-circle" style="${avatarStyle}">${initials.toUpperCase()}</button>
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="dropdown-header">
                        <h4>${fullName}</h4>
                        <p>${subLine}</p>
                        <p style="font-size:0.7rem; opacity:0.5;">@${p.username}</p>
                    </div>
                    <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Perfil</button>
                    <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Cambiar Fondo</button>
                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</button>
                </div>
            </div>
        </div>
        <span class="group-label">Navegación</span>
    </div>`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode) return '';
    const signColor = STATE.USE_SIG ? 'var(--accent)' : 'white';
    
    // Botones Toggle Documento
    const btnInfClass = STATE.currentPreviewDoc === 'INF' ? 'background:var(--primary); color:white;' : 'opacity:0.7;';
    const btnRpClass = STATE.currentPreviewDoc === 'RP' ? 'background:var(--primary); color:white;' : 'opacity:0.7;';

    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade" style="background:rgba(15, 23, 42, 0.6); border-radius:12px; padding:0 10px;">
        <div class="icon-row">
            <div style="display:flex; gap:5px;">
                <button onclick="window.switchDocType('INF')" class="icon-btn" style="font-size:0.8rem; width:auto; padding:0 12px; ${btnInfClass}">Informe</button>
                <button onclick="window.switchDocType('RP')" class="icon-btn" style="font-size:0.8rem; width:auto; padding:0 12px; ${btnRpClass}">Récipe</button>
            </div>
            
            <div style="width:1px; height:20px; background:rgba(255,255,255,0.2); margin:0 5px;"></div>

            <div style="display:flex; flex-direction:column; gap:2px; align-items:center;">
                <input type="range" id="zoomRange" min="40" max="130" step="5" value="85" style="width:60px; height:4px;">
            </div>
            <button id="btnToggleSign" class="icon-btn" title="Firmar" style="color:${signColor}"><i class="bi bi-pen-fill"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Exportar" style="background:var(--success);"><i class="bi bi-share-fill"></i></button>
            <button id="btnExitPreview" class="icon-btn" title="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
        <span class="group-label" style="color:var(--success);">Vista Previa</span>
    </div>
    `;
}

function getHistoryGroupHTML() {
    return `<div class="toolbar-group"><div class="icon-row"><button id="btnNew" class="icon-btn" title="Nueva Historia"><i class="bi bi-file-earmark-plus"></i></button><button id="btnOpen" class="icon-btn" title="Abrir Historia"><i class="bi bi-folder2-open"></i></button>${STATE.UI.isStoryOpen ? `<button id="btnClose" class="icon-btn" title="Guardar"><i class="bi bi-floppy"></i></button><button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar HC"><i class="bi bi-x-lg"></i></button>` : ''}</div><span class="group-label">Historia</span></div>`;
}
function getConsultToolsHTML() {
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode) return '';
    return `<div class="v-divider"></div><div class="toolbar-group animate-fade"><div class="icon-row"><button id="btnAddConsulta" class="icon-btn" title="Agregar Consulta"><i class="bi bi-plus-lg"></i></button><button id="btnDeleteLast" class="icon-btn" title="Quitar Última"><i class="bi bi-dash-lg"></i></button></div><span class="group-label">Consulta</span></div>`;
}

export function renderToolbar() {
    const mountPoint = document.getElementById('ui-mount-point');
    if (!mountPoint) return;
    
    // Toggle Visibilidad
    const previewShell = document.getElementById('previewShell');
    if (STATE.UI.isPreviewMode) {
        previewShell.classList.remove('hidden');
        document.getElementById('patientForm').classList.add('hidden'); 
        document.getElementById('visitsContainer').classList.add('hidden');
    } else {
        previewShell.classList.add('hidden');
        if (STATE.UI.isStoryOpen && STATE.UI.currentMode === 'CONSULTATION') {
            document.getElementById('patientForm').classList.remove('hidden');
            document.getElementById('visitsContainer').classList.remove('hidden');
        }
    }

    let html = `<div class="toolbar-container"><div class="floating-toolbar">`;
    if (STATE.UI.currentMode === 'CONSULTATION') {
        html += getHistoryGroupHTML();
        html += getConsultToolsHTML();
        html += getPreviewGroupHTML();
        html += `<div class="v-divider"></div>`;
    }
    html += getNavGroupHTML();
    html += `</div></div>`;
    
    // Inyectar Modales
    html += `<div id="searchModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);margin-bottom:15px">Buscar</h3><input id="searchValue" class="form-input" placeholder="Nombre..." style="margin-bottom:15px;padding:12px"><div id="searchResultsList" style="max-height:300px;overflow:auto;margin-bottom:15px"></div><div style="text-align:right;display:flex;gap:10px;justify-content:flex-end"><button id="btnCancelSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem">Cancelar</button><button id="btnDoSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem;background:var(--primary)">Buscar</button></div></div></div><div id="exportModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);text-align:center;margin-bottom:5px">Compartir</h3><p id="exportFileName" style="text-align:center;color:#94a3b8;margin-bottom:25px;font-family:monospace"></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px"><button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;gap:8px;font-size:0.9rem"><i class="bi bi-whatsapp"></i> WhatsApp</button><button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;gap:8px;font-size:0.9rem"><i class="bi bi-envelope-fill"></i> Email</button><button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;gap:8px;font-size:0.9rem"><i class="bi bi-download"></i> Descargar</button></div><div style="text-align:right;margin-top:20px"><button id="btnCloseExport" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.8rem">Cerrar</button></div></div></div>`;

    mountPoint.innerHTML = html;
    bindEvents();
}

function bindEvents() {
    window.changeMode = (mode) => { STATE.UI.currentMode = mode; STATE.UI.isPreviewMode = false; renderToolbar(); };
    window.switchDocType = (type) => { 
        if(STATE.currentPreviewCard) window.openDocGlobal(type, STATE.currentPreviewCard.id); 
    };

    $("#btnNew")?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar actual?")) return;
        resetStory(); STATE.UI.isStoryOpen = true; 
        ServiceLoader.get('patient').initializeNewPatient(); renderToolbar(); 
    });
    
    $("#btnClose")?.addEventListener('click', () => { if(saveCurrentHistory()) log('Guardado'); });
    $("#btnCloseStory")?.addEventListener('click', () => { if(confirm("¿Guardar y cerrar?")) { saveCurrentHistory(); resetStory(); renderToolbar(); } });
    $("#btnOpen")?.addEventListener('click', () => { $("#searchModal")?.classList.add('active'); $("#searchValue")?.focus(); $("#searchResultsList").innerHTML=''; });
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { const c = document.getElementById("visitsContainer"); if(c?.firstElementChild && confirm('¿Quitar última?')) { c.firstElementChild.remove(); log('Eliminada'); } });
    $("#btnExitPreview")?.addEventListener('click', () => { STATE.UI.isPreviewMode = false; STATE.currentPreviewDoc = null; renderToolbar(); });
    $("#btnToggleSign")?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; refreshPreview(); renderToolbar(); });
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#zoomRange")?.addEventListener('input', (e) => { $("#zoomVal").textContent = e.target.value + '%'; $("#docPreview").style.transform = `scale(${e.target.value / 100})`; });
    
    $("#btnOpenExport")?.addEventListener('click', () => { $("#exportModal").classList.add('active'); });
    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal")?.classList.remove('active'); );
    $("#btnDownload")?.addEventListener('click', () => { ServiceLoader.get('export').exportToPNG(); $("#exportModal").classList.remove('active'); });
    
    const av = $("#btnUserAvatar"); const mn = $("#userDropdown");
    if(av && mn) {
        av.addEventListener('click', (e) => { e.stopPropagation(); mn.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden'); });
        $("#btnChangeWallpaper")?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
        $("#btnLogout")?.addEventListener('click', () => location.reload());
    }
    
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal")?.classList.remove('active'); );
    $("#btnDoSearch")?.addEventListener('click', runSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if (e.key === 'Enter') runSearch(); });
}

function runSearch() {
    const q = $("#searchValue")?.value;
    if(!q) return;
    const results = getSearchResults(q);
    const list = $("#searchResultsList");
    list.innerHTML = '';
    if(results.length === 0) { list.innerHTML = '<div style="padding:10px;text-align:center;color:#94a3b8">Sin resultados</div>'; return; }
    results.forEach(m => {
        const div = document.createElement('div');
        div.className = "dropdown-item"; 
        div.style.cssText = 'flex-direction:column; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.1);';
        div.innerHTML = `<div style="color:var(--accent);font-weight:bold">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div><div style="font-size:0.8rem;color:var(--text-muted)">${m.patient.documento_numero} | ${fmtDate(m.lastUpdated)}</div>`;
        div.onclick = () => { loadHistoryRecord(m); $("#searchModal").classList.remove('active'); renderToolbar(); };
        list.appendChild(div);
    });
}

function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}

export function initToolbarEvents() { renderToolbar(); }

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;
    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.UI.isPreviewMode = true; 
    let html = kind === 'INF' ? ServiceLoader.get('informe').buildReportHTML(card) : ServiceLoader.get('recipe').buildRecipeHTML(card);
    const preview = $("#docPreview");
    if(preview) preview.innerHTML = html;
    renderToolbar();
};
