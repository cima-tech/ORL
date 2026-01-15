// app/logic/toolbar.js

import { $, $$, flash, showErr, STATE, fmtDate } from 'brain';
import { initializeNewPatient, getPatientData, loadPatientDataToDOM } from 'patient';
import { createVisitCard } from 'consult';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';

const STORAGE_KEY = 'CIMA_DB_ORL_V2';

// --- INICIALIZADOR DE EVENTOS ---
export function initToolbarEvents() {
    
    // --- GRUPO IZQUIERDO ---
    
    // 1. Nueva Historia
    $("#btnNew")?.addEventListener('click', () => {
        if (!confirm('¿Iniciar nueva historia? Se perderán los cambios no guardados.')) return;
        resetWorkspace();
        flash('Lienzo limpio.');
    });

    // 2. Guardar (Solo guardar)
    $("#btnSave")?.addEventListener('click', () => {
        saveCurrentHistory();
    });

    // 3. Cerrar Historia (Nuevo: Guardar y Limpiar)
    $("#btnCloseStory")?.addEventListener('click', () => {
        if(saveCurrentHistory()) { // Si guardó OK
            setTimeout(() => {
                resetWorkspace();
                flash('Historia guardada y cerrada.');
            }, 800);
        }
    });

    // 4. Agregar Consulta
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);

    // 5. Abrir / Buscar
    $("#btnOpen")?.addEventListener('click', openSearchModal);


    // --- GRUPO DERECHO (USUARIO & TOOLS) ---
    
    // Toggle Menú Usuario
    $("#btnUserAvatar")?.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar cierre inmediato
        $("#userDropdown").classList.toggle('hidden');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        const menu = $("#userDropdown");
        const btn = $("#btnUserAvatar");
        if(menu && !menu.classList.contains('hidden')) {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.add('hidden');
            }
        }
    });
    
    // Switch de Tema (Visual por ahora)
    $("#themeSwitch")?.addEventListener('click', (e) => {
        const sw = e.currentTarget;
        sw.classList.toggle('active'); // Mover bolita
        // Aquí iría la lógica real de cambio de tema CSS
        flash('Cambio de tema: Próximamente');
    });


    // --- MODALES BUSQUEDA ---
    $("#btnCancelSearch")?.addEventListener('click', closeSearchModal);
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });

    // --- PREVIEW BAR (Flotante) ---
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#btnClosePreview")?.addEventListener('click', closePreview); // Nuevo botón X
    
    // Toggle Firma
    $("#btnToggleSign")?.addEventListener('click', () => {
        STATE.USE_SIG = !STATE.USE_SIG;
        const btn = $("#btnToggleSign");
        if(btn) {
            btn.classList.toggle('primary'); // Cambio visual glass
            btn.innerHTML = STATE.USE_SIG ? '<i class="bi bi-pen-fill"></i> Con Firma' : '<i class="bi bi-pen"></i> Firmar';
        }
        refreshPreview();
    });

    // Exportar
    $("#btnOpenExport")?.addEventListener('click', () => {
        if (!STATE.currentPreviewDoc) { showErr("Genere un documento primero"); return; }
        
        const fname = $("#documento_numero")?.value || 'paciente';
        const type = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        
        STATE.exportFilename = `CIMA_${fname}_${type}.png`;
        const label = $("#exportFileName");
        if(label) label.textContent = STATE.exportFilename;
        
        $("#exportModal").classList.add('active');
    });

    $("#btnCloseExport")?.addEventListener('click', () => $("#exportModal").classList.remove('active'));
    
    $("#btnDownload")?.addEventListener('click', () => {
        exportToPNG();
        $("#exportModal").classList.remove('active');
    });
    
    $("#btnShareWA")?.addEventListener('click', shareViaWhatsApp);
    
    // Zoom Listener
    const zoomInput = $("#zoomRange");
    if(zoomInput) {
        zoomInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const label = $("#zoomVal");
            const preview = $("#docPreview");
            if(label) label.textContent = val + '%';
            if(preview) preview.style.transform = `scale(${val / 100})`;
        });
    }
}

// Helper para limpiar
function resetWorkspace() {
    initializeNewPatient();
    const container = $("#visitsContainer");
    if(container) container.innerHTML = '';
    STATE.visitIdCounter = 0;
    closePreview();
}

// --- LÓGICA AGREGAR CONSULTA ---
function handleAddConsulta() {
    if (!$("#primer_nombre")?.value) {
        showErr('Ingrese el nombre del paciente primero.');
        const input = $("#primer_nombre");
        if(input) {
            input.classList.add('input-error');
            setTimeout(() => input.classList.remove('input-error'), 500);
        }
        return;
    }

    const container = $("#visitsContainer");
    const existingCards = container.querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    
    const newCard = createVisitCard(type);
    
    if (type === 'Sucesiva' && existingCards.length > 0) {
        const lastCard = existingCards[0];
        // Heredar antecedentes
        ['.txt-antecedentes-personales', '.txt-antecedentes-familiares'].forEach(sel => {
            const source = lastCard.querySelector(sel);
            const target = newCard.querySelector(sel);
            if(source && target) target.value = source.value;
        });
        flash('Consulta sucesiva creada');
    } else {
        flash('Primera consulta creada');
    }

    container.insertBefore(newCard, container.firstChild);
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- PREVIEW ---
function closePreview() {
    $("#previewBar")?.classList.add('hidden');
    $("#previewShell")?.classList.add('hidden');
    STATE.currentPreviewDoc = null;
    STATE.currentPreviewCard = null;
}

function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        window.openDocGlobal(STATE.currentPreviewDoc, STATE.currentPreviewCard.id);
    }
}

