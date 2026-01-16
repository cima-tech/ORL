// app/logic/toolbar.js

import { $, STATE, rotateWallpaper, flash, showErr } from 'brain';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';
// Engine logic
import { saveCurrentHistory, resetStory, handleAddConsulta, executeSearch } from './engine.js'; 

// ==========================================
// 1. DYNAMIC HTML GENERATORS
// ==========================================

// Helper for Navigation Group (Always visible)
function getNavGroupHTML() {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); border-color:white; color:white;' : '';
    
    // User Initials Calculation
    const user = STATE.currentUser.profile;
    const parts = (user.name || "DR").trim().split(" ");
    const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].substring(0,2);

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button class="icon-btn" title="Dashboard" onclick="window.changeMode('DASHBOARD')" style="${activeStyle('DASHBOARD')}"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Consulta" onclick="window.changeMode('CONSULTATION')" style="${activeStyle('CONSULTATION')}"><i class="bi bi-heart-pulse"></i></button>
            <button class="icon-btn" title="Agenda" style="opacity:0.5;"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación" style="opacity:0.5;"><i class="bi bi-receipt"></i></button>
            
            <button class="icon-btn" title="Inbox" style="position:relative;">
                <i class="bi bi-inbox"></i>
                <span class="badge-dot"></span>
            </button>
            
            <div class="user-menu-wrapper">
                <button id="btnUserAvatar" class="avatar-circle">${initials.toUpperCase()}</button>
                
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="dropdown-header">
                        <h4>${user.name}</h4>
                        <p>Administrador</p>
                    </div>
                    <button id="btnUserProfile" class="dropdown-item"><i class="bi bi-person-gear"></i> Configuración</button>
                    <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Cambiar Fondo</button>
                    <button id="btnToggleTheme" class="dropdown-item"><i class="bi bi-palette"></i> Tema</button>
                    <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar-inset"></i> Layout</button>
                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                    <button id="btnLogout" class="dropdown-item" style="color:#ef4444;"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</button>
                </div>
            </div>
        </div>
        <span class="group-label">Navegación</span>
    </div>
    `;
}

// Helper for History Group (Only in Consultation Mode)
function getHistoryGroupHTML() {
    // Determine if Save/Close buttons should appear
    const activeStoryControls = STATE.UI.isStoryOpen ? `
        <button id="btnClose" class="icon-btn" title="Guardar Cambios"><i class="bi bi-floppy"></i></button>
        <button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar Historia"><i class="bi bi-x-lg"></i></button>
    ` : '';

    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnNew" class="icon-btn" title="Nueva Historia"><i class="bi bi-file-earmark-plus"></i></button>
            <button id="btnOpen" class="icon-btn" title="Abrir Historia"><i class="bi bi-folder2-open"></i></button>
            ${activeStoryControls}
        </div>
        <span class="group-label">Historia Médica</span>
    </div>
    `;
}

