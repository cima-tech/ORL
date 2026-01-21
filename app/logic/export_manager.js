import { showErr, flash, STATE, $ } from 'brain';

export const ExportManager = {
    
    // Genera un PDF multipágina con los elementos HTML proporcionados
    async generatePDF(docElements, filename) {
        if (!docElements || docElements.length === 0) {
            showErr('No hay documentos seleccionados');
            return;
        }

        try {
            if (typeof window.jspdf === 'undefined') throw new Error("Librería PDF no cargada");
            if (typeof html2canvas === 'undefined') throw new Error("Librería Canvas no cargada");

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'pt', 'letter'); // Portrait, Puntos, Carta
            
            // Recorrer cada documento seleccionado
            for (let i = 0; i < docElements.length; i++) {
                const htmlString = docElements[i];
                
                // Renderizar HTML en un contenedor temporal invisible
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlString;
                tempDiv.style.width = '21.59cm'; // Ancho carta exacto
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                document.body.appendChild(tempDiv);
                
                const element = tempDiv.querySelector('.doc-page');

                // Detectar orientación
                const isLand = element.classList.contains('land');
                
                // Renderizar a Canvas
                const canvas = await html2canvas(element, {
                    scale: 2, // Calidad Alta
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                document.body.removeChild(tempDiv);

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                // Dimensiones PDF (Letter: 612 x 792 pt)
                const pdfW = isLand ? 792 : 612;
                const pdfH = isLand ? 612 : 792;

                // Agregar página (si no es la primera)
                if (i > 0) pdf.addPage('letter', isLand ? 'l' : 'p');
                else if (isLand) pdf.deletePage(1), pdf.addPage('letter', 'l'); // Ajustar primera si es landscape

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
            }

            pdf.save(filename);
            flash('PDF descargado correctamente');

        } catch (e) {
            console.error(e);
            showErr('Error generando PDF: ' + e.message);
        }
    },

    // Comparte el texto vía WhatsApp
    shareWhatsApp(phone, text) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            showErr('El paciente no tiene número válido');
            return;
        }
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
};
