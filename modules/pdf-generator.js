/* modules/pdf-generator.js - Generador de documentos PDF */
import jsPDF from 'jspdf'; // Necesitarías incluir jspdf en el proyecto

export default class PDFGenerator {
    static async generateDocument(type, data, userConfig) {
        const doc = new jsPDF({
            orientation: type === 'receta' ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configurar fuentes
        doc.setFont("helvetica");
        
        // Agregar header si existe
        if (userConfig.branding?.headerUrl) {
            // Aquí cargaríamos la imagen del header
            // doc.addImage(headerImg, 'PNG', 10, 10, 190, 30);
        }
        
        // Título del documento
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(this.getDocumentTitle(type), 105, 50, { align: 'center' });
        
        // Información del paciente
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Paciente: ${data.patientName}`, 20, 70);
        doc.text(`Documento: ${data.patientDocument}`, 20, 78);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 86);
        
        // Contenido específico del documento
        this.addDocumentContent(doc, type, data, 100);
        
        // Footer con firma
        if (userConfig.branding?.signatureUrl) {
            // Agregar firma
            // doc.addImage(signatureImg, 'PNG', 150, 250, 40, 20);
        }
        
        if (userConfig.branding?.stampUrl) {
            // Agregar sello
            // doc.addImage(stampImg, 'PNG', 20, 250, 30, 30);
        }
        
        // Guardar PDF
        doc.save(`${type}_${data.patientDocument}_${Date.now()}.pdf`);
    }
    
    static getDocumentTitle(type) {
        const titles = {
            'informe': 'INFORME MÉDICO',
            'receta': 'RECETA MÉDICA',
            'orden_laboratorio': 'ORDEN DE LABORATORIO',
            'orden_quirurgica': 'ORDEN QUIRÚRGICA',
            'referencia': 'REFERENCIA MÉDICA',
            'constancia': 'CONSTANCIA MÉDICA'
        };
        return titles[type] || 'DOCUMENTO MÉDICO';
    }
    
    static addDocumentContent(doc, type, data, startY) {
        let y = startY;
        
        switch(type) {
            case 'informe':
                doc.text(`Motivo: ${data.motivo}`, 20, y); y += 10;
                doc.text(`Enfermedad Actual: ${data.ea}`, 20, y); y += 10;
                doc.text(`Diagnóstico: ${data.dx}`, 20, y); y += 10;
                doc.text(`Plan: ${data.plan}`, 20, y);
                break;
                
            case 'receta':
                // Layout especial para receta
                doc.text('MEDICAMENTOS:', 20, y); y += 8;
                data.medicamentos.forEach(med => {
                    doc.text(`• ${med.nombre}: ${med.dosis}`, 25, y); y += 7;
                });
                y += 5;
                doc.text('INDICACIONES:', 20, y); y += 8;
                doc.text(data.indicaciones, 25, y, { maxWidth: 160 });
                break;
                
            // ... otros tipos de documentos
        }
    }
}
