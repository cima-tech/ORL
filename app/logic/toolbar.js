// app/logic/toolbar.js
import { $, $$, STATE, rotateWallpaper, log, flash, showErr } from 'brain';
import { ServiceLoader } from './service_loader.js'; // Importa el archivo limpio
import { saveCurrentHistory, resetStory, getSearchResults, loadHistoryRecord } from './engine.js';
import { DrawersManager } from './drawers.js'; // Importación del nuevo módulo

// Exponer globalmente para que funcionen los onclick de los HTML templates
window.DrawersManager = DrawersManager;

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
                <!-- NUEVO BOTÓN PARA CREAR USUARIO -->
                <button id="btnCreateUser" class="icon-btn" title="Crear Usuario" onclick="window.DrawersManager.openCreateUser()">
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
    return `
    <div class="v-divider"></div>
    <div class="toolbar-group preview-group">
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

export function renderToolbar() {
    const mount = document.getElementById('ui-mount-point');
    if (!mount) return;
    const isSidebar = STATE.UI.layout === 'sidebar';
    document.body.classList.toggle('has-sidebar', isSidebar);
    
    const previewShell = document.getElementById('previewShell');
    const form = document.getElementById('patientForm');
    const visits = document.getElementById('visitsContainer');

    if (STATE.UI.isPreviewMode && STATE.currentUser.profile.id !== "guest") {
        previewShell.classList.remove('hidden');
        form.classList.add('hidden');
        visits.classList.add('hidden');
    } else {
        previewShell.classList.add('hidden');
        if (STATE.UI.isStoryOpen && STATE.UI.currentMode === 'CONSULTATION' && STATE.currentUser.profile.id !== "guest") {
            form.classList.remove('hidden');
            visits.classList.remove('hidden');
        } else {
            form.classList.add('hidden');
            visits.classList.add('hidden');
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

function bindEvents() {
    window.changeMode = (m) => { STATE.UI.currentMode = m; STATE.UI.isPreviewMode = false; renderToolbar(); };
    window.switchDoc = (t) => { if(STATE.currentPreviewCard) window.openDocGlobal(t, STATE.currentPreviewCard.id); };

    document.getElementById('btnOpenLogin')?.addEventListener('click', () => document.getElementById('loginDrawer').classList.add('open'));
    document.querySelectorAll('.btn-close-drawer').forEach(btn => btn.addEventListener('click', () => btn.closest('.login-drawer, .config-drawer').classList.remove('open')));
    
    document.getElementById('btnToggleLayout')?.addEventListener('click', (e) => {
        e.stopPropagation();
        STATE.UI.layout = STATE.UI.layout === 'toolbar' ? 'sidebar' : 'toolbar';
        renderToolbar();
    });
    document.getElementById('btnUserConfig')?.addEventListener('click', (e) => { e.stopPropagation(); openConfigDrawer(); });
    document.getElementById('btnChangeTheme')?.addEventListener('click', (e) => { e.stopPropagation(); rotateTheme(); });
    
    document.getElementById('btnNew')?.addEventListener('click', () => { 
        if(STATE.UI.isStoryOpen && !confirm("¿Cerrar historia actual?")) return; 
        resetStory(); STATE.UI.isStoryOpen = true; 
        ServiceLoader.get('patient').initializeNewPatient(); renderToolbar(); 
    });
    document.getElementById('btnClose')?.addEventListener('click', () => { if(saveCurrentHistory()) flash('Guardado'); });
    
    document.getElementById('btnOpen')?.addEventListener('click', () => { 
        const query = prompt("Buscar paciente:");
        if(query) {
            const results = getSearchResults(query);
            results.length > 0 ? loadHistoryRecord(results[0]) : alert("No se encontraron resultados.");
        }
    });
    
    document.getElementById('btnAddConsulta')?.addEventListener('click', handleAddConsulta);
    document.getElementById('btnDeleteLast')?.addEventListener('click', () => { if(confirm("¿Borrar última?")) document.getElementById('visitsContainer').firstChild?.remove(); });
    document.getElementById('btnExitPreview')?.addEventListener('click', () => { STATE.UI.isPreviewMode = false; renderToolbar(); });
    document.getElementById('btnToggleSign')?.addEventListener('click', () => { STATE.USE_SIG = !STATE.USE_SIG; window.switchDoc(STATE.currentPreviewDoc); });

    const avatarBtn = document.getElementById('btnUserAvatar');
    const userDropdown = document.getElementById('userDropdown');
    if(avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if(!userDropdown.classList.contains('hidden') && !userDropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    document.getElementById('btnChangeWallpaper')?.addEventListener('click', (e) => { e.stopPropagation(); rotateWallpaper(); });
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        if(confirm("¿Salir?")) {
            STATE.currentUser = { profile: { id:"guest", role:"guest", username:"guest", title:"", firstname:"Usuario", lastname:"", title_line_1:"", contact:{}, location:"" }, preferences:{ theme:"glass", default_model:"ORL-001" }, assets:{} };
            resetStory(); renderToolbar(); log("Sesión cerrada");
        }
    });
}

function handleAddConsulta() {
    if(!STATE.UI.isStoryOpen) return;
    if (!$("#primer_nombre")?.value) return showErr('Ingrese nombre primero');
    const ConsultService = ServiceLoader.get('consult');
    $("#visitsContainer").classList.remove('hidden');
    const existingCards = $("#visitsContainer").querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    const newCard = ConsultService.createVisitCard(type);
    if (type === 'Primera') {
        const pVal = $("#antecedentes_personales")?.value || "";
        const fVal = $("#antecedentes_familiares")?.value || "";
        const tP = newCard.querySelector('.txt-antecedentes-personales');
        const tF = newCard.querySelector('.txt-antecedentes-familiares');
        if(tP) tP.value = pVal;
        if(tF) tF.value = fVal;
        flash('1ra Consulta');
    } else if (type === 'Sucesiva' && existingCards.length > 0) {
        const last = existingCards[0];
        ['.txt-antecedentes-personales', '.txt-antecedentes-familiares'].forEach(sel => {
            const src = last.querySelector(sel);
            const tgt = newCard.querySelector(sel);
            if(src && tgt) tgt.value = src.value;
        });
        flash('Sucesiva');
    }
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

function openConfigDrawer() {
    const configContent = document.getElementById('config-content');
    if (!configContent) return;
    const user = STATE.currentUser;
    const p = user.profile || {};
    const prof = user.professional || {};
    const inst = user.institution || {};
    const prefs = user.preferences || {};
    const sec = user.security || {};
    const assets = user.assets || {};
    if (!window.tempImageBuffer) window.tempImageBuffer = {};

    const html = `
    <div class="config-tabs">
        <button class="config-tab-btn active" onclick="switchConfigTab('perfil')">Perfil</button>
        <button class="config-tab-btn" onclick="switchConfigTab('prof')">Profesional</button>
        <button class="config-tab-btn" onclick="switchConfigTab('inst')">Institución</button>
        <button class="config-tab-btn" onclick="switchConfigTab('prefs')">Preferencias</button>
        <button class="config-tab-btn" onclick="switchConfigTab('assets')">Imágenes</button>
    </div>
    <div id="tab-perfil" class="config-tab-content active">
        <div class="form-section"><div class="form-section-title"><i class="bi bi-person"></i> Datos Personales</div><div class="form-grid">
            <div class="span-1"><label class="form-label">Título</label><input id="cfg-title" class="form-input" value="${p.title || ''}"></div>
            <div class="span-1"><label class="form-label">Primer Nombre</label><input id="cfg-firstname" class="form-input" value="${p.firstname || ''}"></div>
            <div class="span-1"><label class="form-label">Segundo Nombre</label><input id="cfg-secondname" class="form-input" value="${p.secondname || ''}"></div>
            <div class="span-1"><label class="form-label">Primer Apellido</label><input id="cfg-lastname" class="form-input" value="${p.lastname || ''}"></div>
            <div class="span-1"><label class="form-label">Segundo Apellido</label><input id="cfg-secondlastname" class="form-input" value="${p.secondlastname || ''}"></div>
            <div class="span-1"><label class="form-label">Tipo Sangre</label><input id="cfg-bloodtype" class="form-input" value="${p.bloodtype || ''}"></div>
            <div class="span-4"><label class="form-label">Ubicación</label><input id="cfg-location" class="form-input" value="${p.location || ''}"></div>
        </div></div>
        <div class="form-section"><div class="form-section-title"><i class="bi bi-telephone"></i> Contacto</div><div class="form-grid">
            <div class="span-2"><label class="form-label">Teléfono Principal</label><input id="cfg-phone" class="form-input" value="${p.contact?.phone || ''}"></div>
            <div class="span-2"><label class="form-label">Teléfono Secundario</label><input id="cfg-phone2" class="form-input" value="${p.contact?.phone2 || ''}"></div>
            <div class="span-2"><label class="form-label">Email Principal</label><input id="cfg-email" class="form-input" value="${p.contact?.email || ''}"></div>
            <div class="span-2"><label class="form-label">Email Alternativo</label><input id="cfg-email2" class="form-input" value="${p.contact?.email2 || ''}"></div>
            <div class="span-4"><label class="form-label">Instagram</label><input id="cfg-instagram" class="form-input" value="${p.contact?.instagram || ''}"></div>
        </div></div>
    </div>
    <div id="tab-prof" class="config-tab-content">
        <div class="form-section"><div class="form-section-title"><i class="bi bi-briefcase"></i> Datos Legales</div><div class="form-grid">
            <div class="span-2"><label class="form-label">Especialidad (Línea 1)</label><input id="cfg-specialty" class="form-input" value="${prof.specialty || p.title_line_1 || ''}"></div>
            <div class="span-2"><label class="form-label">Cargo / Detalle (Línea 2)</label><input id="cfg-title2" class="form-input" value="${p.title_line_2 || ''}"></div>
            <div class="span-2"><label class="form-label">Matrícula MPPS</label><input id="cfg-license" class="form-input" value="${prof.license_number || ''}"></div>
            <div class="span-2"><label class="form-label">Colegio Médico (CMM)</label><input id="cfg-college" class="form-input" value="${prof.college || ''}"></div>
            <div class="span-4"><label class="form-label">Etiqueta de Firma</label><input id="cfg-sig-label" class="form-input" value="${prof.signature_label || ''}"></div>
            <div class="span-4"><label class="form-label">Pie de Página Legal</label><input id="cfg-legal-footer" class="form-input" value="${prof.legal_footer || ''}"></div>
        </div></div>
    </div>
    <div id="tab-inst" class="config-tab-content">
        <div class="form-section"><div class="form-section-title"><i class="bi bi-hospital"></i> Datos Institucionales</div><div class="form-grid">
            <div class="span-2"><label class="form-label">Nombre Institución</label><input id="cfg-inst-name" class="form-input" value="${inst.name || ''}"></div>
            <div class="span-2"><label class="form-label">Servicio</label><input id="cfg-inst-service" class="form-input" value="${inst.service || ''}"></div>
            <div class="span-4"><label class="form-label">Dirección</label><input id="cfg-inst-address" class="form-input" value="${inst.address || ''}"></div>
        </div></div>
    </div>
    <div id="tab-prefs" class="config-tab-content">
        <div class="form-section"><div class="form-section-title"><i class="bi bi-sliders"></i> Preferencias</div><div class="form-grid">
            <div class="span-2"><label class="form-label">Color Primario</label><input type="color" id="cfg-pcolor" class="form-input" value="${prefs.primary_color || '#0ea5e9'}"></div>
            <div class="span-2"><label class="form-label">Zoom Default (%)</label><input type="number" id="cfg-zoom" class="form-input" value="${prefs.default_zoom || 60}"></div>
            <div class="span-2"><label class="form-label">Firma Digital por Defecto</label><select id="cfg-sig-default" class="form-select"><option value="true" ${prefs.use_digital_signature_default ? 'selected' : ''}>Sí</option><option value="false" ${!prefs.use_digital_signature_default ? 'selected' : ''}>No</option></select></div>
            <div class="span-2"><label class="form-label">Auto-lock (min)</label><input type="number" id="cfg-autolock" class="form-input" value="${sec.auto_lock_minutes || 15}"></div>
        </div></div>
    </div>
    <div id="tab-assets" class="config-tab-content">
        <div class="form-section"><div class="form-section-title"><i class="bi bi-images"></i> Imágenes</div>
            ${renderAssetUploader('Avatar', 'avatar', assets.avatar_path)}
            ${renderAssetUploader('Encabezado (Header)', 'header', assets.header_path)}
            ${renderAssetUploader('Pie de Página (Footer)', 'footer', assets.footer_path)}
            ${renderAssetUploader('Firma Digital', 'signature', assets.signature_path)}
            ${renderAssetUploader('Sello Húmedo', 'stamp', assets.stamp_path)}
        </div>
    </div>
    <div class="config-actions">
        <button class="icon-btn" onclick="saveFullConfig()" style="width:100%; background:var(--primary); color:white; height:45px; font-size:1rem;"><i class="bi bi-save"></i> GUARDAR CAMBIOS</button>
    </div>`;
    configContent.innerHTML = html;
    document.getElementById('configDrawer').classList.add('open');
    initAssetPreviews();
}

function renderAssetUploader(label, key, currentPath) {
    const src = currentPath && currentPath.length > 10 ? currentPath : '';
    return `<div class="asset-uploader"><div class="asset-preview" id="preview-${key}">${src ? `<img src="${src}" onerror="this.style.display='none'">` : '<i class="bi bi-image" style="font-size:1.5rem; color:#64748b;"></i>'}</div><div class="asset-info"><span class="asset-label">${label}</span><input type="file" id="input-${key}" accept="image/*" style="font-size:0.75rem; width:100%;"></div></div>`;
}

window.switchConfigTab = (tabName) => {
    document.querySelectorAll('.config-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.config-tab-btn[onclick*="'${tabName}'"]`).classList.add('active');
    document.querySelectorAll('.config-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
};

