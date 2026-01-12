/* modules/pdf-generator.js - Generador de 6 tipos de documentos PDF */
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFGenerator {
    static async generateDocument(data) {
        const { type, patient, consultation, doctor, date } = data;
        
        // Crear documento según el tipo
        switch(type) {
            case 'informe':
                return this.generateInforme(patient, consultation, doctor, date);
            case 'receta':
                return this.generateReceta(patient, consultation, doctor, date);
            case 'orden_laboratorio':
                return this.generateOrdenLaboratorio(patient, consultation, doctor, date);
            case 'orden_quirurgica':
                return this.generateOrdenQuirurgica(patient, consultation, doctor, date);
            case 'referencia':
                return this.generateReferencia(patient, consultation, doctor, date);
            case 'constancia':
                return this.generateConstancia(patient, consultation, doctor, date);
            default:
                throw new Error('Tipo de documento no válido');
        }
    }
    
    static async generateInforme(patient, consultation, doctor, date) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Header con logo si existe
        await this.addHeader(doc, doctor);
        
        // Título
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME MÉDICO', 105, 50, { align: 'center' });
        
        // Datos del paciente
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Paciente: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`, 20, 70);
        doc.text(`Documento: ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}`, 20, 77);
        doc.text(`Edad: ${patient.demografia.edad_auto} años`, 20, 84);
        doc.text(`Fecha: ${new Date(date).toLocaleDateString('es-ES')}`, 20, 91);
        
        // Contenido
        let y = 110;
        
        // Motivo
        doc.setFont('helvetica', 'bold');
        doc.text('MOTIVO DE CONSULTA:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(consultation.motivo || 'No especificado', 20, y + 7, { maxWidth: 170 });
        y += 20;
        
        // Enfermedad Actual
        doc.setFont('helvetica', 'bold');
        doc.text('ENFERMEDAD ACTUAL:', 20, y);
        doc.setFont('helvetica', 'normal');
        const eaLines = doc.splitTextToSize(consultation.ea || 'No especificado', 170);
        doc.text(eaLines, 20, y + 7);
        y += (eaLines.length * 5) + 15;
        
        // Diagnóstico
        doc.setFont('helvetica', 'bold');
        doc.text('DIAGNÓSTICO:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(consultation.dx || 'No especificado', 20, y + 7, { maxWidth: 170 });
        y += 20;
        
        // Plan
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN Y TRATAMIENTO:', 20, y);
        doc.setFont('helvetica', 'normal');
        const planLines = doc.splitTextToSize(consultation.plan || 'No especificado', 170);
        doc.text(planLines, 20, y + 7);
        
        // Footer con firma
        await this.addFooter(doc, doctor, 250);
        
        // Guardar
        doc.save(`Informe_${patient.identificacion.documento_numero}_${Date.now()}.pdf`);
    }
    
    static async generateReceta(patient, consultation, doctor, date) {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        await this.addHeader(doc, doctor);
        
        // Título
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('RECETA MÉDICA', 148, 50, { align: 'center' });
        
        // Datos del paciente
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Paciente: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`, 20, 70);
        doc.text(`Documento: ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}`, 20, 77);
        doc.text(`Fecha: ${new Date(date).toLocaleDateString('es-ES')}`, 20, 84);
        
        // Tabla de medicamentos
        const medicamentos = this.parseMedicamentos(consultation.recipe);
        if (medicamentos.length > 0) {
            doc.autoTable({
                startY: 100,
                head: [['Medicamento', 'Presentación', 'Dosis', 'Frecuencia', 'Duración']],
                body: medicamentos,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 9 }
            });
        }
        
        // Indicaciones
        if (consultation.indicaciones) {
            const finalY = doc.lastAutoTable.finalY || 130;
            doc.setFont('helvetica', 'bold');
            doc.text('INDICACIONES:', 20, finalY + 15);
            doc.setFont('helvetica', 'normal');
            const indLines = doc.splitTextToSize(consultation.indicaciones, 250);
            doc.text(indLines, 20, finalY + 22);
        }
        
        await this.addFooter(doc, doctor, 180);
        
        doc.save(`Receta_${patient.identificacion.documento_numero}_${Date.now()}.pdf`);
    }
    
    static async generateOrdenLaboratorio(patient, consultation, doctor, date) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        await this.addHeader(doc, doctor);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDEN DE LABORATORIO', 105, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Paciente: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`, 20, 70);
        doc.text(`Documento: ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}`, 20, 77);
        doc.text(`Fecha: ${new Date(date).toLocaleDateString('es-ES')}`, 20, 84);
        
        // Estudios solicitados
        const estudios = consultation.estudios ? consultation.estudios.split('\n') : ['No especificado'];
        let y = 110;
        
        doc.setFont('helvetica', 'bold');
        doc.text('ESTUDIOS SOLICITADOS:', 20, y);
        doc.setFont('helvetica', 'normal');
        
        estudios.forEach((estudio, index) => {
            doc.text(`• ${estudio}`, 25, y + 10 + (index * 7));
        });
        
        await this.addFooter(doc, doctor, 250);
        
        doc.save(`Orden_Lab_${patient.identificacion.documento_numero}_${Date.now()}.pdf`);
    }
    
    static async generateOrdenQuirurgica(patient, consultation, doctor, date) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        await this.addHeader(doc, doctor);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDEN QUIRÚRGICA', 105, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Paciente: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`, 20, 70);
        doc.text(`Documento: ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}`, 20, 77);
        doc.text(`Edad: ${patient.demografia.edad_auto} años`, 20, 84);
        doc.text(`Grupo Sanguíneo: ${patient.datos_biologicos.grupo_sanguineo}${patient.datos_biologicos.factor_rh}`, 20, 91);
        
        // Procedimiento
        let y = 110;
        doc.setFont('helvetica', 'bold');
        doc.text('PROCEDIMIENTO QUIRÚRGICO:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(consultation.procedimiento || 'No especificado', 20, y + 7, { maxWidth: 170 });
        
        // Indicaciones preoperatorias
        y += 30;
        doc.setFont('helvetica', 'bold');
        doc.text('INDICACIONES PREOPERATORIAS:', 20, y);
        doc.setFont('helvetica', 'normal');
        const indLines = doc.splitTextToSize(consultation.indicaciones_preoperatorias || 'No especificado', 170);
        doc.text(indLines, 20, y + 7);
        
        await this.addFooter(doc, doctor, 250);
        
        doc.save(`Orden_Quir_${patient.identificacion.documento_numero}_${Date.now()}.pdf`);
    }
    
    static async generateReferencia(patient, consultation, doctor, date) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        await this.addHeader(doc, doctor);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('REFERENCIA MÉDICA', 105, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Paciente: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`, 20, 70);
        doc.text(`Documento: ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}`, 20, 77);
        doc.text(`Fecha: ${new Date(date).toLocaleDateString('es-ES')}`, 20, 84);
        
        // Motivo de referencia
        let y = 110;
        doc.setFont('helvetica', 'bold');
        doc.text('MOTIVO DE REFERENCIA:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(consultation.motivo_referencia || 'No especificado', 20, y + 7, { maxWidth: 170 });
        
        // Resumen clínico
        y += 30;
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN CLÍNICO:', 20, y);
        doc.setFont('helvetica', 'normal');
        const resumenLines = doc.splitTextToSize(consultation.resumen_clinico || 'No especificado', 170);
        doc.text(resumenLines, 20, y + 7);
        
        // Especialidad solicitada
        y += (resumenLines.length * 5) + 15;
        doc.setFont('helvetica', 'bold');
        doc.text('ESPECIALIDAD SOLICITADA:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(consultation.especialidad_solicitada || 'No especificado', 20, y + 7);
        
        await this.addFooter(doc, doctor, 250);
        
        doc.save(`Referencia_${patient.identificacion.documento_numero}_${Date.now()}.pdf`);
    }
    
    static async generateConstancia(patient, consultation, doctor, date) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        await this.addHeader(doc, doctor);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSTANCIA MÉDICA', 105, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Paciente: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`, 20, 70);
        doc.text(`Documento: ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}`, 20, 77);
        doc.text(`Fecha: ${new Date(date).toLocaleDateString('es-ES')}`, 20, 84);
        
        // Contenido de la constancia
        let y = 110;
        doc.setFont('helvetica', 'bold');
        doc.text('CONSTANCIA:', 20, y);
        doc.setFont('helvetica', 'normal');
        
        const constanciaText = `
Que mediante la presente se hace constar que el/la paciente ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}, 
portador(a) de la cédula de identidad ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}, 
fue atendido(a) en consulta médica el día ${new Date(date).toLocaleDateString('es-ES')}.

${consultation.motivo_constancia || 'La consulta se realizó para evaluación y seguimiento médico.'}

${consultation.periodo ? `Período de atención: ${consultation.periodo}` : ''}

${consultation.recomendaciones ? `Recomendaciones: ${consultation.recomendaciones}` : ''}
        `.trim();
        
        const constanciaLines = doc.splitTextToSize(constanciaText, 170);
        doc.text(constanciaLines, 20, y + 7);
        
        await this.addFooter(doc, doctor, 250);
        
        doc.save(`Constancia_${patient.identificacion.documento_numero}_${Date.now()}.pdf`);
    }
    
    static async addHeader(doc, doctor) {
        // Intentar cargar header personalizado si existe
        if (doctor?.professional?.branding?.headerUrl) {
            try {
                const headerPath = `user/${doctor.id}/layout/${doctor.professional.branding.headerUrl}`;
                // En una implementación real, cargaríamos la imagen aquí
                // Por ahora, usamos texto
            } catch (error) {
                console.warn('No se pudo cargar el header:', error);
            }
        }
        
        // Header por defecto
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SISTEMA CLÍNICO MODULAR CIMA', 105, 20, { align: 'center' });
        
        if (doctor) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${doctor.professional.titlePrefix} ${doctor.identity.names} ${doctor.identity.lastNames}`, 105, 28, { align: 'center' });
            doc.text(`${doctor.professional.specialty} - ${doctor.professional.licenseNumber}`, 105, 34, { align: 'center' });
        }
        
        doc.line(20, 40, 190, 40);
    }
    
    static async addFooter(doc, doctor, yPosition) {
        doc.line(20, yPosition, 190, yPosition);
        
        // Firma si existe
        if (doctor?.professional?.branding?.signatureUrl) {
            try {
                const signaturePath = `user/${doctor.id}/layout/${doctor.professional.branding.signatureUrl}`;
                // Cargar imagen de firma
                // Por ahora, texto
            } catch (error) {
                console.warn('No se pudo cargar la firma:', error);
            }
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Firma del Médico', 105, yPosition + 15, { align: 'center' });
        
        if (doctor) {
            doc.setFont('helvetica', 'normal');
            doc.text(`${doctor.professional.titlePrefix} ${doctor.identity.names} ${doctor.identity.lastNames}`, 105, yPosition + 20, { align: 'center' });
            doc.text(doctor.professional.licenseNumber, 105, yPosition + 25, { align: 'center' });
        }
        
        // Sello si existe
        if (doctor?.professional?.branding?.stampUrl) {
            try {
                const stampPath = `user/${doctor.id}/layout/${doctor.professional.branding.stampUrl}`;
                // Cargar imagen de sello
                // Por ahora, texto
            } catch (error) {
                console.warn('No se pudo cargar el sello:', error);
            }
        }
    }
    
    static parseMedicamentos(recipeText) {
        if (!recipeText) return [];
        
        const lines = recipeText.split('\n').filter(line => line.trim());
        return lines.map(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                return [
                    parts[0].trim(),
                    'Tabletas/Comprimidos',
                    parts[1].trim(),
                    'Cada 12 horas',
                    '10 días'
                ];
            }
            return [line.trim(), '', '', '', ''];
        });
    }
}
