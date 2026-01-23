import { $, STATE, fmtDate, fmtDateTime } from 'brain';
import { CIMA_DATA } from './consult.js';

// --- LOGICA UI (DROPDOWNS) ---
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

// ==========================================
// CENTRALIZACIÓN DE ESTILOS
// ==========================================
function getDocStyles(type) {
    const docConfig = STATE.currentUser?.documents || {};
    const margins = type === 'vertical' 
        ? (docConfig.vertical?.content_margins_cm || {top:2, right:2, bottom:2, left:2})
        : (docConfig.horizontal?.content_margins_cm || {top:1, right:1, bottom:1, left:1});

    return `
        <style>
            .doc-container {
                font-family: 'Roboto Condensed', sans-serif !important;
                color: #000;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: ${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm; 
                box-sizing: border-box;
            }
            .doc-header-img { margin-bottom: 20px; text-align: center; }
            .doc-header-img img { max-width:100%; max-height: 120px; }
            
            .doc-footer-img { position:absolute; bottom:0; left:0; width:100%; text-align:center; }
            .doc-footer-img img { max-width:100%; max-height: 80px; }

            .doc-body { 
                flex: 1; 
                font-size: 16px; 
                line-height: 1.5; 
                outline: none;
            }
            
            .doc-signature { margin-top:40px; text-align:center; }
        </style>
    `;
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
    const drSpec = "Medicina General"; // Hardcoded for General Model, or fetch from config
    const headerImg = assets.header_path ? `<img src="${assets.header_path}">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}">` : '';
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
        ${getDocStyles('vertical')}
        <div class="doc-container">
            <div class="doc-header-img">${d.headerImg}</div>
            
            <h2 style="text-align:center; color:#000; margin:0 0 10px 0;">INFORME MÉDICO</h2>
            <div style="font-weight:600; margin-bottom:10px; border-bottom:2px solid #000;">PACIENTE: ${d.pNombre} (ID: ${d.doc})</div>
            <div style="text-align:right; margin-bottom:20px;">Fecha: ${fmtDateTime(d.dateISO)}</div>
            
            <div class="doc-body" contenteditable="true">
                ${ea ? `<p><strong>Enfermedad Actual:</strong> ${ea}</p>` : ''}
                ${examGeneral ? `<p><strong>Examen Físico:</strong> ${examGeneral}</p>` : ''}
                ${dx ? `<p><strong>Diagnóstico:</strong> ${dx}</p>` : ''}
                ${plan ? `<p><strong>Plan:</strong> ${plan}</p>` : ''}
            </div>
            
            <div class="doc-signature">
                <div>${d.signImg}</div>
                <div style="border-top:1px solid #000; width:200px; margin:5px auto;"></div>
                <strong>${d.drName}</strong><br>${d.drSpec}
            </div>
            
            <div class="doc-footer-img">${d.footerImg}</div>
        </div>
    </div>`;
}

export function buildRecipeHTML(card) {
    const d = getCommonData(card);
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    return `<div class="doc-page doc-letter land">
        ${getDocStyles('horizontal')}
        <style>.col-wrap { display:flex; flex-direction:column; padding:0 20px; height:100%; border-right:1px dashed #ccc; } .col-wrap:last-child { border:none; }</style>
        <div class="doc-container" style="display:grid; grid-template-columns:1fr 1fr;">
            <div class="col-wrap">
                <div class="doc-header-img">${d.headerImg}</div>
                <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; margin:10px 0;">
                    <span style="font-weight:bold; font-size:1.2rem;">Rp.</span><span>${fmtDate(d.dateISO)}</span>
                </div>
                <div style="margin-bottom:15px;"><b>Paciente:</b> ${d.pNombre}</div>
                <div class="doc-body" contenteditable="true" style="white-space:pre-line;">${recipe}</div>
                <div class="doc-signature">${d.signImg}<br><strong>${d.drName}</strong></div>
                <div class="doc-footer-img">${d.footerImg}</div>
            </div>
            <div class="col-wrap">
                <div class="doc-header-img">${d.headerImg}</div>
                <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; margin:10px 0;">
                    <span style="font-weight:bold; font-size:1.2rem;">Indicaciones</span><span>${fmtDate(d.dateISO)}</span>
                </div>
                <div style="margin-bottom:15px;"><b>Paciente:</b> ${d.pNombre}</div>
                <div class="doc-body" contenteditable="true" style="white-space:pre-line;">${indicaciones}</div>
                <div class="doc-signature">${d.signImg}<br><strong>${d.drName}</strong></div>
                <div class="doc-footer-img">${d.footerImg}</div>
            </div>
        </div>
    </div>`;
}
