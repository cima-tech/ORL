// app/logic/toolbar.js
import { $, STATE, rotateWallpaper, log, fmtDate } from 'brain';
import { ServiceLoader } from './service_loader.js'; 
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

function getNavGroupHTML() {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const p = STATE.currentUser.profile;
    const fullName = `${p.title} ${p.firstname} ${p.lastname}`;
    const subLine = p.title_line_1;
    
    // Si no hay avatar, usa iniciales (CSS fallback)
    const avatarStyle = p.assets?.avatar_path ? `background-image: url('${p.assets.avatar_path}'); color:transparent;` : '';
    const initials = p.firstname ? p.firstname[0] : "D";

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="${activeStyle('AGENDA')}"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" onclick="window.changeMode('BILLING')" style="${activeStyle('BILLING')}"><i class="bi bi-receipt"></i></button>
            <button class="icon-btn" title="Inbox"><i class="bi bi-inbox"></i></button>
            
            <div class="user-menu-wrapper">
                <button id="btnUserAvatar" class="avatar-circle" style="${avatarStyle}">${initials}</button>
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="dropdown-header"><h4>${fullName}</h4><p>${subLine}</p><p style="font-size:0.7rem;opacity:0.5">@${p.username}</p></div>
                    <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Perfil</button>
                    <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Fondo</button>
                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-power"></i> Salir</button>
                </div>
            </div>
        </div>
        <span class="group-label">Navegación</span>
    </div>`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode) return '';
    const activeDoc = (type) => STATE.currentPreviewDoc === type ? 'background:var(--primary); color:white;' : 'opacity:0.7';

    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade" style="background:rgba(0,0,0,0.3); border-radius:12px; padding:0 10px;">
        <div class="icon-row">
            <div style="display:flex; gap:5px;">
                <button onclick="window.switchDocType('INF')" class="icon-btn" style="font-size:0.75rem; width:auto; padding:0 10px; ${activeDoc('INF')}">INFORME</button>
                <button onclick="window.switchDocType('RP')" class="icon-btn" style="font-size:0.75rem; width:auto; padding:0 10px; ${activeDoc('RP')}">RÉCIPE</button>
            </div>
            <div class="v-divider" style="height:20px;"></div>
            <input type="range" id="zoomRange" min="40" max="130" step="5" value="85" style="width:60px;">
            <button id="btnToggleSign" class="icon-btn" title="Firmar"><i class="bi bi-pen-fill"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Exportar"><i class="bi bi-share-fill"></i></button>
            <button id="btnExitPreview" class="icon-btn" title="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
        <span class="group-label" style="color:var(--success);">VISTA PREVIA</span>
    </div>`;
}

// ... Resto igual, solo asegurando los eventos ...
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
    
    // Toggle Layers
    if (STATE.UI.isPreviewMode) {
        document.getElementById('previewShell').classList.remove('hidden');
        document.getElementById('patientForm').classList.add('hidden'); 
        document.getElementById('visitsContainer').classList.add('hidden');
    } else {
        document.getElementById('previewShell').classList.add('hidden');
        if (STATE.UI.isStoryOpen && STATE.UI.currentMode === 'CONSULTATION') {
            document.getElementById('patientForm').classList.remove('hidden');
            document.getElementById('visitsContainer').classList.remove('hidden');
        }
    }

    let html = `<div class="toolbar-container"><div class="floating-toolbar">`;
    if (STATE.UI.currentMode === 'CONSULTATION') {
        html += getHistoryGroupHTML() + getConsultToolsHTML() + getPreviewGroupHTML() + `<div class="v-divider"></div>`;
    }
    html += getNavGroupHTML() + `</div></div>`;
    
    // Modales (Hidden by default in CSS)
    html += `<div id="searchModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);margin-bottom:15px">Buscar</h3><input id="searchValue" class="form-input" placeholder="Nombre..." style="margin-bottom:15px;"><div id="searchResultsList" style="max-height:300px;overflow:auto;margin-bottom:15px"></div><div style="text-align:right;gap:10px;display:flex;justify-content:flex-end;"><button id="btnCancelSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem">Cancelar</button><button id="btnDoSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem;background:var(--primary)">Buscar</button></div></div></div><div id="exportModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);text-align:center;margin-bottom:5px">Exportar</h3><p id="exportFileName" style="text-align:center;color:#94a3b8;margin-bottom:20px;font-family:monospace"></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px"><button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;gap:8px;font-size:0.9rem"><i class="bi bi-whatsapp"></i> WhatsApp</button><button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;gap:8px;font-size:0.9rem"><i class="bi bi-envelope-fill"></i> Email</button><button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;gap:8px;font-size:0.9rem"><i class="bi bi-download"></i> Descargar Imagen</button></div><div style="text-align:right;margin-top:20px"><button id="btnCloseExport" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.8rem">Cerrar</button></div></div></div>`;

    mountPoint.innerHTML = html;
    bindEvents();
}

