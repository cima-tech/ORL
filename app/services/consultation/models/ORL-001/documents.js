import { $, STATE, fmtDate, fmtDateTime } from 'brain';
import { CIMA_DATA } from './consult.js';

// --- LOGICA DE UI (DROPDOWNS) ---
export function renderIndicacionesDropdowns(card) {
    const container = card.querySelector('.indicaciones-dropdowns');
    if (!container) return;
    container.innerHTML = ''; 

    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    if (activeChips.length === 0) {
        container.innerHTML = '<div style="color:#94a3b8; font-size:0.8em; padding:5px; font-style:italic;">Seleccione medicamentos arriba para ver opciones de dosis.</div>';
        return;
    }

    const medsByCategory = {};
    activeChips.forEach(chip => {
        const groupDiv = chip.closest('.recipe-chips-group');
        const category = groupDiv ? groupDiv.dataset.group : 'Otros';
        if (!medsByCategory[category]) medsByCategory[category] = [];
        medsByCategory[category].push(chip.textContent);
    });

    Object.entries(medsByCategory).forEach(([category, meds]) => {
        const options = CIMA_DATA.INDICACIONES_OPTIONS[category] || CIMA_DATA.INDICACIONES_OPTIONS["Otros"];
        meds.forEach(med => {
            const row = document.createElement('div');
            row.style.marginBottom = '8px'; row.style.borderBottom = '1px dashed rgba(255,255,255,0.1)'; row.style.paddingBottom = '5px';
            let optionsHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            row.innerHTML = `<div style="font-weight:600; font-size:0.85em; color:#60a5fa; margin-bottom:2px;">${med}</div>
                <select class="form-select indication-select" data-med="${med}" style="width:100%; font-size:0.8em;">${optionsHTML}<option value="custom">-- Escribir manual --</option></select>`;
            container.appendChild(row);
            row.querySelector('select').addEventListener('change', () => syncIndicacionesText(card));
        });
    });
    syncIndicacionesText(card);
}

function syncIndicacionesText(card) {
    const selects = card.querySelectorAll('.indication-select');
    let text = "";
    selects.forEach(sel => {
        const med = sel.dataset.med;
        const indicacion = sel.value === 'custom' ? '...' : sel.value;
        text += `• ${med}:\n  ${indicacion}\n\n`;
    });
    const txtInd = card.querySelector('.txt-indicaciones');
    if (txtInd && !txtInd.dataset.userEdited) {
        txtInd.value = text.trim();
        updatePlanTratamiento(card, txtInd.value);
    }
}

export function updateRecipeTextbox(card) {
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    const txtRecipe = card.querySelector('.txt-recipe');
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
        txtRecipe.value = Array.from(activeChips).map(c => c.textContent).join('\n');
    }
}

function updatePlanTratamiento(card, indicacionesText) {
    const txtPlan = card.querySelector('.txt-plan');
    if (!txtPlan || txtPlan.dataset.userEdited === '1') return;
    const contacto = "\n\nNOTA DE SEGURIDAD:\nAvisar eventualidad si persisten síntomas a pesar del Tratamiento indicado o empeoramiento de síntomas a los teléfonos de contacto o acudir a la Emergencia.";
    txtPlan.value = indicacionesText + contacto;
}

