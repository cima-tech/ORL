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

// ==========================================
// CENTRALIZACIÓN DE ESTILOS (AQUÍ EDITAS EL DISEÑO)
// ==========================================
function getDocStyles(type) {
    // Obtenemos los márgenes del usuario o defaults
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
                /* APLICAMOS LOS MÁRGENES DEL USUARIO AQUÍ */
                padding: ${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm; 
                box-sizing: border-box;
            }
            .doc-header-img { margin-bottom: 10px; text-align: center; }
            .doc-header-img img { max-height: 120px; object-fit: contain; }
            
            .doc-footer-img { margin-top: auto; text-align: center; }
            .doc-footer-img img { max-height: 80px; object-fit: contain; }

            .doc-title-block { text-align: center; margin-bottom: 25px; }
            .doc-title-main { font-size: 1.4rem; font-weight: 700; text-transform: uppercase; margin: 0; line-height: 1.2; }
            .doc-title-sub { font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; color: #444; margin-top: 2px; }

            .doc-patient-block { 
                border-bottom: 2px solid #000; 
                padding-bottom: 5px; 
                margin-bottom: 15px; 
                font-weight: 600; 
                font-size: 1.1rem;
                display: flex; justify-content: space-between; align-items: flex-end;
            }
            .doc-date { font-size: 0.9rem; font-weight: normal; }

            .doc-body { 
                flex: 1; 
                font-size: 16px; /* Tamaño base editable via botones A+/A- */
                line-height: 1.4; 
                text-align: justify;
                outline: none;
            }
            
            .doc-section { margin-bottom: 15px; }
            .doc-section strong { font-weight: 700; text-transform: uppercase; font-size: 0.95em; }

            .doc-signature-block { 
                margin-top: 20px; 
                display: flex; 
                justify-content: center; 
                gap: 20px; 
                align-items: flex-end; 
                min-height: 100px; 
                text-align: center;
                font-size: 0.85rem;
                page-break-inside: avoid;
            }
            .sign-line { border-top: 1px solid #000; width: 220px; margin: 5px auto 2px; }
        </style>
    `;
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
    
    // LOGICA: Si ambos están vacíos, devuelve string vacío.
    const drSpec = profDetails.specialty || prof.title_line_1 || ""; 
    
    const drInst = user.institution?.name || "";
    const drCode = (profDetails.license_number) ? `MPPS: ${profDetails.license_number}` : "";

    const headerImg = assets.header_path ? `<img src="${assets.header_path}">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}">` : '';
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
        examHTML = '<div class="doc-section"><strong>Examen Físico:</strong><br>';
        for (const [k, v] of Object.entries(examMap)) { if (v && v.trim()) examHTML += `&bull; <strong>${k}:</strong> ${v}<br>`; }
        examHTML += '</div>';
    }

    let studiesHTML = '';
    card.querySelectorAll('.study-content').forEach(s => {
        const name = s.querySelector('div[style*="font-weight: 700"]')?.textContent || '';
        const res = s.querySelector('textarea')?.value || '';
        if (res) studiesHTML += `<div><strong>${name}:</strong> ${res}</div>`;
    });
    if (studiesHTML) studiesHTML = `<div class="doc-section"><strong>Estudios Realizados:</strong><br>${studiesHTML}</div>`;

    const dx = (card.querySelector('.txt-dx')?.value || '').trim();
    const plan = (card.querySelector('.txt-plan')?.value || '').trim();

    // AQUI SE INYECTA EL CSS
    return `<div class="doc-page doc-letter">
        ${getDocStyles('vertical')}
        <div class="doc-container">
            <div class="doc-header-img">${d.headerImg}</div>
            
            <div class="doc-title-block">
                <h2 class="doc-title-main">INFORME MÉDICO</h2>
                ${d.drSpec ? `<div class="doc-title-sub">${d.drSpec}</div>` : ''}
            </div>

            <div class="doc-patient-block">
                <div>PACIENTE: ${d.pNombre} <span style="font-weight:400; font-size:0.9em; margin-left:10px;">(ID: ${d.doc})</span></div>
                <div class="doc-date">Caracas, ${fmtDate(d.dateISO)}</div>
            </div>

            <div class="doc-body" contenteditable="true">
                ${ea ? `<div class="doc-section"><strong>Enfermedad Actual:</strong><br>${ea}</div>` : ''}
                ${motivo ? `<div class="doc-section"><strong>Motivo:</strong> ${motivo}</div>` : ''}
                ${antPers ? `<div class="doc-section"><strong>A. Personales:</strong> ${antPers}</div>` : ''}
                ${antFam ? `<div class="doc-section"><strong>A. Familiares:</strong> ${antFam}</div>` : ''}
                ${examHTML}
                ${studiesHTML}
                ${dx ? `<div class="doc-section"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
                ${plan ? `<div class="doc-section"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
            </div>

            <div class="doc-signature-block">
                <div>
                    ${d.signImg}<br>
                    <div class="sign-line"></div>
                    <strong>${d.drName}</strong><br>
                    ${d.drSpec}<br>
                    ${d.drInst}
                </div>
                ${d.stampImg ? `<div>${d.stampImg}</div>` : ''}
            </div>

            <div class="doc-footer-img">${d.footerImg}</div>
        </div>
    </div>`;
}

export function buildRecipeHTML(card) {
    const d = getCommonData(card);
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    // CSS Específico para landscape si se desea, por ahora reutilizamos getDocStyles('horizontal')
    const styles = getDocStyles('horizontal');

    // Bloque de firma reutilizable
    const firmaBlock = `
        <div style="margin-top:auto; text-align:center; font-size:0.75rem; position:relative; min-height:80px;">
            ${d.signImg ? `<img src="${STATE.currentUser.assets.signature_path}" style="position:absolute; bottom:30px; left:50%; transform:translateX(-50%); width:120px;">` : ''}
            <div style="border-top:1px solid #000; width:180px; margin:40px auto 2px;"></div>
            <strong>${d.drName}</strong><br>${d.drCode}
        </div>`;

    return `<div class="doc-page doc-letter land">
        ${styles}
        <style>
            /* Estilos extra específicos para el récipe de 2 columnas */
            .recipe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; height: 100%; }
            .recipe-col { display: flex; flex-direction: column; height: 100%; border-right: 1px dashed #ccc; padding-right: 20px; }
            .recipe-col:last-child { border-right: none; padding-right: 0; padding-left: 20px; }
            .rp-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; margin-bottom: 10px; align-items: flex-end; }
            .rp-title { font-size: 1.5rem; font-weight: bold; font-family: serif; }
        </style>

        <div class="doc-container">
            <div class="recipe-grid">
                <div class="recipe-col">
                    <div class="doc-header-img">${d.headerImg}</div>
                    <div class="rp-header">
                        <span class="rp-title">Rp.</span>
                        <span>${fmtDate(d.dateISO)}</span>
                    </div>
                    <div style="margin-bottom:15px;"><b>Paciente:</b> ${d.pNombre} <br><b>ID:</b> ${d.doc}</div>
                    
                    <div class="doc-body" contenteditable="true" style="white-space:pre-line;">${recipe}</div>
                    
                    ${firmaBlock}
                    <div class="doc-footer-img">${d.footerImg}</div>
                </div>

                <div class="recipe-col">
                    <div class="doc-header-img">${d.headerImg}</div>
                    <div class="rp-header">
                        <span class="rp-title">Indicaciones</span>
                        <span>${fmtDate(d.dateISO)}</span>
                    </div>
                    <div style="margin-bottom:15px;"><b>Paciente:</b> ${d.pNombre}</div>
                    
                    <div class="doc-body" contenteditable="true" style="white-space:pre-line;">${indicaciones}</div>
                    
                    ${firmaBlock}
                    <div class="doc-footer-img">${d.footerImg}</div>
                </div>
            </div>
        </div>
    </div>`;
}
