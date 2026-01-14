// CORRECCIÓN: Imports limpios
import { $, flash, showErr, fmtDate, STATE } from 'brain';
import { buildReportHTML } from 'informe';
import { buildRecipeHTML } from 'recipe';

export async function exportToPNG() {
    if (!STATE.currentPreviewDoc || !STATE.currentPreviewCard) {
        showErr('Primero genera un preview (Informe o Récipe)');
        return;
    }

    try {
        // 1. Reconstruir el HTML limpio (sin inputs de edición) para la "foto"
        const html = STATE.currentPreviewDoc === 'INF' 
            ? buildReportHTML(STATE.currentPreviewCard) 
            : buildRecipeHTML(STATE.currentPreviewCard);

        // 2. Crear contenedor temporal fuera de pantalla
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0px';
        document.body.appendChild(tempDiv);

        // 3. Renderizar con html2canvas
        const docPage = tempDiv.querySelector('.doc-page');
        // Esperamos que html2canvas esté cargado globalmente en index.html
        if (typeof html2canvas === 'undefined') throw new Error("Librería gráfica no cargada");

        const canvas = await html2canvas(docPage, {
            scale: 2, // Alta resolución (Retina)
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // 4. Limpieza
        document.body.removeChild(tempDiv);

        // 5. Nombrado del Archivo
        const patientId = $("#documento_numero")?.value || 'Paciente';
        const dateObj = new Date(STATE.currentPreviewCard.querySelector('.visit-date').value);
        const ddmmyy = `${String(dateObj.getDate()).padStart(2, '0')}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getFullYear()).slice(-2)}`;
        const docType = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        const filename = `CIMA-${patientId}-${docType}-${ddmmyy}.png`;

        // 6. Descarga
        canvas.toBlob(blob => {
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

    const phone = $("#tel_principal")?.value || '';
    const pNombre = $("#primer_nombre")?.value || 'Paciente';
    const fecha = fmtDate(card.querySelector('.visit-date')?.value);
    
    // Mensaje pre-formateado
    const mensaje = `Hola ${pNombre}, adjunto enviamos los documentos de su consulta médica del día ${fecha}.\n\nAtte. ${STATE.currentUser?.profile?.name || 'Su Doctor'}`;
    
    // Limpiar teléfono (solo números)
    const phoneClean = phone.replace(/[^0-9]/g, '');
    
    if (phoneClean) {
        const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    } else {
        showErr('El paciente no tiene número telefónico registrado');
    }
}
