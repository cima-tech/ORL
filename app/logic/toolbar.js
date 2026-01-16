// app/logic/toolbar.js

import { $, STATE, rotateWallpaper, flash, showErr } from 'brain';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';
// Importamos la Lógica del Engine
import { saveCurrentHistory, resetStory, handleAddConsulta, executeSearch } from './engine.js'; 

// ==========================================
// 1. PLANTILLAS HTML (COMPONENTES VISUALES)
// ==========================================

const HTML_TOP_TOOLBAR = `
<div class="toolbar-wrapper">
  <div class="toolbar">
    <div class="toolbar-section-left">
        <div class="logo">
          <div class="main">CIMA</div>
          <div class="subtitle">ORL v3.0</div>
        </div>
        <button id="btnNew" class="toolbar-btn"><i class="bi bi-file-earmark-plus"></i> <span class="d-none-mobile">Nueva</span></button>
        <button id="btnOpen" class="toolbar-btn"><i class="bi bi-folder2-open"></i> <span class="d-none-mobile">Abrir</span></button>
        <button id="btnClose" class="toolbar-btn"><i class="bi bi-save"></i> <span class="d-none-mobile">Guardar</span></button>
        <div class="v-sep"></div>
        <button id="btnAddConsulta" class="toolbar-btn"><i class="bi bi-plus-circle-dotted"></i> Consulta</button>
        <button id="btnDeleteLast" class="toolbar-btn text-danger"><i class="bi bi-trash"></i></button>
        <div class="v-sep"></div>
        <button id="btnCloseStory" class="toolbar-btn btn-close-story"><i class="bi bi-x-lg"></i> Cerrar HC</button>
    </div>
    <div class="toolbar-section-right">
        <button class="toolbar-btn" style="opacity:0.6;"><i class="bi bi-calendar-week"></i></button>
        <button class="toolbar-btn" style="opacity:0.6;"><i class="bi bi-receipt"></i></button>
        <div class="v-sep"></div>
        <div class="user-menu-container">
            <button id="btnUserAvatar" class="avatar-btn">DR</button>
            <div id="userDropdown" class="user-dropdown hidden">
                <div class="dropdown-header"><h4>Dr. Usuario</h4><p>Configuración</p></div>
                <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-card-image"></i> Cambiar Fondo</button>
                <div class="dropdown-item smart-switch" id="btnThemeSwitch"><span><i class="bi bi-moon-stars"></i> Modo Oscuro</span><div class="toggle-track"><div class="toggle-thumb"></div></div></div>
                <div style="border-top:1px solid rgba(255,255,255,0.1); margin:4px 0;"></div>
                <button class="dropdown-item" style="color:#ef4444;"><i class="bi bi-power"></i> Cerrar Sesión</button>
            </div>
        </div>
    </div>
  </div>
</div>
`;

const HTML_PREVIEW_BAR = `
<div id="previewBar" class="hidden">
    <div style="display:flex; gap:15px; align-items:center;">
        <i class="bi bi-zoom-out" style="color:var(--text-muted)"></i>
        <input type="range" id="zoomRange" min="40" max="130" step="5" value="70" style="width:100px;">
        <span id="zoomVal" style="color:var(--accent); font-size:0.85rem; font-weight:600; width:40px;">70%</span>
        <button id="btnToggleSign" class="toolbar-btn" style="border:1px solid rgba(255,255,255,0.2);"><i class="bi bi-pen"></i> Firmar</button>
    </div>
    <div style="display:flex; gap:10px; margin-left:20px; padding-left:20px; border-left:1px solid rgba(255,255,255,0.1);">
        <button id="btnRefresh" class="toolbar-btn"><i class="bi bi-arrow-clockwise"></i></button>
        <button id="btnOpenExport" class="toolbar-btn" style="background:var(--success); color:white; border:none;"><i class="bi bi-share-fill"></i> Exportar</button>
    </div>
</div>
`;

const HTML_MODALS = `
<div id="searchModal" class="modal-overlay">
  <div class="modal-box glass">
    <h3 style="color:var(--accent); margin-bottom:15px; font-weight:300;">Buscar Paciente</h3>
    <input id="searchValue" class="form-input" placeholder="Escriba nombre o cédula..." style="margin-bottom:15px; padding:12px;">
    <div id="searchResultsList" style="max-height:300px; overflow-y:auto; margin-bottom:15px;"></div>
    <div style="text-align:right; display:flex; gap:10px; justify-content:flex-end;">
      <button id="btnCancelSearch" class="toolbar-btn">Cancelar</button>
      <button id="btnDoSearch" class="toolbar-btn" style="background:var(--primary); color:white;">Buscar</button>
    </div>
  </div>
</div>

<div id="exportModal" class="modal-overlay">
  <div class="modal-box glass">
    <h3 style="color:var(--accent); text-align:center; margin-bottom:5px;">Compartir Documento</h3>
    <p id="exportFileName" style="text-align:center; color:var(--text-muted); font-family:monospace; margin-bottom:25px;"></p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <button id="btnShareWA" class="toolbar-btn" style="background:#25D366; color:white; justify-content:center;"><i class="bi bi-whatsapp"></i> WhatsApp</button>
        <button id="btnShareMail" class="toolbar-btn" style="background:#EA4335; color:white; justify-content:center;"><i class="bi bi-envelope-fill"></i> Email</button>
        <button id="btnDownload" class="toolbar-btn" style="background:var(--primary); color:white; grid-column:span 2; justify-content:center; padding:12px;"><i class="bi bi-download"></i> Descargar</button>
    </div>
    <div style="text-align:right; margin-top:20px;">
        <button id="btnCloseExport" class="toolbar-btn">Cerrar</button>
    </div>
  </div>
</div>
`;

