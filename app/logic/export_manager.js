import { showErr, flash, fmtDate, STATE, $ } from 'brain';

export const ExportManager = {
    
    async downloadAsPNG(htmlContent, filenamePrefix) {
        if (!htmlContent) {
            showErr('No hay contenido para exportar');
            return;
        }

        try {
            if (typeof html2canvas === 'undefined') throw new Error("Librería gráfica no cargada");

            // Crear contenedor temporal invisible
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0px';
            document.body.appendChild(tempDiv);

            // Esperar un momento para que carguen imágenes (si están en caché es rápido)
            await new Promise(r => setTimeout(r, 100));

            const docPage = tempDiv.querySelector('.doc-page');
            
            const canvas = await html2canvas(docPage, {
                scale: 2, // Alta calidad
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            document.body.removeChild(tempDiv);

            // Nombre de archivo
            const patientId = $("#documento_numero")?.value || 'Paciente';
            const today = new Date();
            const ddmmyy = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getFullYear()).slice(-2)}`;
            const filename = `CIMA-${patientId}-${filenamePrefix}-${ddmmyy}.png`;

            // Descargar
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                flash(`Descargado: ${filename}`);
            }, 'image/png');

        } catch (err) {
            console.error(err);
            showErr('Error al exportar: ' + err.message);
        }
    },

    shareWhatsApp(cardId) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        const phone = $("#tel_principal")?.value || '';
        const pNombre = $("#primer_nombre")?.value || 'Paciente';
        const fecha = fmtDate(card.querySelector('.visit-date')?.value);
        const drName = STATE.currentUser?.profile?.name || 'Su Doctor';

        const mensaje = `Hola ${pNombre}, le envío los documentos de su consulta médica del día ${fecha}.\n\nAtte. ${drName}`;
        
        const phoneClean = phone.replace(/[^0-9]/g, '');
        
        if (phoneClean) {
            const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        } else {
            showErr('El paciente no tiene número telefónico registrado');
        }
    }
};
