// app/logic/toolbar.js

import { $, STATE, rotateWallpaper, flash, showErr } from 'brain';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';
// Importamos Engine. Nota: getSearchResults sustituye a executeSearch en Engine para desacoplar UI
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

// ==========================================
// 1. GENERADORES DE HTML (CONDICIONALES)
// ==========================================

function getNavGroupHTML() {
    // Grupo NAVEGACIÓN: Siempre visible.
    // Dashboard | Consulta | Agenda | Facturacion | Inbox | User
    const activeClass = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.15); color:var(--accent); border-color:rgba(255,255,255,0.3);' : '';
    
    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeClass('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeClass('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            <button class="icon-btn" title="Agenda" style="opacity:0.5;"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" style="opacity:0.5;"><i class="bi bi-receipt"></i></button>
            
            <button class="icon-btn" title="Inbox" style="position:relative;">
                <i class="bi bi-inbox"></i>
                <span class="badge-dot"></span>
            </button>
            
            <div class="user-menu-wrapper">
                <button id="btnUserAvatar" class="avatar-circle">DR</button>
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="dropdown-header"><h4>${STATE.currentUser.profile.name}</h4><p>Configuración</p></div>
                    <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Perfil</button>
                    <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Fondo</button>
                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-box-arrow-right"></i> Salir</button>
                </div>
            </div>
        </div>
        <span class="group-label">Navegación</span>
    </div>
    `;
}

function getHistoryGroupHTML() {
    // Solo visible en modo CONSULTA
    // Si NO hay historia: [Nueva] [Abrir]
    // Si HAY historia: [Nueva] [Abrir] [Guardar] [Cerrar]
    
    let buttons = `
        <button id="btnNew" class="icon-btn" title="Nueva Historia"><i class="bi bi-file-earmark-plus"></i></button>
        <button id="btnOpen" class="icon-btn" title="Abrir Historia"><i class="bi bi-folder2-open"></i></button>
    `;

    if (STATE.UI.isStoryOpen) {
        buttons += `
            <button id="btnClose" class="icon-btn" title="Guardar"><i class="bi bi-floppy"></i></button>
            <button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar HC"><i class="bi bi-x-lg"></i></button>
        `;
    }

    return `
    <div class="toolbar-group animate-fade">
        <div class="icon-row">
            ${buttons}
        </div>
        <span class="group-label">Historia Médica</span>
    </div>
    `;
}

function getConsultToolsHTML() {
    // Solo visible si hay HISTORIA ABIERTA y NO estamos en Preview
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode) return '';
    
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade">
        <div class="icon-row">
            <button id="btnAddConsulta" class="icon-btn" title="Agregar Consulta"><i class="bi bi-plus-lg"></i></button>
            <button id="btnDeleteLast" class="icon-btn" title="Quitar Última"><i class="bi bi-dash-lg"></i></button>
        </div>
        <span class="group-label">Consulta</span>
    </div>
    `;
}

