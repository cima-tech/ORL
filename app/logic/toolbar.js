// CORRECCIÓN: Usamos los nombres del Import Map definidos en index.html
import { $, $$, flash, showErr, STATE, fmtDate } from 'brain';
import { initializeNewPatient, getPatientData, loadPatientDataToDOM } from 'patient';
import { createVisitCard } from 'data';
import { exportToPNG, shareViaWhatsApp } from 'export';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';

// Clave para LocalStorage (Base de datos simulada)
const STORAGE_KEY = 'CIMA_DB_ORL_V2';

// --- INICIALIZADOR DE EVENTOS DE BARRA ---
export function initToolbarEvents() {
    
    // 1. Botón: Nueva Historia
    $("#btnNew")?.addEventListener('click', () => {
        if (!confirm('¿Iniciar una nueva historia clínica? Guarde cambios antes de continuar.')) return;
        
        // Reset completo
        initializeNewPatient();
        $("#visitsContainer").innerHTML = '';
        STATE.visitIdCounter = 0;
        STATE.currentPreviewCard = null;
        closePreview();
        
        flash('Nueva historia iniciada. Formulario limpio.');
    });

    // 2. Botón: Guardar Historia
    $("#btnClose")?.addEventListener('click', () => {
        saveCurrentHistory();
    });

    // 3. Botón: Agregar Consulta
    $("#btnAddConsulta")?.addEventListener('click', handleAddConsulta);

    // 4. Botón: Eliminar Última Consulta
    $("#btnDeleteLast")?.addEventListener('click', () => {
        const cards = $$('.visit-card');
        if (cards.length === 0) return;
        
        if (confirm('¿Eliminar la última consulta agregada?')) {
            const last = cards[0]; // Como hacemos prepend, la última agregada es la primera visualmente
            last.remove();
            flash('Consulta eliminada');
        }
    });

    // 5. Botón: Abrir/Buscar (Modal)
    $("#btnOpen")?.addEventListener('click', () => {
        openSearchModal();
    });

    // --- EVENTOS DEL MODAL DE BÚSQUEDA ---
    $("#btnCancelSearch")?.addEventListener('click', closeSearchModal);
    $("#btnDoSearch")?.addEventListener('click', executeSearch);
    $("#searchValue")?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });

    // --- EVENTOS DE PREVIEW (BARRA FLOTANTE) ---
    // Estos eventos suelen estar en el HTML estático, pero los manejamos aquí para centralizar lógica
    $("#btnRefresh")?.addEventListener('click', refreshPreview);
    $("#btnExport")?.addEventListener('click', exportToPNG);
}

// --- LÓGICA DE AGREGAR CONSULTA ---
function handleAddConsulta() {
    // Validación mínima: Paciente debe tener nombre
    if (!$("#primer_nombre").value) {
        showErr('Error: Debe ingresar al menos el Primer Nombre del paciente antes de iniciar consultas.');
        return;
    }

    const existingCards = $$('.visit-card');
    // Si hay tarjetas, es sucesiva. Si no, es primera.
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    
    // Crear la tarjeta usando el módulo data.js
    const newCard = createVisitCard(type);
    
    // LÓGICA DE HERENCIA: Copiar datos de la consulta anterior si es sucesiva
    if (type === 'Sucesiva' && existingCards.length > 0) {
        // Obtenemos la consulta más reciente (que es la primera en el DOM por el prepend)
        const lastCard = existingCards[0];
        
        // Copiar Antecedentes (Rara vez cambian)
        const antPers = lastCard.querySelector('.txt-antecedentes-personales').value;
        const antFam = lastCard.querySelector('.txt-antecedentes-familiares').value;
        
        newCard.querySelector('.txt-antecedentes-personales').value = antPers;
        newCard.querySelector('.txt-antecedentes-familiares').value = antFam;
        
        // Copiar Diagnósticos previos (útil para control)
        const prevDx = lastCard.querySelector('.txt-dx').value;
        if (prevDx) {
            newCard.querySelector('.txt-dx').value = prevDx + " (Control)";
        }
        
        flash('Consulta sucesiva creada (Datos heredados)');
    } else {
        flash('Primera consulta creada');
    }

    // Insertar al principio (Orden cronológico inverso: lo más nuevo arriba)
    $("#visitsContainer").prepend(newCard);
}

// --- PERSISTENCIA (GUARDAR/CARGAR) ---
function saveCurrentHistory() {
    // 1. Obtener Datos del Paciente
    const patientData = getPatientData();
    
    // Validación crítica
    if (!patientData.documento_numero || !patientData.primer_nombre) {
        showErr('No se puede guardar: Faltan datos obligatorios (Documento o Nombre).');
        return;
    }

    // 2. Serializar Visitas
    // Recorremos el DOM de visitas para extraer su estado actual
    const visits = $$('.visit-card').map(card => {
        // Serialización manual de los campos de la tarjeta
        return {
            type: card.dataset.type,
            date: card.querySelector('.visit-date').value,
            motivo: card.querySelector('.txt-motivo').value,
            ea: card.querySelector('.txt-ea').value,
            // Antecedentes
            ant_pers: card.querySelector('.txt-antecedentes-personales').value,
            ant_fam: card.querySelector('.txt-antecedentes-familiares').value,
            // Examen Físico
            ex_cara: card.querySelector('.txt-exam-cara').value,
            ex_od: card.querySelector('.txt-exam-oido-derecho').value,
            ex_oi: card.querySelector('.txt-exam-oido-izquierdo').value,
            ex_nariz: card.querySelector('.txt-exam-nariz').value,
            ex_oro: card.querySelector('.txt-exam-orofaringe').value,
            ex_cuello: card.querySelector('.txt-exam-cuello').value,
            // Dx y Plan
            dx: card.querySelector('.txt-dx').value,
            recipe: card.querySelector('.txt-recipe').value,
            indicaciones: card.querySelector('.txt-indicaciones').value,
            plan: card.querySelector('.txt-plan').value,
            // Metadatos
            doc_emitido: card.dataset.documentoEmitido || 'false'
        };
    });

    // 3. Estructura del Registro
    const fullRecord = {
        patient: patientData,
        visits: visits, // Array de visitas
        lastUpdated: new Date().toISOString()
    };

    // 4. Guardar en LocalStorage
    try {
        let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        // Usamos el número de documento como clave primaria
        db[patientData.documento_numero] = fullRecord;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        flash('Historia guardada exitosamente en base de datos local.');
    } catch (e) {
        showErr('Error al guardar: Espacio insuficiente o error de escritura.');
        console.error(e);
    }
}

