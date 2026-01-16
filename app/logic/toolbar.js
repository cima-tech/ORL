// app/logic/toolbar.js

import { $, STATE, rotateWallpaper, flash, showErr } from 'brain';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';
// Importamos la Lógica del Engine
import { saveCurrentHistory, resetStory, handleAddConsulta, executeSearch } from './engine.js'; 

// ==========================================
// 1. PLANTILLA MAESTRA DEL TOOLBAR (V3.1)
// ==========================================

const HTML_TOP_TOOLBAR = `
<div class="toolbar-container">
  <div class="floating-toolbar">
    
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnNew" class="icon-btn" title="Nueva Historia"><i class="bi bi-file-earmark-plus"></i></button>
            <button id="btnOpen" class="icon-btn" title="Abrir Historia"><i class="bi bi-folder2-open"></i></button>
            <button id="btnClose" class="icon-btn" title="Guardar Cambios"><i class="bi bi-floppy"></i></button>
            <button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar Historia"><i class="bi bi-x-lg"></i></button>
        </div>
        <span class="group-label">Historia Médica</span>
    </div>

    <div class="v-divider"></div>

    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnAddConsulta" class="icon-btn" title="Agregar Consulta"><i class="bi bi-plus-lg"></i></button>
            <button id="btnDeleteLast" class="icon-btn" title="Quitar Última"><i class="bi bi-dash-lg"></i></button>
        </div>
        <span class="group-label">Consulta</span>
    </div>

    <div class="v-divider"></div>

    <div class="toolbar-group">
        <div class="icon-row">
            <button class="icon-btn" title="Dashboard"><i class="bi bi-speedometer2"></i></button>
            <button class="icon-btn" title="Pacientes"><i class="bi bi-people"></i></button>
            <button class="icon-btn" title="Agenda"><i class="bi bi-calendar-week"></i></button>
            <button class="icon-btn" title="Facturación"><i class="bi bi-receipt"></i></button>
            
            <button class="icon-btn" title="Notificaciones" style="position:relative;">
                <i class="bi bi-bell"></i>
                <span class="badge-dot"></span>
            </button>
            
            <div class="user-menu-wrapper">
                <button id="btnUserAvatar" class="avatar-circle">DR</button>
                
                <div id="userDropdown" class="user-dropdown hidden">
                    <div class="dropdown-header">
                        <h4>Dr. Usuario</h4>
                        <p>Administrador</p>
                    </div>

                    <button id="btnUserProfile" class="dropdown-item">
                        <i class="bi bi-person-gear"></i> Configuración Cuenta
                    </button>

                    <button id="btnChangeWallpaper" class="dropdown-item">
                        <i class="bi bi-arrow-repeat"></i> Cambiar Fondo
                    </button>

                    <button id="btnToggleTheme" class="dropdown-item">
                        <i class="bi bi-palette"></i> Tema: <span id="lblThemeName" style="margin-left:4px; font-size:0.8em; opacity:0.7;">Dark</span>
                    </button>

                    <button id="btnToggleLayout" class="dropdown-item">
                        <i class="bi bi-layout-sidebar-inset"></i> Toolbar / Sidebar
                    </button>

                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                    
                    <button id="btnLogout" class="dropdown-item" style="color:#ef4444;">
                        <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
        <span class="group-label">Navegación</span>
    </div>

  </div>
</div>
`;

// Plantillas de componentes secundarios (Preview y Modales)
const HTML_COMPONENTS = `
<div id="previewBar" class="hidden">
    <div style="display:flex; gap:15px; align-items:center;">
        <i class="bi bi-zoom-out" style="color:var(--text-muted)"></i>
        <input type="range" id="zoomRange" min="40" max="130" step="5" value="70" style="width:100px;">
        <span id="zoomVal" style="color:#22d3ee; font-size:0.85rem; font-weight:600; width:40px;">70%</span>
        <button id="btnToggleSign" class="icon-btn" style="width:auto; padding:0 15px; font-size:0.9rem; gap:8px;">
            <i class="bi bi-pen"></i> Firmar
        </button>
    </div>
    <div style="width:1px; height:20px; background:rgba(255,255,255,0.2); margin:0 10px;"></div>
    <div style="display:flex; gap:10px;">
        <button id="btnRefresh" class="icon-btn"><i class="bi bi-arrow-clockwise"></i></button>
        <button id="btnOpenExport" class="icon-btn" style="background:#10b981; border:none;"><i class="bi bi-share-fill"></i></button>
    </div>
</div>

<div id="searchModal" class="modal-overlay">
  <div class="modal-box glass">
    <h3 style="color:#22d3ee; margin-bottom:15px; font-weight:300;">Buscar Paciente</h3>
    <input id="searchValue" class="form-input" placeholder="Nombre o Cédula..." style="margin-bottom:15px; padding:12px;">
    <div id="searchResultsList" style="max-height:300px; overflow-y:auto; margin-bottom:15px;"></div>
    <div style="text-align:right; display:flex; gap:10px; justify-content:flex-end;">
      <button id="btnCancelSearch" class="icon-btn" style="width:auto; padding:0 15px; font-size:0.9rem;">Cancelar</button>
      <button id="btnDoSearch" class="icon-btn" style="width:auto; padding:0 15px; font-size:0.9rem; background:#0ea5e9;">Buscar</button>
    </div>
  </div>
</div>

<div id="exportModal" class="modal-overlay">
  <div class="modal-box glass">
    <h3 style="color:#22d3ee; text-align:center; margin-bottom:5px;">Compartir</h3>
    <p id="exportFileName" style="text-align:center; color:#94a3b8; font-family:monospace; margin-bottom:25px;"></p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <button id="btnShareWA" class="icon-btn" style="width:100%; background:#25D366; gap:8px; font-size:0.9rem;"><i class="bi bi-whatsapp"></i> WhatsApp</button>
        <button id="btnShareMail" class="icon-btn" style="width:100%; background:#EA4335; gap:8px; font-size:0.9rem;"><i class="bi bi-envelope-fill"></i> Email</button>
        <button id="btnDownload" class="icon-btn" style="width:100%; background:#0ea5e9; grid-column:span 2; gap:8px; font-size:0.9rem;"><i class="bi bi-download"></i> Descargar Imagen</button>
    </div>
    <div style="text-align:right; margin-top:20px;">
        <button id="btnCloseExport" class="icon-btn" style="width:auto; padding:0 15px; font-size:0.8rem;">Cerrar</button>
    </div>
  </div>
</div>
`;

