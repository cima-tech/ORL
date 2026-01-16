// app/logic/toolbar.js

import { $, STATE, rotateWallpaper, flash, showErr } from 'brain';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';
import { saveCurrentHistory, resetStory, handleAddConsulta, executeSearch } from './engine.js'; 

// ==========================================
// 1. COMPONENTES DE LA BARRA (Functions)
// ==========================================

// Grupo 1: Navegación Global (Siempre visible)
function getNavGroup() {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); border-color:white;' : '';
    
    // Iniciales del usuario
    const user = STATE.currentUser.profile;
    const parts = user.name.trim().split(" ");
    const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].substring(0,2);

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Pacientes" onclick="window.changeMode('PACIENTES')" style="${activeStyle('PACIENTES')}"><i class="bi bi-people"></i></button>
            <button class="icon-btn" title="Agenda" onclick="window.changeMode('AGENDA')" style="${activeStyle('AGENDA')}"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" onclick="window.changeMode('BILLING')" style="${activeStyle('BILLING')}"><i class="bi bi-receipt"></i></button>
            <button class="icon-btn" title="Consulta Actual" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            
            <div class="user-menu-wrapper">
                <button id="btnUserAvatar" class="avatar-circle">${initials.toUpperCase()}</button>
                
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="dropdown-header">
                        <h4>${user.name}</h4><p>Configuración</p>
                    </div>
                    <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Perfil</button>
                    <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Fondo</button>
                    <button id="btnToggleTheme" class="dropdown-item"><i class="bi bi-palette"></i> Tema</button>
                    <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar-inset"></i> Layout</button>
                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-box-arrow-right"></i> Salir</button>
                </div>
            </div>
        </div>
        <span class="group-label">Navegación</span>
    </div>
    `;
}

// Grupo 2: Historia Médica (Solo visible en CONSULTATION)
function getHistoryGroup() {
    // Si hay historia abierta, mostramos Guardar/Cerrar. Si no, solo Nueva/Abrir.
    const openTools = STATE.UI.isStoryOpen ? `
        <button id="btnClose" class="icon-btn" title="Guardar Cambios"><i class="bi bi-floppy"></i></button>
        <button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar Historia"><i class="bi bi-x-lg"></i></button>
    ` : '';

    return `
    <div class="toolbar-group animate-fade">
        <div class="icon-row">
            <button id="btnNew" class="icon-btn" title="Nueva Historia"><i class="bi bi-file-earmark-plus"></i></button>
            <button id="btnOpen" class="icon-btn" title="Abrir Historia"><i class="bi bi-folder2-open"></i></button>
            ${openTools}
        </div>
        <span class="group-label">Historia Médica</span>
    </div>
    `;
}

// Grupo 3: Herramientas de Consulta (Solo visible si hay Historia Abierta)
function getConsultGroup() {
    if (!STATE.UI.isStoryOpen) return ''; // Retorna vacío si no hay paciente
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

// Grupo 4: Preview (Solo visible en modo Preview)
function getPreviewGroup() {
    if (!STATE.UI.isPreviewMode) return '';
    const signColor = STATE.USE_SIG ? 'var(--accent)' : 'white';
    
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade" style="background:rgba(34, 211, 238, 0.15); border-radius:16px; padding:0 10px;">
        <div class="icon-row">
            <input type="range" id="zoomRange" min="40" max="130" step="5" value="70" style="width:60px;">
            <button id="btnToggleSign" class="icon-btn" style="color:${signColor}" title="Firmar"><i class="bi bi-pen-fill"></i></button>
            <div style="width:1px; height:20px; background:rgba(255,255,255,0.3);"></div>
            <button id="btnRefresh" class="icon-btn"><i class="bi bi-arrow-clockwise"></i></button>
            <button id="btnOpenExport" class="icon-btn" style="background:#10b981; border:none;"><i class="bi bi-share-fill"></i></button>
            <button id="btnExitPreview" class="icon-btn" style="margin-left:5px;"><i class="bi bi-x-circle"></i></button>
        </div>
        <span class="group-label" style="color:#22d3ee;">Vista Previa</span>
    </div>
    `;
}

// HTML de Modales (Estáticos)
const HTML_MODALS = `
<div id="searchModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);margin-bottom:15px">Buscar</h3><input id="searchValue" class="form-input" placeholder="Nombre..." style="margin-bottom:15px;padding:12px"><div id="searchResultsList" style="max-height:300px;overflow:auto;margin-bottom:15px"></div><div style="text-align:right;display:flex;gap:10px;justify-content:flex-end"><button id="btnCancelSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem">Cancelar</button><button id="btnDoSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem;background:var(--primary)">Buscar</button></div></div></div>
<div id="exportModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);text-align:center;margin-bottom:5px">Compartir</h3><p id="exportFileName" style="text-align:center;color:#94a3b8;margin-bottom:25px;font-family:monospace"></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px"><button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;gap:8px;font-size:0.9rem"><i class="bi bi-whatsapp"></i> WhatsApp</button><button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;gap:8px;font-size:0.9rem"><i class="bi bi-envelope-fill"></i> Email</button><button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;gap:8px;font-size:0.9rem"><i class="bi bi-download"></i> Descargar</button></div><div style="text-align:right;margin-top:20px"><button id="btnCloseExport" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.8rem">Cerrar</button></div></div></div>
`;

