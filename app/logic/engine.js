// app/logic/engine.js

import { $, $$, flash, showErr, STATE } from 'brain';
import { initializeNewPatient, getPatientData, loadPatientDataToDOM } from 'patient';
import { createVisitCard } from 'consult'; 

const STORAGE_KEY = 'CIMA_DB_ORL_V2';

// --- DATA LOGIC ---

export function saveCurrentHistory() {
    const patientData = getPatientData();
    if (!patientData.documento_numero || !patientData.primer_nombre) { 
        showErr('Datos incompletos.'); 
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

    const fullRecord = { patient: patientData, visits: visits, lastUpdated: new Date().toISOString() };
    try {
        let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        db[patientData.documento_numero] = fullRecord;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        flash('Guardado OK');
    } catch (e) { showErr('Error almacenamiento'); }
}

export function loadHistoryRecord(record) {
    resetStory(); // Limpieza interna
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
}

export function getSearchResults(query) {
    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.values(db).filter(r => {
        const p = r.patient;
        return `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase().includes(query) || p.documento_numero.includes(query);
    });
}

export function handleAddConsulta() {
    if (!$("#primer_nombre")?.value) {
        showErr('Ingrese nombre paciente');
        return;
    }
    const container = $("#visitsContainer");
    const existingCards = container.querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    const newCard = createVisitCard(type);
    
    if (type === 'Sucesiva' && existingCards.length > 0) {
        const lastCard = existingCards[0];
        ['.txt-antecedentes-personales', '.txt-antecedentes-familiares'].forEach(sel => {
            const s = lastCard.querySelector(sel); const t = newCard.querySelector(sel);
            if(s && t) t.value = s.value;
        });
        flash('Consulta sucesiva (Heredada)');
    } else {
        flash('Primera consulta');
    }
    container.insertBefore(newCard, container.firstChild);
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function resetStory() {
    initializeNewPatient();
    $("#visitsContainer").innerHTML = '';
    STATE.visitIdCounter = 0;
    STATE.currentPreviewCard = null;
}