// ==========================================
// 2. RENDERIZADO Y CONEXIÓN
// ==========================================

export function initToolbarEvents() {
    // 1. INYECTAR HTML
    const mountPoint = document.getElementById('ui-mount-point');
    if (mountPoint) {
        mountPoint.innerHTML = HTML_TOP_TOOLBAR + HTML_COMPONENTS;
    } else {
        console.error("Falta #ui-mount-point en index.html");
        return;
    }

    // 2. ASIGNAR LISTENERS (Conectando con Engine)
    $("#btnNew")?.addEventListener('click', () => { if (confirm('¿Limpiar historia?')) { resetStory(); flash('Nueva historia'); } });
    $("#btnClose")?.addEventListener('click', saveCurrentHistory);
    $("#btnCloseStory")?.addEventListener('click', () => { if(confirm("¿Guardar y cerrar?")) { saveCurrentHistory(); resetStory(); } });
    
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    $("#btnDeleteLast")?.addEventListener('click', () => { 
        const c = $("#visitsContainer"); 
        if(c?.firstElementChild && confirm('¿Borrar última consulta?')) { c.firstElementChild.remove(); flash('Eliminada'); } 
    });

    $("#btnOpen")?.addEventListener('click', () => { $("#searchModal")?.classList.add('active'); $("#searchValue")?.focus(); $("#searchResultsList").innerHTML=''; });

    // Modales
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal")?.classList.remove('active'));
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeSearch(); });
    
    $("#btnOpenExport")?.addEventListener('click', () => {
        if (!STATE.currentPreviewDoc) { showErr("Genere documento primero"); return; }
        const fname = $("#documento_numero")?.value || 'paciente';
        const type = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        STATE.exportFilename = `CIMA_${fname}_${type}.png`;
        $("#exportFileName").textContent = STATE.exportFilename;
        $("#exportModal").classList.add('active');
    });
    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal")?.classList.remove('active'));
    $("#btnDownload")?.addEventListener('click', () => { exportToPNG(); $("#exportModal").classList.remove('active'); });
    $("#btnShareWA")?.addEventListener('click', shareViaWhatsApp);

    // Preview Tools
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#btnToggleSign")?.addEventListener('click', () => {
        STATE.USE_SIG = !STATE.USE_SIG;
        refreshPreview();
    });
    $("#zoomRange")?.addEventListener('input', (e) => {
        $("#zoomVal").textContent = e.target.value + '%';
        $("#docPreview").style.transform = `scale(${e.target.value / 100})`;
    });

    // --- MENÚ DE USUARIO (Lógica Nueva) ---
    const avatar = $("#btnUserAvatar");
    const menu = $("#userDropdown");
    
    if(avatar && menu) {
        avatar.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => { 
            if(!menu.classList.contains('hidden') && !menu.contains(e.target) && !avatar.contains(e.target)) menu.classList.add('hidden'); 
        });

        // Eventos del Menú
        $("#btnUserProfile")?.addEventListener('click', () => flash("Abriendo configuración... (Demo)"));
        $("#btnChangeWallpaper")?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
        
        // Lógica de Temas (Placeholder)
        $("#btnToggleTheme")?.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            // Aquí iría la lógica real de cambio de tema
            flash("Cambiando modo visual..."); 
        });

        // Lógica de Layout (Placeholder)
        $("#btnToggleLayout")?.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            flash("Alternando Toolbar/Sidebar..."); 
        });

        $("#btnLogout")?.addEventListener('click', () => {
            if(confirm("¿Cerrar sesión actual?")) location.reload(); 
        });
    }
}

function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}
