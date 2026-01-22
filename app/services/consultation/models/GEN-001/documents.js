import { $, STATE, fmtDate, fmtDateTime } from 'brain';
import { CIMA_DATA } from './consult.js';

// --- LOGICA UI ---
export function renderIndicacionesDropdowns(card) {
    const container = card.querySelector('.indicaciones-dropdowns');
    if (!container) return;
    container.innerHTML = ''; 
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    if (activeChips.length === 0) return;

    const medsByCategory = {};
    activeChips.forEach(chip => {
        const groupDiv = chip.closest('.recipe-chips-group');
        const category = groupDiv ? groupDiv.dataset.group : 'Otros';
        if (!medsByCategory[category]) medsByCategory[category] = [];
        medsByCategory[category].push(chip.textContent);
    });

    Object.entries(medsByCategory).forEach(([category, meds]) => {
        const options = CIMA_DATA.INDICACIONES_OPTIONS[category] || ["Tomar según indicación médica."];
        meds.forEach(med => {
            const row = document.createElement('div');
            row.style.marginBottom = '5px';
            let optionsHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            row.innerHTML = `<div style="font-weight:600; font-size:0.85em; color:#10b981;">${med}</div>
                <select class="form-select indication-select" data-med="${med}" style="width:100%; font-size:0.8em;">${optionsHTML}<option value="custom">Manual</option></select>`;
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
        text += `• ${sel.dataset.med}: ${sel.value === 'custom' ? '...' : sel.value}\n`;
    });
    const txtInd = card.querySelector('.txt-indicaciones');
    if (txtInd && !txtInd.dataset.userEdited) txtInd.value = text.trim();
}

export function updateRecipeTextbox(card) {
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    const txtRecipe = card.querySelector('.txt-recipe');
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
        txtRecipe.value = Array.from(activeChips).map(c => c.textContent).join('\n');
    }
}

// --- BUILDERS HTML ---
function getCommonData(card) {
    const pNombre = [$("#primer_nombre")?.value, $("#primer_apellido")?.value].filter(Boolean).join(' ');
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const user = STATE.currentUser || {};
    const prof = user.profile || {};
    const assets = user.assets || {};

    const drName = prof.name || "Dr. Médico General";
    const drSpec = "Medicina General";
    const headerImg = assets.header_path ? `<img src="${assets.header_path}" style="width:100%; max-height:120px;">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}" style="width:100%; max-height:80px;">` : '';
    const signImg = (STATE.USE_SIG && assets.signature_path) ? `<img src="${assets.signature_path}" style="width:120px;">` : '';

    return { pNombre, doc, dateISO, drName, drSpec, headerImg, footerImg, signImg };
}

export function buildReportHTML(card) {
    const d = getCommonData(card);
    const ea = (card.querySelector('.txt-ea')?.value || '').trim();
    const dx = (card.querySelector('.txt-dx')?.value || '').trim();
    const plan = (card.querySelector('.txt-plan')?.value || '').trim();
    const examGeneral = (card.querySelector('.txt-exam-general')?.value || '').trim();

    return `<div class="doc-page doc-letter">
        <div class="doc-header" style="text-align:center; margin-bottom:20px;">${d.headerImg}</div>
        <div class="doc-wrap">
            <h2 style="text-align:center; color:#000;">INFORME MÉDICO</h2>
            <div style="font-weight:600; margin-bottom:10px; border-bottom:2px solid #000;">PACIENTE: ${d.pNombre} (ID: ${d.doc})</div>
            <div style="text-align:right; margin-bottom:20px;">Fecha: ${fmtDateTime(d.dateISO)}</div>
            <div class="doc-body" contenteditable="true" style="min-height:300px; font-size:1rem; line-height:1.5;">
                ${ea ? `<p><strong>Enfermedad Actual:</strong> ${ea}</p>` : ''}
                ${examGeneral ? `<p><strong>Examen Físico:</strong> ${examGeneral}</p>` : ''}
                ${dx ? `<p><strong>Diagnóstico:</strong> ${dx}</p>` : ''}
                ${plan ? `<p><strong>Plan:</strong> ${plan}</p>` : ''}
            </div>
            <div style="margin-top:40px; text-align:center;">
                <div>${d.signImg}</div>
                <div style="border-top:1px solid #000; width:200px; margin:5px auto;"></div>
                <strong>${d.drName}</strong><br>${d.drSpec}
            </div>
        </div>
        <div class="doc-footer" style="position:absolute; bottom:0; left:0; width:100%; text-align:center;">${d.footerImg}</div>
    </div>`;
}

export function buildRecipeHTML(card) {
    const d = getCommonData(card);
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    return `<div class="doc-page doc-letter land" style="padding:30px; display:grid; grid-template-columns: 1fr 1fr; gap:40px;">
        <div style="border-right:1px dashed #ccc; padding-right:20px; display:flex; flex-direction:column;">
            <div style="text-align:center;">${d.headerImg}</div>
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; margin:10px 0;">
                <span style="font-weight:bold; font-size:1.2rem;">Rp.</span><span>${fmtDate(d.dateISO)}</span>
            </div>
            <div style="margin-bottom:15px;"><b>Paciente:</b> ${d.pNombre}</div>
            <div contenteditable="true" style="flex:1; white-space:pre-line;">${recipe}</div>
            <div style="text-align:center; margin-top:20px;">${d.signImg}<br><strong>${d.drName}</strong></div>
            <div style="text-align:center; margin-top:10px;">${d.footerImg}</div>
        </div>
        <div style="padding-left:10px; display:flex; flex-direction:column;">
            <div style="text-align:center;">${d.headerImg}</div>
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; margin:10px 0;">
                <span style="font-weight:bold; font-size:1.2rem;">Indicaciones</span><span>${fmtDate(d.dateISO)}</span>
            </div>
            <div style="margin-bottom:15px;"><b>Paciente:</b> ${d.pNombre}</div>
            <div contenteditable="true" style="flex:1; white-space:pre-line;">${indicaciones}</div>
            <div style="text-align:center; margin-top:20px;">${d.signImg}<br><strong>${d.drName}</strong></div>
            <div style="text-align:center; margin-top:10px;">${d.footerImg}</div>
        </div>
    </div>`;
}