function bindEvents() {
    window.changeMode = (m) => { STATE.UI.currentMode = m; STATE.UI.isPreviewMode = false; renderToolbar(); };
    window.switchDocType = (t) => { if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); };

    $("#btnNew")?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar actual?")) return;
        resetStory(); STATE.UI.isStoryOpen = true; 
        ServiceLoader.get('patient').initializeNewPatient(); renderToolbar(); 
    });
    
    $("#btnClose")?.addEventListener('click', () => { if(saveCurrentHistory()) log('Guardado'); });
    $("#btnCloseStory")?.addEventListener('click', () => { if(confirm("¿Cerrar HC?")) { saveCurrentHistory(); resetStory(); renderToolbar(); } });
    $("#btnOpen")?.addEventListener('click', () => { $("#searchModal").classList.add('active'); $("#searchValue").focus(); $("#searchResultsList").innerHTML=''; });
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { const c=$("#visitsContainer"); if(c.firstChild && confirm('¿Borrar última?')) c.firstChild.remove(); });
    
    // Preview
    $("#btnExitPreview")?.addEventListener('click', () => { STATE.UI.isPreviewMode = false; STATE.currentPreviewDoc = null; renderToolbar(); });
    $("#btnToggleSign")?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; refreshPreview(); });
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#zoomRange")?.addEventListener('input', (e) => { $("#docPreview").style.transform = `scale(${e.target.value / 100})`; });
    
    // Export
    $("#btnOpenExport")?.addEventListener('click', () => $("#exportModal").classList.add('active'));
    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal").classList.remove('active'));
    $("#btnDownload")?.addEventListener('click', () => { ServiceLoader.get('export').exportToPNG(); $("#exportModal").classList.remove('active'); });
    
    // User Menu
    const av=$("#btnUserAvatar"), mn=$("#userDropdown");
    if(av && mn) {
        av.onclick=(e)=>{e.stopPropagation(); mn.classList.toggle('hidden')};
        document.onclick=(e)=>{if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden')};
        $("#btnChangeWallpaper")?.addEventListener('click', (e)=>{e.stopPropagation(); rotateWallpaper()});
        $("#btnLogout")?.addEventListener('click', ()=>location.reload());
    }
    
    // Search
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal").classList.remove('active'));
    $("#btnDoSearch")?.addEventListener('click', runSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if(e.key==='Enter') runSearch(); });
}

function runSearch() {
    const q = $("#searchValue").value; if(!q) return;
    const res = getSearchResults(q);
    const list = $("#searchResultsList"); list.innerHTML = '';
    if(!res.length) { list.innerHTML='<div style="padding:10px;text-align:center;color:#94a3b8">Sin resultados</div>'; return; }
    res.forEach(m => {
        const div=document.createElement('div'); div.className='dropdown-item';
        div.style.cssText='flex-direction:column;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.1)';
        div.innerHTML=`<div style="color:var(--accent);font-weight:bold">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div><div style="font-size:0.8rem;color:#94a3b8">${m.patient.documento_numero}</div>`;
        div.onclick=()=>{ loadHistoryRecord(m); $("#searchModal").classList.remove('active'); renderToolbar(); };
        list.appendChild(div);
    });
}

function refreshPreview() { if(STATE.currentPreviewDoc) window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id); }
export function initToolbarEvents() { renderToolbar(); }

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); if(!card) return;
    STATE.currentPreviewCard = card; STATE.currentPreviewDoc = kind; STATE.UI.isPreviewMode = true;
    let html = kind==='INF' ? ServiceLoader.get('informe').buildReportHTML(card) : ServiceLoader.get('recipe').buildRecipeHTML(card);
    $("#docPreview").innerHTML = html; renderToolbar();
};