// Helper for Consultation Tools (Dependent on Story Open)
function getConsultToolsHTML() {
    // Only show if Story is Open AND NOT in Preview mode
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

// Helper for Preview Tools (Dependent on Preview Mode)
function getPreviewGroupHTML() {
    // Only show if in Preview Mode
    if (!STATE.UI.isPreviewMode) return '';

    const signColor = STATE.USE_SIG ? 'var(--accent)' : 'white';
    const signIcon = STATE.USE_SIG ? 'bi-pen-fill' : 'bi-pen';

    return `
    <div class="v-divider"></div>
    <div class="toolbar-group animate-fade" style="background:rgba(16, 185, 129, 0.1); border-radius:16px; padding:0 10px;">
        <div class="icon-row">
            <div style="display:flex; flex-direction:column; gap:2px; align-items:center; margin-right:5px;">
                <input type="range" id="zoomRange" min="40" max="130" step="5" value="70" style="width:60px; height:4px; accent-color:var(--accent);">
                <span id="zoomVal" style="font-size:0.6rem; opacity:0.8;">70%</span>
            </div>
            
            <button id="btnToggleSign" class="icon-btn" title="Firmar" style="color:${signColor}"><i class="bi ${signIcon}"></i></button>
            <div style="width:1px; height:20px; background:rgba(255,255,255,0.2);"></div>
            <button id="btnRefresh" class="icon-btn" title="Actualizar"><i class="bi bi-arrow-clockwise"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Exportar" style="background:#10b981; border-color:#10b981;"><i class="bi bi-share-fill"></i></button>
            
            <button id="btnExitPreview" class="icon-btn" title="Cerrar Vista Previa" style="margin-left:5px; background:rgba(255,255,255,0.1);"><i class="bi bi-x"></i></button>
        </div>
        <span class="group-label" style="color:#10b981;">Vista Previa</span>
    </div>
    `;
}

// Modals HTML (Static, hidden by default)
const HTML_MODALS = `
<div id="searchModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);margin-bottom:15px">Buscar</h3><input id="searchValue" class="form-input" placeholder="Nombre..." style="margin-bottom:15px;padding:12px"><div id="searchResultsList" style="max-height:300px;overflow:auto;margin-bottom:15px"></div><div style="text-align:right;display:flex;gap:10px;justify-content:flex-end"><button id="btnCancelSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem">Cancelar</button><button id="btnDoSearch" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.9rem;background:var(--primary)">Buscar</button></div></div></div>
<div id="exportModal" class="modal-overlay"><div class="modal-box glass"><h3 style="color:var(--accent);text-align:center;margin-bottom:5px">Compartir</h3><p id="exportFileName" style="text-align:center;color:#94a3b8;margin-bottom:25px;font-family:monospace"></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px"><button id="btnShareWA" class="icon-btn" style="width:100%;background:#25D366;gap:8px;font-size:0.9rem"><i class="bi bi-whatsapp"></i> WhatsApp</button><button id="btnShareMail" class="icon-btn" style="width:100%;background:#EA4335;gap:8px;font-size:0.9rem"><i class="bi bi-envelope-fill"></i> Email</button><button id="btnDownload" class="icon-btn" style="width:100%;background:var(--primary);grid-column:span 2;gap:8px;font-size:0.9rem"><i class="bi bi-download"></i> Descargar</button></div><div style="text-align:right;margin-top:20px"><button id="btnCloseExport" class="icon-btn" style="width:auto;padding:0 15px;font-size:0.8rem">Cerrar</button></div></div></div>
`;

// ==========================================
// 2. MAIN RENDER FUNCTION
// ==========================================

export function renderToolbar() {
    const mountPoint = document.getElementById('ui-mount-point');
    if (!mountPoint) return;

    let html = `<div class="toolbar-container"><div class="floating-toolbar">`;

    // 1. Consultation Logic
    if (STATE.UI.currentMode === 'CONSULTATION') {
        html += getHistoryGroupHTML();
        html += getConsultToolsHTML();
        html += getPreviewGroupHTML();
        
        // Add divider if there are tools shown before Navigation
        if (STATE.UI.isStoryOpen || STATE.UI.isPreviewMode) {
             html += `<div class="v-divider"></div>`;
        }
    }

    // 2. Navigation Group (Always Last)
    html += getNavGroupHTML();

    html += `</div></div>`;
    
    // 3. Inject Modals (Always present in DOM)
    html += HTML_MODALS; 

    mountPoint.innerHTML = html;

    // 4. BIND EVENTS (Re-attach listeners after render)
    bindEvents();
}

// ==========================================
// 3. EVENT BINDING
// ==========================================
function bindEvents() {
    
    // --- GLOBAL MODE SWITCHER ---
    // Exposed to window so HTML onclick="..." works
    window.changeMode = (mode) => {
        STATE.UI.currentMode = mode;
        
        if(mode === 'DASHBOARD') {
            // Hide everything medical
            $("#patientForm")?.classList.add('hidden');
            $("#visitsContainer")?.classList.add('hidden');
            $("#previewShell")?.classList.add('hidden');
        } else if (mode === 'CONSULTATION') {
             // Restore if story was open
             if(STATE.UI.isStoryOpen) {
                 $("#patientForm")?.classList.remove('hidden');
                 $("#visitsContainer")?.classList.remove('hidden');
             }
        }
        renderToolbar(); // Redraw toolbar based on new mode
    };

    // --- HISTORY GROUP ---
    $("#btnNew")?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar actual e iniciar nueva?")) return;
        resetStory(); 
        
        // Update State
        STATE.UI.isStoryOpen = true; 
        STATE.UI.currentMode = 'CONSULTATION';
        
        $("#patientForm").classList.remove('hidden'); // Show Form
        flash('Nueva historia iniciada');
        renderToolbar(); // Redraw to show Save/Close buttons
    });

    $("#btnClose")?.addEventListener('click', saveCurrentHistory);
    
    $("#btnCloseStory")?.addEventListener('click', () => {
        if(confirm("¿Guardar y cerrar la historia?")) { 
            saveCurrentHistory(); 
            resetStory(); 
            
            // Reset State
            STATE.UI.isStoryOpen = false;
            $("#patientForm").classList.add('hidden');
            renderToolbar(); // Redraw to hide medical tools
        }
    });
    
    $("#btnOpen")?.addEventListener('click', () => { 
        $("#searchModal")?.classList.add('active'); 
        $("#searchValue")?.focus(); 
        $("#searchResultsList").innerHTML=''; 
    });

    // --- CONSULTATION GROUP ---
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { 
        const c = $("#visitsContainer"); 
        if(c?.firstElementChild && confirm('¿Quitar última consulta?')) { c.firstElementChild.remove(); flash('Eliminada'); } 
    });

    // --- PREVIEW GROUP ---
    $("#btnExitPreview")?.addEventListener('click', () => {
        $("#previewShell").classList.add('hidden');
        STATE.UI.isPreviewMode = false;
        STATE.currentPreviewDoc = null;
        renderToolbar(); // Redraw to remove green bar and show consultation tools
    });
    
    $("#btnToggleSign")?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; refreshPreview(); renderToolbar(); });
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#zoomRange")?.addEventListener('input', (e) => {
        $("#zoomVal").textContent = e.target.value + '%';
        $("#docPreview").style.transform = `scale(${e.target.value / 100})`;
    });

    // --- MODALS & EXPORT ---
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

    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal")?.classList.remove('active'));
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeSearch(); });

    // --- USER MENU ---
    const av = $("#btnUserAvatar"); const mn = $("#userDropdown");
    if(av && mn) {
        av.addEventListener('click', (e) => { e.stopPropagation(); mn.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!mn.classList.contains('hidden') && !mn.contains(e.target) && !av.contains(e.target)) mn.classList.add('hidden'); });
        
        $("#btnChangeWallpaper")?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
        $("#btnLogout")?.addEventListener('click', () => location.reload());
        $("#btnUserProfile")?.addEventListener('click', () => flash("Configuración (Demo)"));
        $("#btnToggleTheme")?.addEventListener('click', () => flash("Tema (Demo)"));
        $("#btnToggleLayout")?.addEventListener('click', () => flash("Layout (Demo)"));
    }
}

// --- INITIALIZER ---
export function initToolbarEvents() {
    renderToolbar(); // First Draw
}

// --- PREVIEW WRAPPER (Global) ---
function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}

// Hijack Global Function to switch Modes
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;

    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    
    // Switch Mode
    STATE.UI.isPreviewMode = true; 

    // Render Doc
    let html = kind === 'INF' ? buildReportHTML(card) : buildRecipeHTML(card);
    const preview = $("#docPreview");
    if(preview) preview.innerHTML = html;
    
    // Show UI
    $("#previewShell").classList.remove('hidden');
    
    // Re-Render Toolbar (Shows Green Preview Bar)
    renderToolbar();
};
