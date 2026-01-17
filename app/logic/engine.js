// app/logic/engine.js

import { $, $$, flash, showErr, STATE } from 'brain';
import { ServiceLoader } from './service_loader.js'; // <--- ÚNICO IMPORT DE LÓGICA

const STORAGE_KEY = 'CIMA_DB_ORL_V2';

export function saveCurrentHistory() {
    // Obtenemos el servicio de paciente cargado dinámicamente
    const PatientService = ServiceLoader.get('patient');
    
    const patientData = PatientService.getPatientData();
    if (!patientData.documento_numero || !patientData.primer_nombre) { 
        showErr('Faltan datos obligatorios (Doc o Nombre).'); return false; 
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
        flash('Historia guardada exitosamente.');
        return true;
    } catch (e) { 
        showErr('Error crítico: Almacenamiento local lleno.'); return false;
    }
}

export function loadHistoryRecord(record) {
    const PatientService = ServiceLoader.get('patient');
    const ConsultService = ServiceLoader.get('consult');

    resetStory(); 
    PatientService.loadPatientDataToDOM(record.patient); 

    const container = $("#visitsContainer");
    container.classList.remove('hidden');

    [...(record.visits || [])].reverse().forEach(v => {
        const card = ConsultService.createVisitCard(v.type || 'Sucesiva');
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
    
    STATE.UI.isStoryOpen = true; 
    flash('Historia cargada.');
}

export function handleAddConsulta() {
    if(!STATE.UI.isStoryOpen) return;

    if (!$("#primer_nombre")?.value) {
        showErr('Ingrese el nombre del paciente primero.');
        const input = $("#primer_nombre");
        if(input) { input.focus(); input.classList.add('input-error'); setTimeout(()=>input.classList.remove('input-error'), 500); }
        return;
    }

    // Obtenemos la fábrica del modelo actual
    const ConsultService = ServiceLoader.get('consult'); 
    
    const container = $("#visitsContainer");
    container.classList.remove('hidden');

    const existingCards = container.querySelectorAll('.visit-card');
    const type = existingCards.length === 0 ? 'Primera' : 'Sucesiva';
    
    const newCard = ConsultService.createVisitCard(type);
    
    // LÓGICA DE HERENCIA MEJORADA
    if (type === 'Primera') {
        // Heredar de la FICHA (Patient Form) a la 1ra consulta
        const antPersFicha = $("#antecedentes_personales")?.value || "";
        const antFamFicha = $("#antecedentes_familiares")?.value || "";
        
        const targetPers = newCard.querySelector('.txt-antecedentes-personales');
        const targetFam = newCard.querySelector('.txt-antecedentes-familiares');
        
        if(targetPers) targetPers.value = antPersFicha;
        if(targetFam) targetFam.value = antFamFicha;
        
        flash('Primera consulta (Datos heredados de ficha)');

    } else if (type === 'Sucesiva' && existingCards.length > 0) {
        // Heredar de la ANTERIOR consulta
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
        
        flash('Consulta sucesiva (Datos heredados de anterior)');
    }

    container.insertBefore(newCard, container.firstChild);
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function resetStory() {
    // Usamos el servicio dinámico para reiniciar la ficha
    const PatientService = ServiceLoader.get('patient');
    PatientService.initializeNewPatient();
    
    const container = $("#visitsContainer");
    if(container) {
        container.innerHTML = '';
        container.classList.add('hidden');
    }
    
    STATE.visitIdCounter = 0;
    STATE.currentPreviewCard = null;
    STATE.currentPreviewDoc = null;
    
    STATE.UI.isStoryOpen = false;
    STATE.UI.isPreviewMode = false;
}

export function getSearchResults(query) {
    let db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    query = query.toLowerCase().trim();
    return Object.values(db).filter(r => {
        const p = r.patient;
        return `${p.primer_nombre} ${p.primer_apellido}`.toLowerCase().includes(query) || p.documento_numero.includes(query);
    });
}
