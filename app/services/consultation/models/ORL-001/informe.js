// CORRECCIÓN: Imports limpios
import { $, STATE, fmtDateTime } from 'brain';
import { CIMA_DATA } from 'data';

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
    // Estudios desde Chips (Estructura dinámica del DOM)
    card.querySelectorAll('.study-content').forEach(study => {
        const studyName = study.querySelector('div[style*="font-weight: 700"]')?.textContent || '';
        const studyConclusion = study.querySelector('textarea')?.value || '';
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });
    // Estudios Adicionales (Texto plano)
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

    // 5. Datos del Médico (Desde STATE, no hardcoded)
    const dr = STATE.currentUser?.profile || {};
    const footerHTML = `
        <div style="margin-top: 60px; text-align: center; page-break-inside: avoid;">
            <div style="border-top: 1px solid #000; width: 200px; margin: 40px auto 10px;"></div>
            <div style="font-weight:bold;">${dr.name || 'Médico Tratante'}</div>
            <div style="font-size: 12px; color: #666;">${dr.specialty || 'Especialidad'}</div>
            <div style="font-size: 11px; color: #666;">${dr.institution || ''}</div>
        </div>
    `;
  
    // 6. Ensamblaje Final del HTML
    // Usamos las clases css .doc-page y .doc-letter definidas en main.css
    return `
        <div class="doc-page doc-letter">
        <div class="doc-wrap">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b82f6; margin: 0;">INFORME MÉDICO</h1>
                <div style="color: #94a3b8; font-size: 0.8em; letter-spacing: 2px;">OTORRINOLARINGOLOGÍA</div>
            </div>
            
            ${patientInfo}
            
            <div style="margin-bottom: 20px; text-align: right; font-size: 0.9em; color: #666;">
                <strong>Caracas, ${fmtDateTime(dateVal)}</strong>
            </div>
            
            ${ea ? `<div style="margin-bottom: 15px;"><strong>Enfermedad Actual:</strong><br>${ea}</div>` : ''}
            ${motivo ? `<div style="margin-bottom: 15px;"><strong>Motivo de Consulta:</strong> ${motivo}</div>` : ''}
            ${antPers ? `<div style="margin-bottom: 15px;"><strong>Antecedentes Personales:</strong> ${antPers}</div>` : ''}
            ${antFam ? `<div style="margin-bottom: 15px;"><strong>Antecedentes Familiares:</strong> ${antFam}</div>` : ''}
            
            ${examFisicoHTML}
            
            ${estudiosHTML ? `<div style="margin-bottom: 20px;"><strong>Estudios Realizados:</strong><br>${estudiosHTML}</div>` : ''}
            
            ${dx ? `<div style="margin-bottom: 20px; background: #f0f9ff; padding: 10px; border-left: 4px solid #3b82f6;"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
            
            ${plan ? `<div style="margin-bottom: 20px;"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
            
            ${footerHTML}
        </div>
        </div>
    `;
}
