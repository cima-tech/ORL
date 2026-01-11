/* modules/user-profile.js */

// [JS-UP-001] CLASE UserProfile (Estable V3)
export default class UserProfile {
    constructor(specialtiesCatalog, jsonData = null) {
        this.catalog = specialtiesCatalog;
        
        // [ESTRUCTURA BASE IDÉNTICA AL JSON]
        this.state = {
            identity: {
                names: '',             
                lastNames: '',         
                emailProfessional: '', 
                emailPersonal: '',     
                accountPassword: '', // Password del usuario (para futuro login)
                confirmAccountPassword: '',
                avatarFile: null,      
                avatarPreview: null   
            },
            personal: {
                documentType: '',
                documentNumber: '',
                birthDate: '',         
                maritalStatus: '',     
                bloodType: '',         
                healthConditions: '',   
                phoneProfessional: '', 
                phonePersonal: '',     
            },
            professional: {
                role: 'Invitado', // Por defecto si no carga JSON
                titlePrefix: '',       
                specialty: '',
                specialtyCode: null,   
                medicalAssociationNumber: '',
                licenseNumber: '',     
                defaultConsultationModel: null,
                branding: {
                    basePath: 'user/user-001/layout/',
                    headerUrl: '',
                    footerUrl: '',
                    signatureUrl: '',
                    stampUrl: '',
                    headerFile: null,
                    footerFile: null,
                    signatureFile: null,
                    stampFile: null
                }
            },
            config: {
                acceptedTerms: false,
                enableNotifications: true
            }
        };

        // [SI SE RECIBEN DATOS (Desde JSON)]
        if (jsonData) {
            // Mergear identidad
            if(jsonData.identity) {
                this.state.identity = { ...this.state.identity, ...jsonData.identity };
                this.state.username = jsonData.username || (this.state.identity.emailProfessional ? this.state.identity.emailProfessional.split('@')[0] : 'user');
            }

            // Mergear personal
            if(jsonData.personal) {
                this.state.personal = { ...this.state.personal, ...jsonData.personal };
            }

            // Mergear profesional (Completo con Branding anidado)
            if(jsonData.professional) {
                // Mergear campo por campo para no perder la estructura base vacía de 'branding'
                this.state.professional.role = jsonData.professional.role || this.state.professional.role;
                this.state.professional.titlePrefix = jsonData.professional.titlePrefix;
                this.state.professional.specialty = jsonData.professional.specialty;
                this.state.professional.specialtyCode = jsonData.professional.specialtyCode;
                this.state.professional.medicalAssociationNumber = jsonData.professional.medicalAssociationNumber;
                this.state.professional.licenseNumber = jsonData.professional.licenseNumber;
                this.state.professional.department = jsonData.professional.department;
                this.state.professional.defaultConsultationModel = jsonData.professional.defaultConsultationModel;

                if(jsonData.professional.branding) {
                    this.state.professional.branding = { 
                        ...this.state.professional.branding, 
                        ...jsonData.professional.branding 
                    };
                }
            }

            // Mergear config
            if(jsonData.config) {
                this.state.config = { ...this.state.config, ...jsonData.config };
            }
        }
    }

    // [UP-002] Helpers para obtener datos formateados
    getDisplayName() {
        return `${this.state.identity.names} ${this.state.identity.lastNames}`;
    }

    getDisplayRole() {
        return this.state.professional.role;
    }

    getDisplayTitle() {
        return `${this.state.professional.titlePrefix} ${this.state.identity.names}`;
    }
}
