// app/services/consultation/models/ORL-001/export.js

import { $, flash, showErr, fmtDate, STATE } from 'brain';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';

export async function exportToPNG() {
    // Verificaciones de seguridad
    if (!STATE.currentPreviewDoc || !STATE.currentPreviewCard) {
        showErr('Error: No hay documento generado para exportar.');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        showErr('Error crítico: Librería html2canvas no cargada.');
        return;
    }

    try {
        flash("Generando imagen de alta resolución...", false);

        // 1. Reconstruir el HTML limpio (sin inputs de edición) para la "foto"
        // Esto es clave: usamos el generador original, no el div editable del DOM
        const html = STATE.currentPreviewDoc === 'INF' 
            ? buildReportHTML(STATE.currentPreviewCard) 
            : buildRecipeHTML(STATE.currentPreviewCard);

        // 2. Crear contenedor temporal fuera de pantalla (Invisible)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0px';
        // Importante: asegurar que el div tenga el ancho correcto para que no se deforme
        const isLand = STATE.currentPreviewDoc === 'RP';
        tempDiv.style.width = isLand ? '1056px' : '816px'; 
        
        document.body.appendChild(tempDiv);

        // 3. Renderizar con html2canvas
        const docPage = tempDiv.querySelector('.doc-page');
        
        // Configuración para máxima calidad
        const canvas = await html2canvas(docPage, {
            scale: 2, // 2x para Retina/Impresión nítida
            useCORS: true, // Permitir imágenes externas si el servidor lo soporta
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // 4. Limpieza del DOM
        document.body.removeChild(tempDiv);

        // 5. Obtener nombre del archivo (Desde STATE o generar fallback)
        let filename = STATE.exportFilename;
        if (!filename) {
            const idPac = $("#documento_numero")?.value || 'paciente';
            const tipo = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
            filename = `CIMA_${idPac}_${tipo}.png`;
        }

        // 6. Descarga Blob
        canvas.toBlob(blob => {
            if (!blob) { throw new Error("Falló la generación del blob de imagen."); }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            flash(`Documento descargado: ${filename}`);
        }, 'image/png');

    } catch (err) {
        showErr('Error exportando: ' + err.message);
        console.error(err);
    }
}

export function shareViaWhatsApp() {
    const card = STATE.currentShareCard || STATE.currentPreviewCard;
    if (!card) { showErr('No hay consulta seleccionada'); return; }

    const phoneInput = $("#tel_principal");
    const phoneVal = phoneInput ? phoneInput.value : '';
    
    // Limpieza agresiva del teléfono (solo dejar números)
    const phoneClean = phoneVal.replace(/\D/g, '');
    
    const pNombre = $("#primer_nombre")?.value || 'Paciente';
    const fecha = fmtDate(card.querySelector('.visit-date')?.value);
    const docName = STATE.currentUser?.profile?.name || 'Su Doctor';
    
    // Mensaje pre-formateado
    const mensaje = `Hola ${pNombre}, le envío los documentos de su consulta médica del día ${fecha}.\n\nAtte. ${docName}`;
    
    if (phoneClean && phoneClean.length > 9) { // Validación mínima de longitud
        const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    } else {
        showErr('El paciente no tiene un número celular válido registrado (+58...).');
    }
}