// ==========================================
// 2. RENDERIZADO Y EVENTOS
// ==========================================

export function initUIAndEvents() {
    // 1. RENDERIZAR TODO (TopBar, Preview, Modals)
    const mountPoint = document.getElementById('ui-mount-point');
    if (mountPoint) {
        // Concatenamos todos los strings HTML y los inyectamos de una vez
        mountPoint.innerHTML = HTML_TOP_TOOLBAR + HTML_PREVIEW_BAR + HTML_MODALS;
    } else {
        console.error("Falta #ui-mount-point en index.html");
        return;
    }

    // 2. EVENTOS DEL TOOLBAR (Conectando con Engine.js)
    $("#btnNew")?.addEventListener('click', () => {
        if (confirm('¿Limpiar historia actual?')) { resetStory(); flash('Nueva historia'); }
    });
    
    $("#btnClose")?.addEventListener('click', saveCurrentHistory);
    
    $("#btnCloseStory")?.addEventListener('click', () => {
        if(confirm("¿Guardar y cerrar?")) { saveCurrentHistory(); resetStory(); }
    });

    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);
    
    $("#btnDeleteLast")?.addEventListener('click', () => {
        const container = $("#visitsContainer");
        if(container?.firstElementChild && confirm('¿Borrar última?')) { 
            container.firstElementChild.remove(); flash('Eliminada'); 
        }
    });

    // 3. UI VISUAL & ZOOM (Lógica de vista pura)
    
    // Zoom Slider
    $("#zoomRange")?.addEventListener('input', (e) => {
        const val = e.target.value;
        $("#zoomVal").textContent = val + '%';
        $("#docPreview").style.transform = `scale(${val / 100})`;
    });

    // Modales (Abrir/Cerrar)
    $("#btnOpen")?.addEventListener('click', () => { 
        $("#searchModal")?.classList.add('active'); 
        $("#searchValue")?.focus(); 
        $("#searchResultsList").innerHTML=''; 
    });
    $("#btnCancelSearch")?.addEventListener('click', () => $("#searchModal")?.classList.remove('active'));
    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal")?.classList.remove('active'));

    // Búsqueda (Llama al Engine)
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeSearch(); });

    // Preview Tools
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#btnToggleSign")?.addEventListener('click', toggleSignatureState);
    
    // Menú Usuario
    initUserMenu();

    // Exportación
    initExportTools();
}

// --- FUNCIONES UI PRIVADAS (Solo afectan visuales) ---

function toggleSignatureState() {
    STATE.USE_SIG = !STATE.USE_SIG;
    const btn = $("#btnToggleSign");
    if(btn) {
        btn.style.color = STATE.USE_SIG ? 'var(--primary)' : 'var(--text-muted)';
        btn.innerHTML = STATE.USE_SIG ? '<i class="bi bi-pen-fill"></i> Firma: ON' : '<i class="bi bi-pen"></i> Firmar';
    }
    refreshPreview();
}

function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}

// Esta función es llamada por el index o engine para mostrar documentos
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;

    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.currentShareCard = card;

    let html = kind === 'INF' ? buildReportHTML(card) : buildRecipeHTML(card);
    const preview = $("#docPreview");
    if(preview) {
        preview.innerHTML = html;
        const zoom = $("#zoomRange")?.value || 70;
        preview.style.transform = `scale(${zoom / 100})`;
    }
    
    $("#previewBar")?.classList.remove('hidden');
    $("#previewShell")?.classList.remove('hidden');
};

function initUserMenu() {
    const btn = $("#btnUserAvatar");
    const menu = $("#userDropdown");
    if(btn && menu) {
        btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { 
            if(!menu.classList.contains('hidden') && !menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add('hidden'); 
        });
        $("#btnChangeWallpaper")?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
    }
}

function initExportTools() {
    $("#btnOpenExport")?.addEventListener('click', () => {
        if (!STATE.currentPreviewDoc) { showErr("Genere documento primero"); return; }
        const fname = $("#documento_numero")?.value || 'paciente';
        const type = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        STATE.exportFilename = `CIMA_${fname}_${type}.png`;
        const label = $("#exportFileName");
        if(label) label.textContent = STATE.exportFilename;
        $("#exportModal").classList.add('active');
    });
    $("#btnDownload")?.addEventListener('click', () => { exportToPNG(); $("#exportModal").classList.remove('active'); });
    $("#btnShareWA")?.addEventListener('click', shareViaWhatsApp);
}