window.saveFullConfig = () => {
    const user = STATE.currentUser;
    user.profile.title = $('#cfg-title').value;
    user.profile.firstname = $('#cfg-firstname').value;
    user.profile.secondname = $('#cfg-secondname').value;
    user.profile.lastname = $('#cfg-lastname').value;
    user.profile.secondlastname = $('#cfg-secondlastname').value;
    user.profile.bloodtype = $('#cfg-bloodtype').value;
    user.profile.location = $('#cfg-location').value;
    user.profile.contact.phone = $('#cfg-phone').value;
    user.profile.contact.phone2 = $('#cfg-phone2').value;
    user.profile.contact.email = $('#cfg-email').value;
    user.profile.contact.email2 = $('#cfg-email2').value;
    user.profile.contact.instagram = $('#cfg-instagram').value;
    user.professional.specialty = $('#cfg-specialty').value;
    user.profile.title_line_1 = $('#cfg-specialty').value;
    user.profile.title_line_2 = $('#cfg-title2').value;
    user.professional.license_number = $('#cfg-license').value;
    user.professional.college = $('#cfg-college').value;
    user.professional.signature_label = $('#cfg-sig-label').value;
    user.professional.legal_footer = $('#cfg-legal-footer').value;
    user.institution.name = $('#cfg-inst-name').value;
    user.institution.service = $('#cfg-inst-service').value;
    user.institution.address = $('#cfg-inst-address').value;
    user.preferences.primary_color = $('#cfg-pcolor').value;
    user.preferences.default_zoom = $('#cfg-zoom').value;
    user.preferences.use_digital_signature_default = $('#cfg-sig-default').value === 'true';
    user.security.auto_lock_minutes = $('#cfg-autolock').value;
    ['avatar', 'header', 'footer', 'signature', 'stamp'].forEach(key => {
        const input = document.getElementById(`input-${key}`);
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                localStorage.setItem(`CIMA_IMG_${STATE.currentUser.profile.id}_${key}`, base64);
                user.assets[`${key}_path`] = base64;
                document.getElementById(`preview-${key}`).innerHTML = `<img src="${base64}">`;
                if(key === 'avatar') renderToolbar();
            };
            reader.readAsDataURL(input.files[0]);
        }
    });
    try { localStorage.setItem(`CIMA_USER_CONFIG_${STATE.currentUser.profile.id}`, JSON.stringify(user)); flash('Guardado.'); } catch(e) { showErr('Error: ' + e.message); }
    setTimeout(() => document.getElementById('configDrawer').classList.remove('open'), 1000);
};

function initAssetPreviews() {
    ['avatar', 'header', 'footer', 'signature', 'stamp'].forEach(key => {
        const input = document.getElementById(`input-${key}`);
        if(!input) return;
        const savedImg = localStorage.getItem(`CIMA_IMG_${STATE.currentUser.profile.id}_${key}`);
        if (savedImg) { const preview = document.getElementById(`preview-${key}`); if(preview) preview.innerHTML = `<img src="${savedImg}">`; }
        input.addEventListener('change', (e) => {
            if (e.target.files[0]) { const url = URL.createObjectURL(e.target.files[0]); const preview = document.getElementById(`preview-${key}`); if(preview) preview.innerHTML = `<img src="${url}">`; }
        });
    });
}

export function initToolbarEvents() { renderToolbar(); }

window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId); 
    if(!card || STATE.currentUser.profile.id === "guest") return;
    STATE.currentPreviewCard = card; 
    STATE.currentPreviewDoc = kind; 
    STATE.UI.isPreviewMode = true;
    document.getElementById('docPreview').innerHTML = kind === 'INF' ? ServiceLoader.get('informe').buildReportHTML(card) : ServiceLoader.get('recipe').buildRecipeHTML(card);
    renderToolbar();
};
