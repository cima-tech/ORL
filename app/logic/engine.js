// app/logic/engine.js

import { $, $$, flash, showErr, STATE, fmtDate } from 'brain';
import { initializeNewPatient, getPatientData, loadPatientDataToDOM } from 'patient';
import { createVisitCard } from 'consult'; 
// Importar renderToolbar dinámicamente es complicado por ciclos. 
// Dejamos que Toolbar maneje la UI en su función executeSearch wrapper.

const STORAGE_KEY = 'CIMA_DB_ORL_V2';

// ... (saveCurrentHistory igual que antes) ...
export function saveCurrentHistory() {
    // ... codigo de guardado (copiar del anterior) ...
    const patientData = getPatientData();
    if (!patientData.documento_numero || !patientData.primer_nombre) { showErr('Faltan datos obligatorios (Doc o Nombre).'); return; }
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
    const fullRecord = { patient: patientData, visits: visits, lastUpdated: new Date().toISOString() };
    try {
        let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        db[patientData.documento_numero] = fullRecord;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        flash('Historia guardada exitosamente.');
    } catch (e) { showErr('Error crítico: Almacenamiento local lleno.'); console.error(e); }
}

export function loadHistoryRecord(record) {
    resetStory(); 
    loadPatientDataToDOM(record.patient);

    const container = $("#visitsContainer");
    
    [...(record.visits || [])].reverse().forEach(v => {
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
    
    // IMPORTANTE: Actualizar estado global
    STATE.UI.isStoryOpen = true;
    $("#patientForm").classList.remove('hidden');
    
    flash('Historia cargada.');
}

// ... (handleAddConsulta igual que antes) ...
export function handleAddConsulta() {
    if (!$("#primer_nombre")?.value) {
        showErr('Error: Ingrese el nombre del paciente primero.');
        const input = $("#primer_nombre");
        if(input) { input.focus(); input.classList.add('input-error'); setTimeout(()=>input.classList.remove('input-error'), 500); }
        return;
    }
    const container = $("#visitsContainer");
    const existingCards = container.querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    const newCard = createVisitCard(type);
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
        if (prevDx && targetDx) targetDx.value = prevDx + " (Control)";
        flash('Consulta sucesiva creada (Datos heredados)');
    } else {
        flash('Primera consulta creada');
    }
    container.insertBefore(newCard, container.firstChild);
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function resetStory() {
    initializeNewPatient();
    $("#visitsContainer").innerHTML = '';
    STATE.visitIdCounter = 0;
    STATE.currentPreviewCard = null;
    $("#previewBar")?.classList.add('hidden');
    $("#previewShell")?.classList.add('hidden');
    STATE.currentPreviewDoc = null;
    
    // IMPORTANTE
    STATE.UI.isStoryOpen = false;
}

// ... (executeSearch con corrección para llamar renderToolbar desde Toolbar.js) ...
// Search debe estar en engine, pero el evento click debe ser manejado por toolbar para redibujar
export function executeSearch() {
    const query = $("#searchValue")?.value.toLowerCase().trim();
    if (!query) return;

    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const list = $("#searchResultsList");
    list.innerHTML = '';

    const matches = Object.values(db).filter(r => {
        const p = r.patient;
        return `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase().includes(query) || p.documento_numero.includes(query);
    });

    if (matches.length === 0) { list.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-muted);">Sin resultados</div>'; return; }

    matches.forEach(m => {
        const div = document.createElement('div');
        div.className = "dropdown-item";
        div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        div.innerHTML = `
            <div style="color:var(--accent); font-weight:bold;">${m.patient.primer_nombre} ${m.patient.primer_apellido}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); width:100%; display:flex; justify-content:space-between;">
                <span>${m.patient.documento_tipo}-${m.patient.documento_numero}</span>
                <span>${fmtDate(m.lastUpdated)}</span>
            </div>
        `;
        // El onclick se asigna dinámicamente en Toolbar.js (executeSearch wrapper) o aquí si engine tuviera acceso a render
        // Para mantener engine puro, toolbar.js intercepta la llamada.
        // PERO, para simplificar, usaremos un custom event o dejaremos que toolbar sobreescriba esta funcion
        // En V4.0 dejamos que toolbar maneje la UI de search.
    });
    
    // NOTA: Para V4.0, la lógica de Búsqueda UI (pintar lista) la moveré a toolbar.js para que pueda llamar a renderToolbar()
    // Engine solo debería devolver los datos. Pero por compatibilidad con tu código actual, toolbar.js maneja la UI completa.
}