// ==========================================
// 2. RENDER PRINCIPAL (La Lógica de Visualización)
// ==========================================

export function renderToolbar() {
    const mountPoint = document.getElementById('ui-mount-point');
    if (!mountPoint) return;

    let toolbarHTML = `<div class="toolbar-container"><div class="floating-toolbar">`;

    // 1. Historia y Consulta (Solo si estamos en modo CONSULTATION)
    if (STATE.UI.currentMode === 'CONSULTATION') {
        if (!STATE.UI.isPreviewMode) {
            toolbarHTML += getHistoryGroup();
            toolbarHTML += getConsultGroup();
            
            if (STATE.UI.isStoryOpen) toolbarHTML += `<div class="v-divider"></div>`;
        } else {
            // Si hay preview, ocultamos Historia y mostramos Preview
            toolbarHTML += getPreviewGroup();
            toolbarHTML += `<div class="v-divider"></div>`;
        }
    }

    // 2. Navegación (Siempre al final/derecha)
    toolbarHTML += getNavGroup();

    toolbarHTML += `</div></div>`;
    
    // Inyectar todo + Modales
    mountPoint.innerHTML = toolbarHTML + HTML_MODALS;

    // Reconectar Eventos
    bindEvents();
}

// ==========================================
// 3. EVENTOS (Controlador)
// ==========================================

function bindEvents() {
    // Cambio de Modo Global
    window.changeMode = (mode) => {
        STATE.UI.currentMode = mode;
        
        // Manejo de visibilidad de contenedores
        const patientForm = $("#patientForm");
        const visits = $("#visitsContainer");
        
        if (mode === 'CONSULTATION' && STATE.UI.isStoryOpen) {
            patientForm?.classList.remove('hidden');
            visits?.classList.remove('hidden');
        } else {
            patientForm?.classList.add('hidden');
            visits?.classList.add('hidden');
        }
        
        if (mode !== 'CONSULTATION') {
            flash(`Modo ${mode} activado (Demo)`);
        }
        
        renderToolbar(); // Redibujar barra
    };

    // --- Historia ---
    $("#btnNew")?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar actual e iniciar nueva?")) return;
        resetStory(); 
        STATE.UI.isStoryOpen = true; // ACTIVAR ESTADO
        $("#patientForm").classList.remove('hidden');
        flash('Nueva historia iniciada');
        renderToolbar(); 
    });

    $("#btnClose")?.addEventListener('click', saveCurrentHistory);
    
    $("#btnCloseStory")?.addEventListener('click', () => {
        if(confirm("¿Guardar y cerrar historia?")) { 
            saveCurrentHistory(); 
            resetStory(); 
            STATE.UI.isStoryOpen = false; // DESACTIVAR ESTADO
            $("#patientForm").classList.add('hidden');
            renderToolbar(); 
        }
    });

    // Abrir / Búsqueda
    $("#btnOpen")?.addEventListener('click', () => { 
        $("#searchModal")?.classList.add('active'); 
        $("#searchValue")?.focus(); 
        $("#searchResultsList").innerHTML=''; 
    });

    // --- Consulta ---
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { 
        const c = $("#visitsContainer"); 
        if(c?.firstElementChild && confirm('¿Quitar última?')) { c.firstElementChild.remove(); flash('Eliminada'); } 
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
        $("#docPreview").style.transform = `scale(${e.target.value / 100})`;
    });

    // --- Modales ---
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal")?.classList.remove('active'));
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeSearch(); });
    
    $("#btnOpenExport")?.addEventListener('click', () => {
        const fname = $("#documento_numero")?.value || 'paciente';
        const type = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        STATE.exportFilename = `CIMA_${fname}_${type}.png`;
        $("#exportFileName").textContent = STATE.exportFilename;
        $("#exportModal").classList.add('active');
    });
    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal")?.classList.remove('active'));
    $("#btnDownload")?.addEventListener('click', () => { exportToPNG(); $("#exportModal").classList.remove('active'); });
    $("#btnShareWA")?.addEventListener('click', shareViaWhatsApp);

    // --- Menú Usuario ---
    const av = $("#btnUserAvatar"); const mn = $("#userDropdown");
    if(av && mn) {
        av.addEventListener('click', (e) => { e.stopPropagation(); mn.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden'); });
        
        $("#btnChangeWallpaper")?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
        $("#btnLogout")?.addEventListener('click', () => location.reload());
        // Placeholders
        $("#btnUserProfile")?.addEventListener('click', () => flash("Configuración..."));
        $("#btnToggleTheme")?.addEventListener('click', () => flash("Cambiando Tema..."));
        $("#btnToggleLayout")?.addEventListener('click', () => flash("Cambiando Layout..."));
    }
}

// Helper para preview
function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}

// INICIALIZADOR PÚBLICO
export function initToolbarEvents() {
    renderToolbar(); // Primer renderizado
}

// Interceptor global para activar modo preview desde las tarjetas
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;

    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.UI.isPreviewMode = true; // <--- ACTIVA MODO PREVIEW

    let html = kind === 'INF' ? buildReportHTML(card) : buildRecipeHTML(card);
    const preview = $("#docPreview");
    if(preview) preview.innerHTML = html;
    
    $("#previewShell").classList.remove('hidden');
    renderToolbar(); // Redibuja la barra para mostrar controles de preview
};
