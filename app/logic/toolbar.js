// app/logic/toolbar.js

import { $, $$, flash, showErr, STATE, fmtDate } from 'brain';
import { initializeNewPatient, getPatientData, loadPatientDataToDOM } from 'patient';
import { createVisitCard } from 'consult'; // <--- Conecta con el nuevo consult.js
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';

// Clave para LocalStorage (Tu base de datos en el navegador)
const STORAGE_KEY = 'CIMA_DB_ORL_V2';

// --- INICIALIZADOR DE EVENTOS ---
export function initToolbarEvents() {
    
    // 1. Nueva Historia
    $("#btnNew")?.addEventListener('click', () => {
        if (!confirm('¿Iniciar nueva historia? Asegúrese de haber guardado cambios.')) return;
        
        initializeNewPatient();
        const container = $("#visitsContainer");
        if(container) container.innerHTML = '';
        
        STATE.visitIdCounter = 0;
        STATE.currentPreviewCard = null;
        closePreview();
        
        flash('Historia limpia iniciada.');
    });

    // 2. Guardar Historia
    $("#btnClose")?.addEventListener('click', () => {
        saveCurrentHistory();
    });

    // 3. Agregar Consulta (Nueva Lógica)
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

    // --- MODALES ---
    $("#btnCancelSearch")?.addEventListener('click', closeSearchModal);
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });

    // --- HERRAMIENTAS PREVIEW ---
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    
    // Toggle Firma
    $("#btnToggleSign")?.addEventListener('click', () => {
        STATE.USE_SIG = !STATE.USE_SIG;
        const btn = $("#btnToggleSign");
        if(btn) {
            btn.style.color = STATE.USE_SIG ? '#60a5fa' : '#94a3b8';
            btn.innerHTML = STATE.USE_SIG ? '<i class="bi bi-pen-fill"></i> Firma: ON' : '<i class="bi bi-pen"></i> Firma: OFF';
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

// --- LÓGICA AGREGAR CONSULTA ---
function handleAddConsulta() {
    // Validación: Nombre obligatorio para identificar al paciente
    if (!$("#primer_nombre")?.value) {
        showErr('Error: Ingrese el nombre del paciente antes de crear la consulta.');
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
    
    // Usamos el nuevo consult.js
    const newCard = createVisitCard(type);
    
    // HERENCIA DE DATOS (Inteligencia)
    if (type === 'Sucesiva' && existingCards.length > 0) {
        const lastCard = existingCards[0]; // La más reciente está arriba
        
        // Copiar inputs clave si existen en ambas tarjetas
        const fieldsToCopy = ['.txt-antecedentes-personales', '.txt-antecedentes-familiares'];
        
        fieldsToCopy.forEach(sel => {
            const source = lastCard.querySelector(sel);
            const target = newCard.querySelector(sel);
            if(source && target) target.value = source.value;
        });

        // Copiar Dx anterior como referencia
        const prevDx = lastCard.querySelector('.txt-dx')?.value;
        const targetDx = newCard.querySelector('.txt-dx');
        if (prevDx && targetDx) {
            targetDx.value = prevDx + " (Control)";
        }
        
        flash('Consulta sucesiva creada (Datos heredados)');
    } else {
        flash('Primera consulta creada');
    }

    // Insertar arriba (Prepend)
    container.insertBefore(newCard, container.firstChild);
    
    // Scroll suave
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
    STATE.currentShareCard = card;

    // Generar HTML usando los módulos importados
    let html = "";
    if (kind === 'INF') {
        html = buildReportHTML(card);
    } else {
        html = buildRecipeHTML(card);
    }
    
    const preview = $("#docPreview");
    if(preview) {
        preview.innerHTML = html;
        // Aplicar zoom actual
        const zoom = $("#zoomRange")?.value || 70;
        preview.style.transform = `scale(${zoom / 100})`;
    }
    
    $("#previewBar")?.classList.remove('hidden');
    $("#previewShell")?.classList.remove('hidden');
    
    // Scroll al preview
    $("#previewBar")?.scrollIntoView({ behavior: 'smooth' });
};

// --- BASE DE DATOS LOCAL (PERSISTENCIA) ---
function saveCurrentHistory() {
    const patientData = getPatientData();
    
    if (!patientData.documento_numero || !patientData.primer_nombre) {
        showErr('Faltan datos obligatorios del paciente (Doc o Nombre).');
        return;
    }

    // Serializar Consultas (Leyendo el DOM actual)
    const visits = Array.from($$('.visit-card')).map(card => {
        return {
            type: card.dataset.type,
            date: card.querySelector('.visit-date')?.value,
            motivo: card.querySelector('.txt-motivo')?.value,
            ea: card.querySelector('.txt-ea')?.value,
            ant_pers: card.querySelector('.txt-antecedentes-personales')?.value,
            ant_fam: card.querySelector('.txt-antecedentes-familiares')?.value,
            // Examen
            ex_cara: card.querySelector('.txt-exam-cara')?.value,
            ex_od: card.querySelector('.txt-exam-oido-derecho')?.value,
            ex_oi: card.querySelector('.txt-exam-oido-izquierdo')?.value,
            ex_nariz: card.querySelector('.txt-exam-nariz')?.value,
            ex_oro: card.querySelector('.txt-exam-orofaringe')?.value,
            ex_cuello: card.querySelector('.txt-exam-cuello')?.value,
            // Dx Plan
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
        flash('Historia guardada localmente OK.');
    } catch (e) {
        showErr('Error guardando: Posiblemente memoria llena.');
        console.error(e);
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
        list.innerHTML = '<div style="padding:10px; text-align:center; color:#94a3b8;">Sin resultados</div>';
        return;
    }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div style="color:#60a5fa; font-weight:bold;">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div>
            <div style="font-size:0.8rem; color:#94a3b8;">${m.patient.documento_tipo}-${m.patient.documento_numero} | ${fmtDate(m.lastUpdated)}</div>
        `;
        div.onclick = () => loadHistoryRecord(m);
        list.appendChild(div);
    });
}

function loadHistoryRecord(record) {
    initializeNewPatient(); // Limpia
    loadPatientDataToDOM(record.patient); // Carga Paciente

    const container = $("#visitsContainer");
    container.innerHTML = '';

    // Cargar visitas (En orden inverso para mantener cronología visual)
    // El array guardado tiene la más reciente en índice 0 (porque usamos prepend al crear)
    // Así que las recorremos en orden reverso para hacer appendChild y que queden igual
    const visitsReversed = [...(record.visits || [])].reverse();

    visitsReversed.forEach(v => {
        const card = createVisitCard(v.type || 'Sucesiva');
        
        // Restaurar valores (Mapeo manual para seguridad)
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

        // Importante: Insertar al principio (como si las fuéramos creando)
        // O al final si las invertimos antes. Como invertimos el array, usamos prepend para que la última quede arriba.
        container.prepend(card);
    });

    closeSearchModal();
    flash('Historia cargada exitosamente.');
}