// --- GENERADORES HTML ---
function getCommonData(card) {
    const pNombre = [$("#primer_nombre")?.value, $("#segundo_nombre")?.value, $("#primer_apellido")?.value, $("#segundo_apellido")?.value].filter(Boolean).join(' ');
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const user = STATE.currentUser || {};
    const prof = user.profile || {};
    const profDetails = user.professional || {};
    const assets = user.assets || {};

    const drName = prof.name || `${prof.title} ${prof.firstname} ${prof.lastname}`;
    const drSpec = profDetails.specialty || prof.title_line_1 || "Otorrinolaringología";
    const drInst = user.institution?.name || "";
    const drCode = (profDetails.license_number) ? `MPPS: ${profDetails.license_number}` : "";

    const headerImg = assets.header_path ? `<img src="${assets.header_path}" style="width:100%; max-height:150px; object-fit:contain;">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}" style="width:100%; max-height:100px; object-fit:contain;">` : '';
    const signImg = (STATE.USE_SIG && assets.signature_path) ? `<img src="${assets.signature_path}" style="width:150px;">` : '';
    const stampImg = (STATE.USE_SIG && assets.stamp_path) ? `<img src="${assets.stamp_path}" style="width:100px;">` : '';

    return { pNombre, doc, dateISO, drName, drSpec, drInst, drCode, headerImg, footerImg, signImg, stampImg };
}