function getPreviewGroupHTML() {
    // Solo visible si estamos en PREVIEW MODE (Reemplaza a consulta o se agrega al lado)
    if (!STATE.UI.isPreviewMode) return '';

    const signColor = STATE.USE_SIG ? 'var(--accent)' : 'white';
    const signIcon = STATE.USE_SIG ? 'bi-pen-fill' : 'bi-pen';

    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade" style="background:rgba(16, 185, 129, 0.1); border-radius:12px; padding:0 10px; border:1px solid rgba(16, 185, 129, 0.3);">
        <div class="icon-row">
            <div style="display:flex; flex-direction:column; gap:2px; align-items:center; margin-right:5px;">
                <input type="range" id="zoomRange" min="40" max="130" step="5" value="70" style="width:60px; height:4px; accent-color: var(--success);">
                <span id="zoomVal" style="font-size:0.6rem; opacity:0.8;">70%</span>
            </div>
            
            <button id="btnToggleSign" class="icon-btn" title="Firmar" style="color:${signColor}"><i class="bi ${signIcon}"></i></button>
            <div style="width:1px; height:20px; background:rgba(255,255,255,0.2);"></div>
            <button id="btnRefresh" class="icon-btn" title="Actualizar"><i class="bi bi-arrow-clockwise"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Exportar" style="background:var(--success); border-color:var(--success);"><i class="bi bi-share-fill"></i></button>
            
            <button id="btnExitPreview" class="icon-btn" title="Cerrar Preview" style="margin-left:5px; background:rgba(255,255,255,0.1);"><i class="bi bi-x"></i></button>
        </div>
        <span class="group-label" style="color:var(--success); font-weight:700;">Vista Previa</span>
    </div>
    `;
}

// ==========================================
// 2. RENDER PRINCIPAL
// ==========================================

export function renderToolbar() {
    const mountPoint = document.getElementById('ui-mount-point');
    if (!mountPoint) return;

    let html = `<div class="toolbar-container"><div class="floating-toolbar">`;

    // ORDEN: Historia -> Consulta -> Preview -> | -> Navegación
    
    if (STATE.UI.currentMode === 'CONSULTATION') {
        html += getHistoryGroupHTML();
        html += getConsultToolsHTML();
        html += getPreviewGroupHTML();
        html += `<div class="v-divider"></div>`;
    }

    // Navegación (Siempre al final derecha)
    html += getNavGroupHTML();

    html += `</div></div>`;
    
    // Inyectar Modales (siempre ocultos pero presentes en DOM)
    html += getModalsHTML(); 

    mountPoint.innerHTML = html;

    // RE-ASIGNAR EVENTOS (Crucial porque reescribimos el DOM)
    bindEvents();
    
    // Actualizar iniciales avatar
    const user = STATE.currentUser.profile;
    const parts = user.name.trim().split(" ");
    const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].substring(0,2);
    const av = $("#btnUserAvatar"); if(av) av.textContent = initials.toUpperCase();
}

// ==========================================
// 3. BINDING DE EVENTOS
// ==========================================
function bindEvents() {
    // Lógica para cambio de modo
    window.changeMode = (mode) => {
        STATE.UI.currentMode = mode;
        
        // Manejo de Visibilidad de Contenedores
        const form = $("#patientForm");
        const visits = $("#visitsContainer");
        const preview = $("#previewShell");

        if(mode === 'DASHBOARD' || mode === 'AGENDA') {
            form?.classList.add('hidden');
            visits?.classList.add('hidden');
            preview?.classList.add('hidden');
        } else if (mode === 'CONSULTATION') {
             if(STATE.UI.isStoryOpen) {
                 form?.classList.remove('hidden');
                 visits?.classList.remove('hidden');
             }
             if(STATE.UI.isPreviewMode) {
                 preview?.classList.remove('hidden');
             }
        }
        renderToolbar();
    };

    // --- Historia ---
    $("#btnNew")?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar actual e iniciar nueva?")) return;
        resetStory(); 
        // Activar Flags UI
        STATE.UI.isStoryOpen = true; 
        STATE.UI.isPreviewMode = false;
        $("#patientForm").classList.remove('hidden');
        flash('Nueva historia iniciada');
        renderToolbar(); 
    });

    $("#btnClose")?.addEventListener('click', saveCurrentHistory);
    
    $("#btnCloseStory")?.addEventListener('click', () => {
        if(confirm("¿Guardar y cerrar?")) { 
            saveCurrentHistory(); 
            resetStory(); // Esto limpia datos
            // UI Update
            STATE.UI.isStoryOpen = false;
            STATE.UI.isPreviewMode = false;
            $("#patientForm").classList.add('hidden');
            $("#visitsContainer").innerHTML = '';
            $("#previewShell").classList.add('hidden');
            renderToolbar(); 
        }
    });
    
    // Abrir
    $("#btnOpen")?.addEventListener('click', () => { 
        $("#searchModal")?.classList.add('active'); 
        $("#searchValue")?.focus(); 
        $("#searchResultsList").innerHTML=''; 
    });

    // --- Consulta ---
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { 
        const c = $("#visitsContainer"); 
        if(c?.firstElementChild && confirm('¿Quitar última consulta?')) { c.firstElementChild.remove(); flash('Eliminada'); } 
    });

    // --- Preview ---
    $("#btnExitPreview")?.addEventListener('click', () => {
        $("#previewShell").classList.add('hidden');
        STATE.UI.isPreviewMode = false;
        STATE.currentPreviewDoc = null;
        renderToolbar();
    });
    
    $("#btnToggleSign")?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; refreshPreview(); renderToolbar(); });
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#zoomRange")?.addEventListener('input', (e) => {
        $("#zoomVal").textContent = e.target.value + '%';
        $("#docPreview").style.transform = `scale(${e.target.value / 100})`;
    });

    // --- Export ---
    $("#btnOpenExport")?.addEventListener('click', () => {
        const fname = $("#documento_numero")?.value || 'paciente';
        const type = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        STATE.exportFilename = `CIMA_${fname}_${type}.png`;
        $("#exportFileName").textContent = STATE.exportFilename;
        $("#exportModal").classList.add('active');
    });
    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal")?.classList.remove('active'));
    $("#btnDownload")?.addEventListener('click', () => { exportToPNG(); $("#exportModal").classList.remove('active'); });

    // --- Búsqueda (UI Logic) ---
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal")?.classList.remove('active'));
    
    const handleSearch = () => {
        const query = $("#searchValue")?.value.toLowerCase().trim();
        if (!query) return;
        const matches = getSearchResults(query); // Llama al Engine
        renderSearchResults(matches);
    };

    $("#btnDoSearch")?.addEventListener('click', handleSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

    // --- Menú Usuario ---
    const av = $("#btnUserAvatar"); const mn = $("#userDropdown");
    if(av && mn) {
        av.addEventListener('click', (e) => { e.stopPropagation(); mn.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden'); });
        $("#btnChangeWallpaper")?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
        $("#btnLogout")?.addEventListener('click', () => location.reload());
    }
}

// UI Helper: Renderizar resultados de búsqueda
function renderSearchResults(matches) {
    const list = $("#searchResultsList");
    list.innerHTML = '';
    
    if (matches.length === 0) { 
        list.innerHTML = '<div style="padding:15px;text-align:center;color:var(--text-muted)">Sin resultados</div>'; 
        return; 
    }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.className = "dropdown-item"; 
        div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        div.innerHTML = `<div style="color:var(--accent);font-weight:bold;">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div><div style="font-size:0.8rem;color:var(--text-muted);width:100%;display:flex;justify-content:space-between;"><span>${m.patient.documento_tipo}-${m.patient.documento_numero}</span></div>`;
        
        div.onclick = () => {
            loadHistoryRecord(m); // Engine carga datos
            // UI Updates
            STATE.UI.isStoryOpen = true;
            STATE.UI.isPreviewMode = false;
            $("#patientForm").classList.remove('hidden');
            $("#searchModal").classList.remove('active');
            renderToolbar(); // Re-render barra
            flash('Historia cargada');
        };
        list.appendChild(div);
    });
}

// Helpers HTML Modals
function getModalsHTML() {
    return `
    <div id="searchModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);margin-bottom:15px">Buscar</h3><input id="searchValue" class="form-input" placeholder="Nombre..." style="margin-bottom:15px;padding:12px"><div id="searchResultsList" style="max-height:300px;overflow:auto;margin-bottom:15px"></div><div style="text-align:right;display:flex;gap:10px;justify-content:flex-end"><button id="btnCancelSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem">Cancelar</button><button id="btnDoSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem;background:var(--primary)">Buscar</button></div></div></div>
    <div id="exportModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);text-align:center;margin-bottom:5px">Compartir</h3><p id="exportFileName" style="text-align:center;color:#94a3b8;margin-bottom:25px;font-family:monospace"></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px"><button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;gap:8px;font-size:0.9rem"><i class="bi bi-whatsapp"></i> WhatsApp</button><button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;gap:8px;font-size:0.9rem"><i class="bi bi-envelope-fill"></i> Email</button><button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;gap:8px;font-size:0.9rem"><i class="bi bi-download"></i> Descargar</button></div><div style="text-align:right;margin-top:20px"><button id="btnCloseExport" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.8rem">Cerrar</button></div></div></div>
    `;
}

function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}

// Inicializador
export function initToolbarEvents() {
    renderToolbar();
}

// Hook Global Preview
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;
    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.UI.isPreviewMode = true; // Flag Preview ON
    
    let html = kind === 'INF' ? buildReportHTML(card) : buildRecipeHTML(card);
    const preview = $("#docPreview");
    if(preview) preview.innerHTML = html;
    
    $("#previewShell").classList.remove('hidden');
    renderToolbar(); // Redibujar barra para mostrar controles de preview
};
