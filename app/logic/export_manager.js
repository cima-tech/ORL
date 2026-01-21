import { showErr, flash, fmtDate, STATE, $ } from 'brain';
import { ServiceLoader } from './service_loader.js';

export const ExportManager = {
    
    // Generar y descargar (PDF/Imagen)
    async processExport(card, options) {
        if (!card) return showErr('No hay consulta seleccionada');
        
        const docModule = ServiceLoader.get('documents');
        if (!docModule) return showErr('Módulo de documentos no cargado');

        try {
            // Validar librería gráfica
            if (typeof html2canvas === 'undefined') throw new Error("Librería gráfica no cargada");

            const itemsToExport = [];
            if (options.informe) itemsToExport.push({ type: 'INF', builder: docModule.buildReportHTML, name: 'INFORME' });
            if (options.recipe) itemsToExport.push({ type: 'RP', builder: docModule.buildRecipeHTML, name: 'RECIPE' });

            if (itemsToExport.length === 0) return showErr("Seleccione al menos un documento");

            flash("Generando documentos...", false);

            for (const item of itemsToExport) {
                // 1. Generar HTML en memoria
                const htmlContent = item.builder(card);
                
                // 2. Crear contenedor temporal invisible
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                tempDiv.style.top = '0px';
                document.body.appendChild(tempDiv);

                // 3. Renderizar imagen
                const docPage = tempDiv.querySelector('.doc-page');
                const canvas = await html2canvas(docPage, {
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false
                });

                // 4. Limpieza
                document.body.removeChild(tempDiv);

                // 5. Descargar
                const patientId = $("#documento_numero")?.value || 'Paciente';
                const today = new Date();
                const ddmmyy = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getFullYear()).slice(-2)}`;
                const filename = `CIMA-${patientId}-${item.name}-${ddmmyy}.png`;

                this.downloadCanvas(canvas, filename);
                await new Promise(r => setTimeout(r, 500)); // Pausa para evitar bloqueo de descargas
            }

            flash("Exportación completada");

        } catch (err) {
            console.error(err);
            showErr('Error exportando: ' + err.message);
        }
    },

    downloadCanvas(canvas, filename) {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    },

    // Generar link de WhatsApp
    shareViaWhatsApp(card) {
        if (!card) return;
        
        const phone = $("#tel_principal")?.value || '';
        const pNombre = $("#primer_nombre")?.value || 'Paciente';
        const fecha = fmtDate(card.querySelector('.visit-date')?.value);
        const drName = STATE.currentUser?.profile?.name || 'Su Doctor';

        const mensaje = `Hola ${pNombre}, adjunto enviamos los documentos de su consulta médica del día ${fecha}.\n\nAtte. ${drName}`;
        const phoneClean = phone.replace(/[^0-9]/g, '');
        
        if (phoneClean) {
            const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        } else {
            showErr('El paciente no tiene número telefónico registrado');
        }
    }
};
