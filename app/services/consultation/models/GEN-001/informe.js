// CORRECCIÓN: Imports limpios
import { $, STATE, fmtDateTime } from 'brain';
// CORRECCIÓN: Import relativo
import { CIMA_DATA } from './consult.js';

export function buildReportHTML(card) {
    // 1. Recolección de Datos de la Visita
    const dateVal = card.querySelector('.visit-date').value;
    const ea = (card.querySelector('.txt-ea')?.value || '').trim();
    const motivo = (card.querySelector('.txt-motivo')?.value || '').trim();
    const antPers = (card.querySelector('.txt-antecedentes-personales')?.value || '').trim();
    const antFam = (card.querySelector('.txt-antecedentes-familiares')?.value || '').trim();
    
    // 2. Examen Físico (Mapeo Completo)
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
  
    // 3. Estudios (Chips + Texto)
    let estudiosHTML = '';
    // Estudios desde Chips
    card.querySelectorAll('.study-content').forEach(study => {
        const studyName = study.querySelector('div[style*="font-weight: 700"]')?.textContent || '';
        const studyConclusion = study.querySelector('textarea')?.value || '';
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });
    // Estudios Adicionales
    CIMA_DATA.ADDITIONAL_STUDIES.forEach(studyName => {
        const inputClass = `.txt-study-${studyName.toLowerCase().replace(/ /g, '-')}`;
        const studyConclusion = card.querySelector(inputClass)?.value || '';
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });

    const dx = (card.querySelector('.txt-dx')?.value || '').trim();
    const plan = (card.querySelector('.txt-plan')?.value || '').trim();
  
    // 4. Datos del Paciente (Header Dinámico)
    const pNombre = [
        $("#primer_nombre")?.value, $("#segundo_nombre")?.value,
        $("#primer_apellido")?.value, $("#segundo_apellido")?.value
    ].filter(Boolean).join(' ');

    const patientInfo = `
        <div style="font-weight: 600; margin-bottom: 10px; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
        PACIENTE: ${pNombre || '—'} <br>
        <span style="font-weight: 400; font-size: 0.9em;">
            ID: ${$("#documento_numero")?.value || '—'} · 
            Edad: ${$("#edad_auto")?.value || '—'} años · 
            Género: ${$("#genero")?.value || '—'}
        </span>
        </div>
    `;

    // 5. Configuración de Imágenes y Usuario (Fusionado)
    const dr = STATE.currentUser?.profile || {};
    const assets = STATE.currentUser?.assets || {};
    
    // Generación de etiquetas IMG solo si existen las rutas
    const headerImg = assets.header_path ? `<img src="${assets.header_path}" style="width:100%; max-height:150px; object-fit:contain;">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}" style="width:100%; max-height:100px; object-fit:contain;">` : '';
    const signImg = (STATE.USE_SIG && assets.signature_path) ? `<img src="${assets.signature_path}" style="width:150px;">` : '';
    const stampImg = (STATE.USE_SIG && assets.stamp_path) ? `<img src="${assets.stamp_path}" style="width:100px;">` : '';

    // 6. Ensamblaje Final del HTML
    return `
        <div class="doc-page doc-letter">
            <div class="doc-header" style="text-align:center; margin-bottom:20px;">${headerImg}</div>

            <div class="doc-wrap">
                <div style="text-align: center; margin-bottom: 30px;" contenteditable="true">
                    <h1 style="color: #3b82f6; margin: 0;">INFORME MÉDICO</h1>
                    <div style="color: #94a3b8; font-size: 0.8em; letter-spacing: 2px;">OTORRINOLARINGOLOGÍA</div>
                </div>
                
                ${patientInfo}
                
                <div style="margin-bottom: 20px; text-align: right; font-size: 0.9em; color: #666;">
                    <strong>Caracas, ${fmtDateTime(dateVal)}</strong>
                </div>
                
                <div class="doc-body" contenteditable="true" style="outline:none; min-height:300px;">
                    ${ea ? `<div style="margin-bottom: 15px;"><strong>Enfermedad Actual:</strong><br>${ea}</div>` : ''}
                    ${motivo ? `<div style="margin-bottom: 15px;"><strong>Motivo de Consulta:</strong> ${motivo}</div>` : ''}
                    ${antPers ? `<div style="margin-bottom: 15px;"><strong>Antecedentes Personales:</strong> ${antPers}</div>` : ''}
                    ${antFam ? `<div style="margin-bottom: 15px;"><strong>Antecedentes Familiares:</strong> ${antFam}</div>` : ''}
                    
                    ${examFisicoHTML}
                    
                    ${estudiosHTML ? `<div style="margin-bottom: 20px;"><strong>Estudios Realizados:</strong><br>${estudiosHTML}</div>` : ''}
                    
                    ${dx ? `<div style="margin-bottom: 20px; background: #f0f9ff; padding: 10px; border-left: 4px solid #3b82f6;"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
                    
                    ${plan ? `<div style="margin-bottom: 20px;"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
                </div>

                <div style="margin-top: 50px; display:flex; justify-content:center; gap:20px; align-items:flex-end;">
                    <div>${signImg}</div>
                    <div>${stampImg}</div>
                </div>
                
                <div style="text-align:center; font-size:0.8em; color:#666; margin-top:10px;">
                    <div style="border-top: 1px solid #000; width: 200px; margin: 10px auto 5px;"></div>
                    <strong>${dr.name || 'Médico Tratante'}</strong><br>
                    ${dr.specialty || 'Especialidad'}<br>
                    ${dr.institution || ''}
                </div>
            </div>

            <div class="doc-footer" style="position:absolute; bottom:0; left:0; width:100%; text-align:center;">${footerImg}</div>
        </div>
    `;
}