// Global para los botones de las tarjetas
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;

    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;

    let html = "";
    if (kind === 'INF') html = buildReportHTML(card);
    else html = buildRecipeHTML(card);
    
    const preview = $("#docPreview");
    if(preview) {
        preview.innerHTML = html;
        const zoom = $("#zoomRange")?.value || 70;
        preview.style.transform = `scale(${zoom / 100})`;
    }
    
    $("#previewBar")?.classList.remove('hidden');
    $("#previewShell")?.classList.remove('hidden');
    
    // No hacer scroll brusco, solo mostrar la barra
};

// --- BASE DE DATOS LOCAL ---
function saveCurrentHistory() {
    const patientData = getPatientData();
    
    if (!patientData.documento_numero || !patientData.primer_nombre) {
        showErr('Faltan datos obligatorios (Doc o Nombre).');
        return false;
    }

    const visits = Array.from($$('.visit-card')).map(card => {
        return {
            type: card.dataset.type,
            date: card.querySelector('.visit-date')?.value,
            motivo: card.querySelector('.txt-motivo')?.value,
            ea: card.querySelector('.txt-ea')?.value,
            ant_pers: card.querySelector('.txt-antecedentes-personales')?.value,
            ant_fam: card.querySelector('.txt-antecedentes-familiares')?.value,
            ex_cara: card.querySelector('.txt-exam-cara')?.value,
            ex_od: card.querySelector('.txt-exam-oido-derecho')?.value,
            ex_oi: card.querySelector('.txt-exam-oido-izquierdo')?.value,
            ex_nariz: card.querySelector('.txt-exam-nariz')?.value,
            ex_oro: card.querySelector('.txt-exam-orofaringe')?.value,
            ex_cuello: card.querySelector('.txt-exam-cuello')?.value,
            dx: card.querySelector('.txt-dx')?.value,
            recipe: card.querySelector('.txt-recipe')?.value,
            indicaciones: card.querySelector('.txt-indicaciones')?.value,
            plan: card.querySelector('.txt-plan')?.value
        };
    });

    const fullRecord = {
        patient: patientData,
        visits: visits,
        lastUpdated: new Date().toISOString()
    };

    try {
        let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        db[patientData.documento_numero] = fullRecord;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        flash('Historia guardada.');
        return true;
    } catch (e) {
        showErr('Error al guardar (LocalStorage lleno).');
        console.error(e);
        return false;
    }
}

// --- BUSQUEDA ---
function openSearchModal() {
    $("#searchModal")?.classList.add('active');
    const input = $("#searchValue");
    if(input) { input.value = ''; input.focus(); }
    $("#searchResultsList").innerHTML = '';
}

function closeSearchModal() {
    $("#searchModal")?.classList.remove('active');
}

function executeSearch() {
    const query = $("#searchValue")?.value.toLowerCase().trim();
    if (!query) return;

    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const list = $("#searchResultsList");
    list.innerHTML = '';

    const matches = Object.values(db).filter(r => {
        const p = r.patient;
        const name = `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase();
        return name.includes(query) || p.documento_numero.includes(query);
    });

    if (matches.length === 0) {
        list.innerHTML = '<div style="padding:15px; text-align:center; color:#94a3b8;">No se encontraron pacientes.</div>';
        return;
    }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.className = "glass-btn"; // Reutilizamos estilo
        div.style.marginBottom = "5px";
        div.style.justifyContent = "space-between";
        div.innerHTML = `
            <div>
                <div style="color:var(--accent); font-weight:bold;">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">${m.patient.documento_tipo}-${m.patient.documento_numero}</div>
            </div>
            <div style="font-size:0.7rem; color:#64748b;">${fmtDate(m.lastUpdated)}</div>
        `;
        div.onclick = () => loadHistoryRecord(m);
        list.appendChild(div);
    });
}

function loadHistoryRecord(record) {
    resetWorkspace();
    loadPatientDataToDOM(record.patient);

    const container = $("#visitsContainer");
    const visitsReversed = [...(record.visits || [])].reverse();

    visitsReversed.forEach(v => {
        const card = createVisitCard(v.type || 'Sucesiva');
        const setVal = (sel, val) => { const el = card.querySelector(sel); if(el) el.value = val || ''; };
        
        setVal('.visit-date', v.date);
        setVal('.txt-motivo', v.motivo);
        setVal('.txt-ea', v.ea);
        setVal('.txt-antecedentes-personales', v.ant_pers);
        setVal('.txt-antecedentes-familiares', v.ant_fam);
        setVal('.txt-exam-cara', v.ex_cara);
        setVal('.txt-exam-oido-derecho', v.ex_od);
        setVal('.txt-exam-oido-izquierdo', v.ex_oi);
        setVal('.txt-exam-nariz', v.ex_nariz);
        setVal('.txt-exam-orofaringe', v.ex_oro);
        setVal('.txt-exam-cuello', v.ex_cuello);
        setVal('.txt-dx', v.dx);
        setVal('.txt-recipe', v.recipe);
        setVal('.txt-indicaciones', v.indicaciones);
        setVal('.txt-plan', v.plan);

        container.prepend(card);
    });

    closeSearchModal();
    flash('Historia cargada.');
}
