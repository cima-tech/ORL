import { $, flash, showErr, fmtDate } from '../../../../../logic/brain.js';
// Importamos los generadores de HTML para reconstruir el documento al momento de exportar
import { buildReportHTML } from './informe.js';
import { buildRecipeHTML } from './recipe-indicaciones.js';
// Importamos el estado global para saber qué documento se está previsualizando
import { STATE } from '../../../../../logic/brain.js';

// --- EXPORTACIÓN A IMAGEN (PNG) ---
export async function exportToPNG() {
    // Validaciones Previas
    if (!STATE.currentPreviewDoc || !STATE.currentPreviewCard) {
        showErr('Error: No hay documento generado. Abra un Informe o Receta primero.');
        return;
    }

    try {
        flash('Generando imagen de alta resolución... Espere.');

        // 1. Reconstruir el HTML
        // ¿Por qué reconstruir? Para asegurar que estamos renderizando una versión "limpia" 
        // sin elementos de UI de edición que puedan haber quedado en el preview interactivo.
        const html = STATE.currentPreviewDoc === 'INF' 
            ? buildReportHTML(STATE.currentPreviewCard) 
            : buildRecipeHTML(STATE.currentPreviewCard);

        // 2. Crear un contenedor temporal fuera del viewport
        // html2canvas necesita que el elemento esté en el DOM para renderizarlo
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Estilos para ocultarlo pero mantenerlo renderizable
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0px';
        tempDiv.style.zIndex = '-1000';
        document.body.appendChild(tempDiv);

        // 3. Ejecutar html2canvas
        const docPage = tempDiv.querySelector('.doc-page');
        
        // Verificación de dependencia
        if (typeof html2canvas === 'undefined') {
            throw new Error("La librería html2canvas no se ha cargado correctamente en index.html");
        }

        const canvas = await html2canvas(docPage, {
            scale: 2, // Scale 2 = Retina quality (mejor nitidez de texto)
            useCORS: true, // Permitir imágenes externas si las hubiera
            allowTaint: true,
            backgroundColor: '#ffffff', // Fondo blanco explícito
            logging: false, // Desactivar logs de depuración
            windowWidth: docPage.scrollWidth,
            windowHeight: docPage.scrollHeight
        });

        // 4. Limpieza del DOM (Eliminar el div temporal)
        document.body.removeChild(tempDiv);

        // 5. Generación del nombre de archivo inteligente
        const patientId = $("#documento_numero")?.value || 'Paciente';
        // Extraemos fecha de la tarjeta
        const dateVal = STATE.currentPreviewCard.querySelector('.visit-date').value;
        const dateObj = new Date(dateVal);
        const ddmmyy = `${String(dateObj.getDate()).padStart(2, '0')}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getFullYear()).slice(-2)}`;
        const docType = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
        
        const filename = `CIMA-${patientId}-${docType}-${ddmmyy}.png`;

        // 6. Disparar Descarga
        canvas.toBlob(blob => {
            if (!blob) { throw new Error("Error generando el Blob de imagen"); }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // Firefox requiere que el elemento esté en el DOM
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Marcar en la tarjeta que se emitió documento (Metadatos)
            STATE.currentPreviewCard.dataset.documentoEmitido = 'true';
            STATE.currentPreviewCard.dataset.fechaEmision = new Date().toISOString();
            
            flash(`Documento descargado exitosamente: ${filename}`);
        }, 'image/png');

    } catch (err) {
        showErr('Fallo en exportación: ' + err.message);
        console.error("Detalle del error:", err);
    }
}

// --- COMPARTIR (WHATSAPP / EMAIL) ---
export function shareViaWhatsApp() {
    // Usamos la tarjeta actual en preview o la última seleccionada para compartir
    const card = STATE.currentShareCard || STATE.currentPreviewCard;
    
    if (!card) { 
        showErr('Abra una consulta o genere un preview para compartir.'); 
        return; 
    }

    // Datos del Paciente
    const phone = $("#tel_principal")?.value || '';
    const primerNombre = $("#primer_nombre")?.value || '';
    const primerApellido = $("#primer_apellido")?.value || '';
    const pNombre = `${primerNombre} ${primerApellido}`.trim() || 'Paciente';
    const fecha = fmtDate(card.querySelector('.visit-date')?.value);
    
    // Datos del Médico
    const drName = STATE.currentUser?.profile?.name || 'Su Médico';
    
    // Mensaje pre-formateado
    const mensaje = `Hola ${pNombre}, le saluda ${drName}.\n\nAdjunto le hacemos llegar los documentos correspondientes a su consulta médica del día ${fecha}.\n\nPor favor confirme recibido.`;
    
    // Limpieza de número telefónico (eliminar espacios, guiones, parentesis)
    const phoneClean = phone.replace(/[^0-9]/g, '');
    
    if (phoneClean && phoneClean.length > 9) { // Validación mínima de longitud
        const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
        flash('Abriendo WhatsApp...');
    } else {
        showErr('Error: El paciente no tiene un número celular válido registrado en la ficha.');
    }
}