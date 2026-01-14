import { $, STATE, fmtDateTime } from '../../../../../logic/brain.js';
import { CIMA_DATA } from './data.js';

export function buildReportHTML(card) {
    // 1. Recolección de Datos de la Visita (Data Binding)
    const dateVal = card.querySelector('.visit-date').value;
    const ea = (card.querySelector('.txt-ea')?.value || '').trim();
    const motivo = (card.querySelector('.txt-motivo')?.value || '').trim();
    const antPers = (card.querySelector('.txt-antecedentes-personales')?.value || '').trim();
    const antFam = (card.querySelector('.txt-antecedentes-familiares')?.value || '').trim();
    
    // 2. Examen Físico (Recolección Exhaustiva)
    // Mapeamos cada área del examen físico a su input correspondiente
    const examMap = {
        'Cara': card.querySelector('.txt-exam-cara')?.value,
        'Oído Derecho': card.querySelector('.txt-exam-oido-derecho')?.value,
        'Oído Izquierdo': card.querySelector('.txt-exam-oido-izquierdo')?.value,
        'Nariz': card.querySelector('.txt-exam-nariz')?.value,
        'Orofaringe': card.querySelector('.txt-exam-orofaringe')?.value,
        'Cuello': card.querySelector('.txt-exam-cuello')?.value
    };

    let examFisicoHTML = '';
    // Solo renderizamos la sección si existe al menos un campo con datos
    const hasExam = Object.values(examMap).some(val => val && val.trim().length > 0);
    
    if (hasExam) {
        examFisicoHTML = '<div style="margin-bottom: 20px;"><strong>Examen Físico:</strong><br>';
        for (const [area, val] of Object.entries(examMap)) {
            if (val && val.trim()) {
                // Formato de lista para legibilidad
                examFisicoHTML += `&bull; <strong>${area}:</strong> ${val}<br>`;
            }
        }
        examFisicoHTML += '</div>';
    }
  
    // 3. Estudios (Integración de Chips + Textareas Libres)
    let estudiosHTML = '';
    
    // A. Estudios generados dinámicamente desde Chips (buscamos por clase .study-content)
    card.querySelectorAll('.study-content').forEach(study => {
        // El título está en un div con font-weight 700 (ver data.js)
        const studyName = study.querySelector('div[style*="font-weight: 700"]')?.textContent || '';
        const studyConclusion = study.querySelector('textarea')?.value || '';
        
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });

    // B. Estudios Adicionales (que siempre están visibles como textareas al final)
    CIMA_DATA.ADDITIONAL_STUDIES.forEach(studyName => {
        // Reconstruimos el selector de clase basado en el nombre (ej: .txt-study-audiometría)
        const inputClass = `.txt-study-${studyName.toLowerCase().replace(/ /g, '-')}`;
        const studyConclusion = card.querySelector(inputClass)?.value || '';
        
        if (studyConclusion) {
            estudiosHTML += `<div><strong>${studyName}:</strong> ${studyConclusion}</div>`;
        }
    });

    // 4. Diagnóstico y Plan
    const dx = (card.querySelector('.txt-dx')?.value || '').trim();
    const plan = (card.querySelector('.txt-plan')?.value || '').trim();
  
    // 5. Construcción de Datos del Paciente (Header del Documento)
    // Usamos selectores globales porque estos datos están en el encabezado general, no en la tarjeta
    const primerNombre = $("#primer_nombre")?.value || '';
    const segundoNombre = $("#segundo_nombre")?.value || '';
    const primerApellido = $("#primer_apellido")?.value || '';
    const segundoApellido = $("#segundo_apellido")?.value || '';

    const pNombre = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
    const pDoc = $("#documento_numero")?.value || '—';
    const pEdad = $("#edad_auto")?.value || '—';
    const pGenero = $("#genero")?.value || '—';

    const patientInfo = `
        <div style="font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
        PACIENTE: ${pNombre || '—'} <br>
        <span style="font-weight: 400; font-size: 0.9em; color: #334155;">
            ID: ${pDoc} &nbsp;|&nbsp; 
            Edad: ${pEdad} años &nbsp;|&nbsp; 
            Género: ${pGenero}
        </span>
        </div>
    `;

    // 6. Datos del Médico (Dinámicos desde user.json cargado en STATE)
    const dr = STATE.currentUser?.profile || {};
    
    // Lógica de Firma Digital (Si está activa en STATE)
    let firmaHTML = '';
    if (STATE.USE_SIG && STATE.currentUser?.assets?.signature_path) {
        // Nota: Asumimos que la imagen está accesible. En producción, esto podría ser Base64.
        // Por ahora usamos el texto configurado como fallback elegante
    }
    
    const footerHTML = `
        <div style="margin-top: 60px; text-align: center; page-break-inside: avoid;">
            <div style="border-top: 1px solid #000; width: 200px; margin: 40px auto 10px;"></div>
            <div style="font-weight:bold; font-size: 14px;">${dr.name || 'Médico Tratante'}</div>
            <div style="font-size: 12px; color: #666;">${dr.title_line_1 || ''}</div>
            <div style="font-size: 11px; color: #666;">${dr.title_line_2 || ''}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top:5px;">Generado el ${fmtDateTime(new Date().toISOString())}</div>
        </div>
    `;
  
    // 7. Retorno del HTML Final
    // Estructura: .doc-page > .doc-wrap (padding) > Contenido
    return `
        <div class="doc-page doc-letter">
        <div class="doc-wrap">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b82f6; margin: 0; font-size: 24px;">INFORME MÉDICO</h1>
                <div style="color: #94a3b8; font-size: 0.8em; letter-spacing: 2px; text-transform: uppercase;">
                    ${dr.title_line_1 || 'OTORRINOLARINGOLOGÍA'}
                </div>
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
            
            ${dx ? `<div style="margin-bottom: 20px; background: #f0f9ff; padding: 10px; border-left: 4px solid #3b82f6; border-radius: 0 4px 4px 0;"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
            
            ${plan ? `<div style="margin-bottom: 20px;"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
            
            ${footerHTML}
        </div>
        </div>
    `;
}