function loadHistory(docId) {
    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const record = db[docId];
    
    if (!record) {
        showErr('Paciente no encontrado en la base de datos.');
        return;
    }

    // 1. Cargar Paciente
    initializeNewPatient(); // Limpiar primero
    loadPatientDataToDOM(record.patient);

    // 2. Cargar Visitas
    $("#visitsContainer").innerHTML = '';
    
    (record.visits || []).forEach(vData => {
        const card = createVisitCard(vData.type || 'Sucesiva');
        
        // Restaurar valores
        card.querySelector('.visit-date').value = vData.date || '';
        card.querySelector('.txt-motivo').value = vData.motivo || '';
        card.querySelector('.txt-ea').value = vData.ea || '';
        
        card.querySelector('.txt-antecedentes-personales').value = vData.ant_pers || '';
        card.querySelector('.txt-antecedentes-familiares').value = vData.ant_fam || '';
        
        card.querySelector('.txt-exam-cara').value = vData.ex_cara || '';
        card.querySelector('.txt-exam-oido-derecho').value = vData.ex_od || '';
        card.querySelector('.txt-exam-oido-izquierdo').value = vData.ex_oi || '';
        card.querySelector('.txt-exam-nariz').value = vData.ex_nariz || '';
        card.querySelector('.txt-exam-orofaringe').value = vData.ex_oro || '';
        card.querySelector('.txt-exam-cuello').value = vData.ex_cuello || '';
        
        card.querySelector('.txt-dx').value = vData.dx || '';
        card.querySelector('.txt-recipe').value = vData.recipe || '';
        card.querySelector('.txt-indicaciones').value = vData.indicaciones || '';
        card.querySelector('.txt-plan').value = vData.plan || '';
        
        // Agregar al contenedor
        $("#visitsContainer").appendChild(card);
    });

    closeSearchModal();
    flash(`Paciente cargado: ${record.patient.primer_nombre} ${record.patient.primer_apellido}`);
}

// --- LÓGICA DE BÚSQUEDA ---
function openSearchModal() {
    $("#searchModal").classList.add('active');
    $("#searchValue").value = '';
    $("#searchValue").focus();
    $("#searchResultsList").innerHTML = '';
}

function closeSearchModal() {
    $("#searchModal").classList.remove('active');
}

function executeSearch() {
    const query = $("#searchValue").value.toLowerCase().trim();
    if (!query) return;

    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const resultsContainer = $("#searchResultsList");
    resultsContainer.innerHTML = '';

    const matches = Object.values(db).filter(record => {
        const p = record.patient;
        const fullName = `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase();
        const doc = p.documento_numero.toLowerCase();
        return fullName.includes(query) || doc.includes(query);
    });

    if (matches.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:10px; color:#ccc;">No se encontraron resultados.</div>';
        return;
    }

    matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        div.style.cursor = "pointer";
        div.innerHTML = `
            <div style="font-weight:bold; color:#60a5fa">${match.patient.primer_nombre} ${match.patient.primer_apellido}</div>
            <div style="font-size:0.8em; color:#ccc">ID: ${match.patient.documento_numero} | Última: ${fmtDate(match.lastUpdated)}</div>
        `;
        div.addEventListener('click', () => {
            loadHistory(match.patient.documento_numero);
        });
        resultsContainer.appendChild(div);
    });
}

// --- PREVIEW HELPERS ---
function closePreview() {
    $("#previewBar").classList.add('hidden');
    $("#previewShell").classList.add('hidden');
    STATE.currentPreviewDoc = null;
    STATE.currentPreviewCard = null;
}

function refreshPreview() {
    if (STATE.currentPreviewDoc && STATE.currentPreviewCard) {
        const html = STATE.currentPreviewDoc === 'INF' 
            ? buildReportHTML(STATE.currentPreviewCard) 
            : buildRecipeHTML(STATE.currentPreviewCard);
        $("#docPreview").innerHTML = html;
        flash('Vista previa actualizada');
    }
}

// Función global openDoc
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;

    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.currentShareCard = card;

    const html = kind === 'INF' ? buildReportHTML(card) : buildRecipeHTML(card);
    
    $("#previewBar").classList.remove('hidden');
    $("#previewShell").classList.remove('hidden');
    $("#docPreview").innerHTML = html;
    
    const zoom = STATE.currentUser?.preferences?.default_zoom || 60;
    $("#docPreview").style.transform = `scale(${zoom / 100})`;
    $("#zoomRange").value = zoom;
    $("#zoomVal").textContent = zoom + '%';
};
