// app/logic/toolbar.js
import { $, $$, STATE, rotateWallpaper, log, flash, showErr } from 'brain';
import { ServiceLoader } from './service_loader.js';
import { saveCurrentHistory, resetStory, getSearchResults, loadHistoryRecord } from './engine.js';
import { DrawersManager } from './drawers.js';
import { AgendaManager } from 'appointments';
import { BillingManager } from 'billing';

window.DrawersManager = DrawersManager;

// ... (getNavGroupHTML y getHistoryGroupHTML se mantienen igual) ...
// (Para ahorrar espacio, copia las funciones getNavGroupHTML, getHistoryGroupHTML, getConsultToolsHTML y getPreviewGroupHTML del código anterior, NO han cambiado)

// PERO renderToolbar SÍ cambió la lógica de "changeMode":

function getNavGroupHTML(isSidebar) {
    const activeStyle = (mode) => STATE.UI.currentMode === mode ? 'background:rgba(255,255,255,0.2); color:white;' : '';
    const profile = STATE.currentUser?.profile || {};
    const assets = STATE.currentUser?.assets || {};
    const isLoggedIn = profile.id !== "guest";
    
    const title = profile.title || "";
    const name = profile.firstname ? `${profile.firstname} ${profile.lastname || ''}`.trim() : "Usuario";
    const role = profile.specialty || profile.role || "";

    let avatarPath = assets.avatar_path || "";
    if (avatarPath && !avatarPath.startsWith('http') && !avatarPath.startsWith('data:')) {
        if (!avatarPath.startsWith('./') && !avatarPath.startsWith('/')) {
            avatarPath = './' + avatarPath;
        }
    }

    const initials = (profile.firstname ? profile.firstname[0] : '') + (profile.lastname ? profile.lastname[0] : '');

    if (!isLoggedIn) {
        return `
        <div class="toolbar-group">
            <div class="icon-row">
                <button id="btnOpenLogin" class="icon-btn" title="Iniciar Sesión">
                    <i class="bi bi-person-circle"></i>
                </button>
                <button id="btnCreateUser" class="icon-btn" title="Crear Usuario" onclick="DrawersManager.UserCreator.open()">
                    <i class="bi bi-person-plus"></i>
                </button>
            </div>
            ${!isSidebar ? '<span class="group-label">Login</span>' : ''}
        </div>`;
    }

    const userMenu = `
    <div class="user-menu-wrapper">
        <button id="btnUserAvatar" class="avatar-circle" title="${name}">
            ${avatarPath 
                ? `<img src="${avatarPath}" onerror="this.style.display='none'; this.parentNode.innerText='${initials}';" alt="Avatar">` 
                : initials}
        </button>
        <div id="userDropdown" class="user-dropdown hidden">
            <div class="dropdown-header">
                <h4>${title} ${name}</h4>
                <p>${role}</p>
            </div>
            <button id="btnUserConfig" class="dropdown-item"><i class="bi bi-person-gear"></i> Configuración</button>
            <button id="btnChangeTheme" class="dropdown-item"><i class="bi bi-palette"></i> Cambiar Tema</button>
            <button id="btnToggleLayout" class="dropdown-item"><i class="bi bi-layout-sidebar"></i> Alternar Barra/Menú</button>
            <button id="btnChangeWallpaper" class="dropdown-item"><i class="bi bi-arrow-repeat"></i> Fondo</button>
            <div class="dropdown-divider"></div>
            <button id="btnLogout" class="dropdown-item text-danger"><i class="bi bi-power"></i> Salir</button>
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
    if (STATE.currentUser.profile.id === "guest") return '';
    return `
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnNew" class="icon-btn" title="Nueva"><i class="bi bi-file-earmark-plus"></i></button>
            <button id="btnOpen" class="icon-btn" title="Abrir"><i class="bi bi-folder2-open"></i></button>
            ${STATE.UI.isStoryOpen ? `<button id="btnClose" class="icon-btn" title="Guardar"><i class="bi bi-floppy"></i></button><button id="btnCloseStory" class="icon-btn btn-close-app" title="Cerrar"><i class="bi bi-x-lg"></i></button>` : ''}
        </div>
        <span class="group-label">Historia</span>
    </div>`;
}

function getConsultToolsHTML() {
    if (!STATE.UI.isStoryOpen || STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group">
        <div class="icon-row">
            <button id="btnAddConsulta" class="icon-btn" title="Agregar"><i class="bi bi-plus-lg"></i></button>
            <button id="btnDeleteLast" class="icon-btn" title="Borrar"><i class="bi bi-dash-lg"></i></button>
        </div>
        <span class="group-label">Consulta</span>
    </div>`;
}

