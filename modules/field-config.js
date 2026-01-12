/* consultmodels/ORL-001.js - Con generador de documentos */
// ... (mantener todo el código ORL_DATA, ORL_UI, ORL_DOCS existente)

const DOCUMENT_GENERATOR = {
    generateInforme: function(context, userData) {
        return `
            <div class="document informe">
                <!-- Header con logo y datos del médico -->
                <div class="document-header">
                    ${userData.professional.branding.headerUrl ? 
                        `<img src="user/${userData.id}/layout/${userData.professional.branding.headerUrl}" class="doc-header-img">` : 
                        `<h1>${userData.professional.titlePrefix} ${userData.identity.names} ${userData.identity.lastNames}</h1>
                         <h3>${userData.professional.specialty} - ${userData.professional.medicalAssociationNumber}</h3>`
                    }
                </div>
                
                <!-- Datos del paciente -->
                <div class="patient-data">
                    <h4>INFORME MÉDICO</h4>
                    <table>
                        <tr><td>Paciente:</td><td><strong>${context.paciente.nombre}</strong></td></tr>
                        <tr><td>C.I.:</td><td>${context.paciente.ci}</td></tr>
                        <tr><td>Edad:</td><td>${context.paciente.edad} años</td></tr>
                        <tr><td>Fecha:</td><td>${context.paciente.fecha}</td></tr>
                    </table>
                </div>
                
                <!-- Contenido de la consulta -->
                <div class="consultation-content">
                    <h4>MOTIVO DE CONSULTA</h4>
                    <p>${context.consulta.motivo || 'No especificado'}</p>
                    
                    <h4>ENFERMEDAD ACTUAL</h4>
                    <p>${context.consulta.ea || 'No especificado'}</p>
                    
                    <h4>DIAGNÓSTICO</h4>
                    <p>${context.consulta.dx || 'No especificado'}</p>
                    
                    <h4>PLAN Y TRATAMIENTO</h4>
                    <p>${context.consulta.plan || 'No especificado'}</p>
                </div>
                
                <!-- Firma y sello -->
                <div class="document-footer">
                    <div class="signature-area" id="signatureArea">
                        ${userData.professional.branding.signatureUrl ? 
                            `<img src="user/${userData.id}/layout/${userData.professional.branding.signatureUrl}" class="doc-signature">` :
                            `<p>_________________________</p>
                             <p>${userData.professional.titlePrefix} ${userData.identity.names} ${userData.identity.lastNames}</p>`
                        }
                    </div>
                    <div class="stamp-area" id="stampArea">
                        ${userData.professional.branding.stampUrl ? 
                            `<img src="user/${userData.id}/layout/${userData.professional.branding.stampUrl}" class="doc-stamp">` : ''
                        }
                    </div>
                </div>
                
                <!-- Footer -->
                ${userData.professional.branding.footerUrl ? 
                    `<img src="user/${userData.id}/layout/${userData.professional.branding.footerUrl}" class="doc-footer-img">` : 
                    `<div class="doc-footer-text">
                        <p>${userData.contacto?.telefono || ''} | ${userData.contacto?.email || ''}</p>
                    </div>`
                }
            </div>
        `;
    },
    
    generateRecipeIndicaciones: function(context, userData) {
        return `
            <div class="document recipe-landscape">
                <!-- Layout horizontal dividido -->
                <div class="recipe-container">
                    <div class="recipe-left">
                        <h4>RECIPE MÉDICO</h4>
                        <div class="recipe-content">
                            ${context.consulta.recipe ? 
                                context.consulta.recipe.split('\n').map(line => `<p>${line}</p>`).join('') : 
                                '<p>No se prescribieron medicamentos</p>'
                            }
                        </div>
                    </div>
                    <div class="recipe-right">
                        <h4>INDICACIONES</h4>
                        <div class="indicaciones-content">
                            ${context.consulta.indicaciones ? 
                                context.consulta.indicaciones.split('\n').map(line => `<p>${line}</p>`).join('') : 
                                '<p>Sin indicaciones específicas</p>'
                            }
                        </div>
                    </div>
                </div>
                
                <!-- Datos comunes -->
                <div class="recipe-footer">
                    <p><strong>Paciente:</strong> ${context.paciente.nombre} | <strong>C.I.:</strong> ${context.paciente.ci}</p>
                    <p><strong>Fecha:</strong> ${context.paciente.fecha}</p>
                    
                    <div class="recipe-signature">
                        ${userData.professional.branding.signatureUrl ? 
                            `<img src="user/${userData.id}/layout/${userData.professional.branding.signatureUrl}" class="doc-signature-small">` :
                            `<p>_________________________</p>`
                        }
                        <p>${userData.professional.titlePrefix} ${userData.identity.names} ${userData.identity.lastNames}</p>
                        <p>${userData.professional.medicalAssociationNumber}</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ... métodos para los otros 4 tipos de documentos
};

// Actualizar MODEL_DEFINITION para incluir documentos
export const MODEL_DEFINITION = {
    id: "ORL-001",
    name: "Consulta ORL (Otorrinolaringología)",
    
    initUI: function(container, data = {}) {
        // ... (mantener código existente)
    },
    
    getData: function(container) {
        // ... (mantener código existente)
    },
    
    getDocuments: function(consultationData, patientData, userData) {
        const context = {
            paciente: {
                nombre: `${patientData.nombres.primer_nombre} ${patientData.nombres.primer_apellido}`,
                ci: patientData.identificacion.documento_numero,
                edad: patientData.demografia.edad_auto,
                fecha: new Date().toLocaleDateString('es-ES')
            },
            consulta: consultationData,
            medico: {
                nombre: `${userData.identity.names} ${userData.identity.lastNames}`,
                titulo: userData.professional.titlePrefix,
                especialidad: userData.professional.specialty,
                registro: userData.professional.medicalAssociationNumber
            }
        };
        
        return {
            informe: DOCUMENT_GENERATOR.generateInforme(context, userData),
            recipe: DOCUMENT_GENERATOR.generateRecipeIndicaciones(context, userData),
            laboratorio: DOCUMENT_GENERATOR.generateLaboratorio(context, userData),
            quirurgica: DOCUMENT_GENERATOR.generateQuirurgica(context, userData),
            referencia: DOCUMENT_GENERATOR.generateReferencia(context, userData),
            constancia: DOCUMENT_GENERATOR.generateConstancia(context, userData)
        };
    }
};
