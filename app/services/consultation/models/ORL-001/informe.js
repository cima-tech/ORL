import { $, STATE, fmtDateTime } from 'brain';
import { CIMA_DATA } from './consult.js';

export function buildReportHTML(card) {
    const dateVal = card.querySelector('.visit-date').value;
    const ea = (card.querySelector('.txt-ea')?.value || '').trim();
    const motivo = (card.querySelector('.txt-motivo')?.value || '').trim();
    const antPers = (card.querySelector('.txt-antecedentes-personales')?.value || '').trim();
    const antFam = (card.querySelector('.txt-antecedentes-familiares')?.value || '').trim();
    
    // Mapeo Examen Físico
    const examMap = {
        'Cara': card.querySelector('.txt-exam-cara')?.value,
        'Oído Derecho': card.querySelector('.txt-exam-oido-derecho')?.value,
        'Oído Izquierdo': card.querySelector('.txt-exam-oido-izquierdo')?.value,
        'Nariz': card.querySelector('.txt-exam-nariz')?.value,
        'Orofaringe': card.querySelector('.txt-exam-orofaringe')?.value,
        'Cuello': card.querySelector('.txt-exam-cuello')?.value
    };

    let examFisicoHTML = '';
    const hasExam = Object.values(examMap).some(val => val && val.trim().length > 0);
    
    if (hasExam) {
        examFisicoHTML = '<div style="margin-bottom: 20px;"><strong>Examen Físico:</strong><br>';
        for (const [area, val] of Object.entries(examMap)) {
            if (val && val.trim()) {
                examFisicoHTML += `&bull; <strong>${area}:</strong> ${val}<br>`;
            }
        }
        examFisicoHTML += '</div>';
    }
  
    // Estudios
    let estudiosHTML = '';
    card.querySelectorAll('.study-content').forEach(study => {
        const studyName = study.querySelector('div[style*="font-weight: 700"]')?.textContent || '';
        const studyConclusion = study.querySelector('textarea')?.value || '';
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });
    CIMA_DATA.ADDITIONAL_STUDIES.forEach(studyName => {
        const inputClass = `.txt-study-${studyName.toLowerCase().replace(/ /g, '-')}`;
        const studyConclusion = card.querySelector(inputClass)?.value || '';
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });

    const dx = (card.querySelector('.txt-dx')?.value || '').trim();
    const plan = (card.querySelector('.txt-plan')?.value || '').trim();
  
    const pNombre = [
        $("#primer_nombre")?.value, $("#segundo_nombre")?.value,
        $("#primer_apellido")?.value, $("#segundo_apellido")?.value
    ].filter(Boolean).join(' ');

    const patientInfo = `
        <div style="font-weight: 600; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px;">
        PACIENTE: ${pNombre || '—'} <br>
        <span style="font-weight: 400; font-size: 0.9em;">
            ID: ${$("#documento_numero")?.value || '—'} · 
            Edad: ${$("#edad_auto")?.value || '—'} años · 
            Género: ${$("#genero")?.value || '—'}
        </span>
        </div>
    `;

    // Configuración de Imágenes y Usuario
    const user = STATE.currentUser || {};
    const prof = user.profile || {};
    const profDetails = user.professional || {};
    const assets = user.assets || {};
    
    // Obtener datos del médico SIEMPRE del estado
    const drName = prof.name || `${prof.title} ${prof.firstname} ${prof.lastname}`;
    const drSpec = profDetails.specialty || prof.title_line_1 || "Otorrinolaringología";
    const drInst = user.institution?.name || "";
    
    const headerImg = assets.header_path ? `<img src="${assets.header_path}" style="width:100%; max-height:150px; object-fit:contain;">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}" style="width:100%; max-height:100px; object-fit:contain;">` : '';
    const signImg = (STATE.USE_SIG && assets.signature_path) ? `<img src="${assets.signature_path}" style="width:150px;">` : '';
    const stampImg = (STATE.USE_SIG && assets.stamp_path) ? `<img src="${assets.stamp_path}" style="width:100px;">` : '';

    return `
        <div class="doc-page doc-letter" style="color: #000; background: #fff;">
            <div class="doc-header" style="text-align:center; margin-bottom:20px;">${headerImg}</div>

            <div class="doc-wrap">
                <div style="text-align: center; margin-bottom: 30px;" contenteditable="true">
                    <h2 style="color: #000; margin: 0; font-size: 1.4rem; text-transform: uppercase;">Informe Médico</h2>
                    <div style="color: #333; font-size: 0.8em; letter-spacing: 2px; text-transform: uppercase;">${drSpec}</div>
                </div>
                
                ${patientInfo}
                
                <div style="margin-bottom: 20px; text-align: right; font-size: 0.9em; color: #000;">
                    <strong>Caracas, ${fmtDateTime(dateVal)}</strong>
                </div>
                
                <div class="doc-body" contenteditable="true" style="outline:none; min-height:300px; font-size: 1rem; line-height: 1.5;">
                    ${ea ? `<div style="margin-bottom: 15px;"><strong>Enfermedad Actual:</strong><br>${ea}</div>` : ''}
                    ${motivo ? `<div style="margin-bottom: 15px;"><strong>Motivo de Consulta:</strong> ${motivo}</div>` : ''}
                    ${antPers ? `<div style="margin-bottom: 15px;"><strong>Antecedentes Personales:</strong> ${antPers}</div>` : ''}
                    ${antFam ? `<div style="margin-bottom: 15px;"><strong>Antecedentes Familiares:</strong> ${antFam}</div>` : ''}
                    
                    ${examFisicoHTML}
                    
                    ${estudiosHTML ? `<div style="margin-bottom: 20px;"><strong>Estudios Realizados:</strong><br>${estudiosHTML}</div>` : ''}
                    
                    ${dx ? `<div style="margin-bottom: 20px; padding: 5px 0;"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
                    
                    ${plan ? `<div style="margin-bottom: 20px;"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
                </div>

                <div style="margin-top: 50px; display:flex; justify-content:center; gap:20px; align-items:flex-end; min-height: 100px;">
                    <div>${signImg}</div>
                    <div>${stampImg}</div>
                </div>
                
                <div style="text-align:center; font-size:0.8em; color:#000; margin-top:10px;">
                    <div style="border-top: 1px solid #000; width: 220px; margin: 10px auto 5px;"></div>
                    <strong>${drName}</strong><br>
                    ${drSpec}<br>
                    ${drInst}
                </div>
            </div>

            <div class="doc-footer" style="position:absolute; bottom:0; left:0; width:100%; text-align:center;">${footerImg}</div>
        </div>
    `;
}