function getPreviewGroupHTML() {
    if (!STATE.UI.isPreviewMode || STATE.currentUser.profile.id === "guest") return '';
    const active = (t) => STATE.currentPreviewDoc === t ? 'background:var(--primary);' : '';
    const docBody = document.querySelector('.doc-body');
    const currentSize = docBody ? parseInt(window.getComputedStyle(docBody).fontSize) : 16;

    return `
    <div class="v-divider"></div>
    <div class="toolbar-group preview-group">
        <div class="icon-row">
            <button onclick="window.switchDoc('INF')" class="icon-btn" style="font-size:0.7rem; width:auto; ${active('INF')}">INF</button>
            <button onclick="window.switchDoc('RP')" class="icon-btn" style="font-size:0.7rem; width:auto; ${active('RP')}">RP</button>
            <div class="v-divider" style="height:20px;"></div>
            <button id="btnFontPlus" class="icon-btn" title="Aumentar Letra"><i class="bi bi-plus-lg"></i></button>
            <span id="lblFontSize" style="font-size:0.75rem; color:white; width:30px; text-align:center;">${currentSize}px</span>
            <button id="btnFontMinus" class="icon-btn" title="Disminuir Letra"><i class="bi bi-dash-lg"></i></button>
            <div class="v-divider" style="height:20px;"></div>
            <button id="btnToggleSign" class="icon-btn" title="Firmar"><i class="bi bi-pen-fill"></i></button>
            <button id="btnOpenExport" class="icon-btn" title="Exportar"><i class="bi bi-share-fill"></i></button>
            <button id="btnExitPreview" class="icon-btn"><i class="bi bi-x-lg"></i></button>
        </div>
        <span class="group-label" style="color:var(--success);">Vista Previa</span>
    </div>`;
}

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;
    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    // GESTIÓN DE VISTAS (NUEVO)
    const viewConsult = document.getElementById('view-consultation');
    const viewAgenda = document.getElementById('view-agenda');
    const viewBilling = document.getElementById('view-billing');
    const previewShell = document.getElementById('previewShell');

    // Reset visibilidad
    viewConsult?.classList.add('hidden');
    viewAgenda?.classList.add('hidden');
    viewBilling?.classList.add('hidden');
    previewShell.classList.add('hidden');

    if (STATE.UI.isPreviewMode) {
        previewShell.classList.remove('hidden');
    } else {
        switch(STATE.UI.currentMode) {
            case 'AGENDA':
                viewAgenda.classList.remove('hidden');
                AgendaManager.init();
                break;
            case 'BILLING':
                viewBilling.classList.remove('hidden');
                BillingManager.init();
                break;
            case 'CONSULTATION':
            default:
                viewConsult.classList.remove('hidden');
                break;
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
    mount.innerHTML = html;
    bindEvents();
}

function adjustDocScale(delta) {
    const docBody = document.querySelector('.doc-body');
    const lbl = document.getElementById('lblFontSize');
    if (!docBody) return;
    const style = window.getComputedStyle(docBody);
    let currentSize = parseFloat(style.fontSize) || 16;
    let newSize = currentSize + delta;
    if (newSize < 10) newSize = 10;
    if (newSize > 24) newSize = 24;
    docBody.style.fontSize = `${newSize}px`;
    if(lbl) lbl.textContent = `${newSize}px`;
}

function bindEvents() {
    window.changeMode = (m) => { STATE.UI.currentMode = m; STATE.UI.isPreviewMode = false; renderToolbar(); };
    window.switchDoc = (t) => { if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); };

    document.getElementById('btnOpenLogin')?.addEventListener('click', () => DrawersManager.Login.open());
    document.getElementById('btnCreateUser')?.addEventListener('click', () => DrawersManager.UserCreator.open());
    document.querySelectorAll('.btn-close-drawer').forEach(btn => btn.addEventListener('click', () => DrawersManager.closeAll()));
    
    document.getElementById('btnToggleLayout')?.addEventListener('click', (e) => { e.stopPropagation(); STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar'; renderToolbar(); });
    document.getElementById('btnUserConfig')?.addEventListener('click', (e) => { e.stopPropagation(); DrawersManager.Config.open(); });
    document.getElementById('btnChangeTheme')?.addEventListener('click', (e) => { e.stopPropagation(); rotateTheme(); });
    
    document.getElementById('btnNew')?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar historia actual?")) return; 
        resetStory(); STATE.UI.isStoryOpen = true; 
        ServiceLoader.get('patient').initializeNewPatient(); renderToolbar(); 
    });
    
    document.getElementById('btnClose')?.addEventListener('click', () => { if(saveCurrentHistory()) flash('Guardado'); });
    document.getElementById('btnOpen')?.addEventListener('click', () => { 
        const query = prompt("Buscar paciente (nombre o documento):");
        if(query) {
            const results = getSearchResults(query);
            if(results.length > 0) loadHistoryRecord(results[0]);
            else alert("No se encontraron resultados.");
        }
    });
    
    document.getElementById('btnAddConsulta')?.addEventListener('click', handleAddConsulta);
    document.getElementById('btnDeleteLast')?.addEventListener('click', () => { if(confirm("¿Borrar última?")) document.getElementById('visitsContainer').firstChild?.remove(); });
    document.getElementById('btnExitPreview')?.addEventListener('click', () => { STATE.UI.isPreviewMode = false; renderToolbar(); });
    document.getElementById('btnToggleSign')?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; window.switchDoc(STATE.currentPreviewDoc); });

    document.getElementById('btnFontPlus')?.addEventListener('click', () => adjustDocScale(1));
    document.getElementById('btnFontMinus')?.addEventListener('click', () => adjustDocScale(-1));

    const avatarBtn = document.getElementById('btnUserAvatar');
    const userDropdown = document.getElementById('userDropdown');
    if(avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', (e) => { e.stopPropagation(); userDropdown.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if(!userDropdown.classList.contains('hidden') && !userDropdown.contains(e.target) && !avatarBtn.contains(e.target)) userDropdown.classList.add('hidden'); });
    }

    document.getElementById('btnChangeWallpaper')?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        if(confirm("¿Salir?")) {
            STATE.currentUser = { profile: { id:"guest", role:"guest", username:"guest", title:"", firstname:"Usuario", lastname:"", title_line_1:"", contact:{}, location:"" }, preferences:{ theme:"glass", default_model:"ORL-001" }, assets:{} };
            resetStory(); renderToolbar(); log("Sesión cerrada");
            DrawersManager.Login.open();
        }
    });
    document.getElementById('btnOpenExport')?.addEventListener('click', () => DrawersManager.Export.open());
}