export function buildReportHTML(card) {
    const d = getCommonData(card);
    const ea = (card.querySelector('.txt-ea')?.value || '').trim();
    const motivo = (card.querySelector('.txt-motivo')?.value || '').trim();
    const antPers = (card.querySelector('.txt-antecedentes-personales')?.value || '').trim();
    const antFam = (card.querySelector('.txt-antecedentes-familiares')?.value || '').trim();
    
    const examMap = { 'Cara': card.querySelector('.txt-exam-cara')?.value, 'Oído Derecho': card.querySelector('.txt-exam-oido-derecho')?.value, 'Oído Izquierdo': card.querySelector('.txt-exam-oido-izquierdo')?.value, 'Nariz': card.querySelector('.txt-exam-nariz')?.value, 'Orofaringe': card.querySelector('.txt-exam-orofaringe')?.value, 'Cuello': card.querySelector('.txt-exam-cuello')?.value };
    let examHTML = '';
    if (Object.values(examMap).some(v => v && v.trim())) {
        examHTML = '<div style="margin-bottom: 20px;"><strong>Examen Físico:</strong><br>';
        for (const [k, v] of Object.entries(examMap)) { if (v && v.trim()) examHTML += `&bull; <strong>${k}:</strong> ${v}<br>`; }
        examHTML += '</div>';
    }

    let studiesHTML = '';
    card.querySelectorAll('.study-content').forEach(s => {
        const name = s.querySelector('div[style*="font-weight: 700"]')?.textContent || '';
        const res = s.querySelector('textarea')?.value || '';
        if (res) studiesHTML += `<div><strong>${name}:</strong> ${res}</div>`;
    });
    if (studiesHTML) studiesHTML = `<div style="margin-bottom: 20px;"><strong>Estudios Realizados:</strong><br>${studiesHTML}</div>`;

    const dx = (card.querySelector('.txt-dx')?.value || '').trim();
    const plan = (card.querySelector('.txt-plan')?.value || '').trim();

    return `<div class="doc-page doc-letter">
        <div class="doc-header" style="text-align:center; margin-bottom:20px;">${d.headerImg}</div>
        <div class="doc-wrap">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #000; margin: 0; font-size: 1.4rem; text-transform: uppercase;">Informe Médico</h2>
                <div style="color: #333; font-size: 0.8em; letter-spacing: 2px; text-transform: uppercase;">${d.drSpec}</div>
            </div>
            <div style="font-weight: 600; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px;">PACIENTE: ${d.pNombre || '—'} <br><span style="font-weight: 400; font-size: 0.9em;">ID: ${d.doc}</span></div>
            <div style="margin-bottom: 20px; text-align: right; font-size: 0.9em; color: #000;"><strong>Caracas, ${fmtDateTime(d.dateISO)}</strong></div>
            <div class="doc-body" contenteditable="true" style="outline:none; min-height:300px; font-size: 1rem; line-height: 1.5;">
                ${ea ? `<div style="margin-bottom: 15px;"><strong>Enfermedad Actual:</strong><br>${ea}</div>` : ''}
                ${motivo ? `<div style="margin-bottom: 15px;"><strong>Motivo:</strong> ${motivo}</div>` : ''}
                ${antPers ? `<div style="margin-bottom: 15px;"><strong>A. Personales:</strong> ${antPers}</div>` : ''}
                ${antFam ? `<div style="margin-bottom: 15px;"><strong>A. Familiares:</strong> ${antFam}</div>` : ''}
                ${examHTML}
                ${studiesHTML}
                ${dx ? `<div style="margin-bottom: 20px;"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
                ${plan ? `<div style="margin-bottom: 20px;"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
            <div style="margin-top: 50px; display:flex; justify-content:center; gap:20px; align-items:flex-end; min-height: 100px;">
                <div>${d.signImg}</div>
                <div>${d.stampImg}</div>
            </div>
            <div style="text-align:center; font-size:0.8em; color:#000; margin-top:10px;">
                <div style="border-top: 1px solid #000; width: 220px; margin: 10px auto 5px;"></div>
                <strong>${d.drName}</strong><br>${d.drSpec}<br>${d.drInst}
            </div>
        </div>
        <div class="doc-footer" style="position:absolute; bottom:0; left:0; width:100%; text-align:center;">${d.footerImg}</div>
    </div>`;
}

export function buildRecipeHTML(card) {
    const d = getCommonData(card);
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    const firmaBlock = `<div style="height:120px; position:relative; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; margin-top:auto;">
        ${d.signImg ? `<img src="${STATE.currentUser.assets.signature_path}" style="position:absolute; bottom:40px; width:140px;">` : ''}
        ${d.stampImg ? `<img src="${STATE.currentUser.assets.stamp_path}" style="position:absolute; bottom:40px; right:40px; width:90px;">` : ''}
        <div style="text-align:center; font-size:0.75rem; color:#000; line-height:1.2;"><div style="font-weight:bold; font-size:0.9rem; border-top:1px solid #000; padding-top:4px; width:220px; margin:0 auto 2px auto;">${d.drName}</div>${d.drSpec}<br><span style="font-size:0.7rem;">${d.drCode}</span></div></div>`;

    return `<div class="doc-page doc-letter land" style="padding:30px 40px; display:grid; grid-template-columns: 1fr 1fr; gap:50px;">
        <div style="display:flex; flex-direction:column; height:100%; border-right:1px dashed #cbd5e1; padding-right:25px;">
            <div style="text-align:center; margin-bottom:15px;">${d.headerImg}</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #333; margin-bottom:15px; padding-bottom:5px;"><div style="font-size:1.4rem; font-weight:bold; font-family:'Georgia', serif;">Rp.</div><div style="font-size:0.85rem;">${fmtDate(d.dateISO)}</div></div>
            <div style="font-size:0.95rem; margin-bottom:20px;"><b>Paciente:</b> ${d.pNombre} <br><b>ID:</b> ${d.doc}</div>
            <div contenteditable="true" style="flex:1; font-family:'Courier New', monospace; font-size:1.1rem; line-height:1.5; outline:none; white-space:pre-line;">${recipe}</div>
            ${firmaBlock}
            <div style="text-align:center; margin-top:10px;">${d.footerImg}</div>
        </div>
        <div style="display:flex; flex-direction:column; height:100%; padding-left:10px;">
            <div style="text-align:center; margin-bottom:15px;">${d.headerImg}</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #333; margin-bottom:15px; padding-bottom:5px;"><div style="font-size:1.4rem; font-weight:bold; font-family:'Georgia', serif;">Indicaciones</div><div style="font-size:0.85rem;">${fmtDate(d.dateISO)}</div></div>
            <div style="font-size:0.95rem; margin-bottom:20px;"><b>Paciente:</b> ${d.pNombre}</div>
            <div contenteditable="true" style="flex:1; font-family:'Segoe UI', sans-serif; font-size:1rem; line-height:1.4; outline:none; white-space:pre-line;">${indicaciones}</div>
            ${firmaBlock}
            <div style="text-align:center; margin-top:10px;">${d.footerImg}</div>
        </div>
    </div>`;
}
