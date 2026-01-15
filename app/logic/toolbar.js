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
    
    // 1. Nueva Historia
    $("#btnNew")?.addEventListener('click', () => {
        if (!confirm('¿Iniciar nueva historia? Asegúrese de haber guardado cambios.')) return;
        resetStory();
        flash('Historia limpia iniciada.');
    });

    // 2. Guardar Historia
    $("#btnClose")?.addEventListener('click', () => {
        saveCurrentHistory();
    });

    // 2.1 NUEVO: Cerrar Historia (Guardar + Limpiar)
    $("#btnCloseStory")?.addEventListener('click', () => {
        if(confirm("¿Desea guardar y cerrar la historia actual?")) {
            saveCurrentHistory();
            resetStory();
            flash("Historia guardada y cerrada.");
        }
    });

    // 3. Agregar Consulta
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);

    // 4. Eliminar Última
    $("#btnDeleteLast")?.addEventListener('click', () => {
        const container = $("#visitsContainer");
        if (container && container.firstElementChild) {
            if (confirm('¿Eliminar la última consulta agregada?')) {
                container.firstElementChild.remove();
                flash('Consulta eliminada');
            }
        } else {
            showErr("No hay consultas para borrar");
        }
    });

    // 5. Buscar Paciente
    $("#btnOpen")?.addEventListener('click', openSearchModal);

    // 6. MENÚ DE USUARIO (NUEVO)
    const btnAvatar = $("#btnUserAvatar");
    const dropdown = $("#userDropdown");

    if(btnAvatar && dropdown) {
        btnAvatar.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click cierre inmediatamente
            dropdown.classList.toggle('hidden');
        });

        // Click fuera para cerrar
        document.addEventListener('click', (e) => {
            if (!dropdown.classList.contains('hidden')) {
                if (!dropdown.contains(e.target) && !btnAvatar.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    }

    // --- MODALES ---
    $("#btnCancelSearch")?.addEventListener('click', closeSearchModal);
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });

    // --- HERRAMIENTAS PREVIEW ---
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    
    $("#btnToggleSign")?.addEventListener('click', () => {
        STATE.USE_SIG = !STATE.USE_SIG;
        const btn = $("#btnToggleSign");
        if(btn) {
            btn.style.borderColor = STATE.USE_SIG ? 'var(--accent)' : 'rgba(255,255,255,0.2)';
            btn.style.color = STATE.USE_SIG ? 'var(--accent)' : 'var(--text-muted)';
            btn.innerHTML = STATE.USE_SIG ? '<i class="bi bi-pen-fill"></i> Firma: ON' : '<i class="bi bi-pen"></i> Firmar';
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

// Función auxiliar para resetear UI
function resetStory() {
    initializeNewPatient();
    const container = $("#visitsContainer");
    if(container) container.innerHTML = '';
    STATE.visitIdCounter = 0;
    STATE.currentPreviewCard = null;
    closePreview();
}

// --- LÓGICA AGREGAR CONSULTA ---
function handleAddConsulta() {
    if (!$("#primer_nombre")?.value) {
        showErr('Ingrese el nombre del paciente primero.');
        const input = $("#primer_nombre");
        if(input) {
            input.focus();
            input.style.borderColor = 'var(--danger)';
            setTimeout(() => input.style.borderColor = '', 1000);
        }
        return;
    }

    const container = $("#visitsContainer");
    const existingCards = container.querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    
    const newCard = createVisitCard(type);
    
    // HERENCIA DE DATOS
    if (type === 'Sucesiva' && existingCards.length > 0) {
        const lastCard = existingCards[0];
        
        const fieldsToCopy = ['.txt-antecedentes-personales', '.txt-antecedentes-familiares'];
        fieldsToCopy.forEach(sel => {
            const source = lastCard.querySelector(sel);
            const target = newCard.querySelector(sel);
            if(source && target) target.value = source.value;
        });

        const prevDx = lastCard.querySelector('.txt-dx')?.value;
        const targetDx = newCard.querySelector('.txt-dx');
        if (prevDx && targetDx) {
            targetDx.value = prevDx + " (Control)";
        }
        flash('Consulta sucesiva creada (Datos heredados)');
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

// Global
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;

    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.currentShareCard = card;

    let html = "";
    if (kind === 'INF') {
        html = buildReportHTML(card);
    } else {
        html = buildRecipeHTML(card);
    }
    
    const preview = $("#docPreview");
    if(preview) {
        preview.innerHTML = html;
        const zoom = $("#zoomRange")?.value || 70;
        preview.style.transform = `scale(${zoom / 100})`;
    }
    
    $("#previewBar")?.classList.remove('hidden');
    $("#previewShell")?.classList.remove('hidden');
    
    // No hacemos scroll forzoso al preview para no perder el contexto de escritura,
    // ya que ahora la barra flota.
};

// --- BASE DE DATOS LOCAL ---
function saveCurrentHistory() {
    const patientData = getPatientData();
    
    if (!patientData.documento_numero || !patientData.primer_nombre) {
        showErr('Faltan datos obligatorios (Doc o Nombre).');
        return;
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
    } catch (e) {
        showErr('Error de almacenamiento (LocalStorage lleno).');
    }
}

// --- BUSQUEDA ---
function openSearchModal() {
    $("#searchModal")?.classList.add('active');
    const input = $("#searchValue");
    if(input) {
        input.value = '';
        input.focus();
    }
    const list = $("#searchResultsList");
    if(list) list.innerHTML = '';
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
        list.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-muted);">Sin resultados</div>';
        return;
    }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.style.padding = '12px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div style="color:var(--accent); font-weight:bold; font-size:1.05rem;">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div>
            <div style="font-size:0.85rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:4px;">
                <span>${m.patient.documento_tipo}-${m.patient.documento_numero}</span>
                <span>${fmtDate(m.lastUpdated)}</span>
            </div>
        `;
        div.addEventListener('mouseenter', () => div.style.background = 'rgba(255,255,255,0.05)');
        div.addEventListener('mouseleave', () => div.style.background = 'transparent');
        
        div.onclick = () => loadHistoryRecord(m);
        list.appendChild(div);
    });
}

function loadHistoryRecord(record) {
    resetStory(); // Usamos la nueva función helper
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
    flash('Historia cargada exitosamente.');
}