function handleAddConsulta() {
    if(!STATE.UI.isStoryOpen) return;
    if (!$("#primer_nombre")?.value) return showErr('Ingrese nombre primero');
    const ConsultService = ServiceLoader.get('consult');
    $("#visitsContainer").classList.remove('hidden');
    const existingCards = $("#visitsContainer").querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    const newCard = ConsultService.createVisitCard(type);
    // (Nota: La lógica de herencia ya está dentro de createVisitCard en consult.js, no hace falta aquí)
    flash(type + ' Consulta');
    $("#visitsContainer").insertBefore(newCard, $("#visitsContainer").firstChild);
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function rotateTheme() {
    const themes = ['glass', 'liquid', 'light', 'dusk'];
    const currentTheme = document.body.className.match(/theme-(\w+)/)?.[1] || 'glass';
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    document.body.className = `theme-${nextTheme}`;
    localStorage.setItem('CIMA_THEME', nextTheme);
    log(`Tema: ${nextTheme}`);
}

export function initToolbarEvents() { renderToolbar(); }

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); 
    if(!card || STATE.currentUser.profile.id === "guest") return;
    STATE.currentPreviewCard = card; 
    STATE.currentPreviewDoc = kind; 
    STATE.UI.isPreviewMode = true;
    const docModule = ServiceLoader.get('documents');
    const html = kind === 'INF' ? docModule.buildReportHTML(card) : docModule.buildRecipeHTML(card);
    document.getElementById('docPreview').innerHTML = html;
    renderToolbar();
};
