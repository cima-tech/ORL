/* modules/user-profile.js */

/*
  [GLOSARIO-USUARIO]
  state -> Estado global del perfil (Mapea JSON)
  identity -> Datos de acceso y nombres
  personal -> Datos biomédicos y contacto
  professional -> Datos médicos y colegiatura
  assets -> Archivos de firma y membrete (Mapeo de branding)
*/

// [JS-UP-001] CLASE UserProfile (ACTUALIZADA V2)
export default class UserProfile {
    // Constructor ahora puede aceptar un JSON completo para inicialización
    constructor(specialtiesCatalog, jsonData = null) {
        this.catalog = specialtiesCatalog;
        
        // Estructura base inicial (si no hay JSON)
        this.state = {
            currentStep: 1,
            isComplete: false,
            
            // A. Identidad y Acceso
            identity: {
                names: '',             
                lastNames: '',         
                emailProfessional: '', 
                emailPersonal: '',     
                accountPassword: '',
                confirmAccountPassword: '',
                avatarFile: null,      
                avatarPreview: null   
            },

            // B. Datos Personales
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

            // C. Datos Profesionales (Actualizado con branding y Asociación Médica)
            professional: {
                role: 'Invitado', // Por defecto
                titlePrefix: '',       
                specialty: '',
                specialtyCode: null,   
                department: null,
                medicalAssociationNumber: '', // Corrección aplicada
                licenseNumber: '',     
                defaultConsultationModel: null,
                branding: {
                    basePath: '',
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

            // D. Configuración
            config: {
                acceptedTerms: false,
                enableNotifications: true
            }
        };

        // Si recibimos datos (del JSON), sobreescribimos el estado
        if (jsonData) {
            this.loadFromJSON(jsonData);
        }
        
        // Cálculo automático de username (prefixo del email pro) si no está seteado en JSON
        if (!jsonData.username && this.state.identity.emailProfessional) {
            const email = this.state.identity.emailProfessional.split('@')[0];
            this.state.username = email;
        } else if (jsonData.username) {
            this.state.username = jsonData.username;
        }
    }

    // [NEW] Cargar datos desde JSON (para Login/Inicio de Sesión)
    loadFromJSON(jsonData) {
        if(jsonData.identity) this.state.identity = { ...this.state.identity, ...jsonData.identity };
        if(jsonData.personal) this.state.personal = { ...this.state.personal, ...jsonData.personal };
        
        if(jsonData.professional) {
            const proData = jsonData.professional;
            
            // Mergear campos principales
            this.state.professional.role = proData.role || 'Doctor';
            this.state.professional.titlePrefix = proData.titlePrefix;
            this.state.professional.specialty = proData.specialty;
            this.state.professional.specialtyCode = proData.specialtyCode;
            this.state.professional.department = proData.department;
            this.state.professional.medicalAssociationNumber = proData.medicalAssociationNumber;
            this.state.professional.licenseNumber = proData.licenseNumber;
            this.state.professional.defaultConsultationModel = proData.defaultConsultationModel;

            // Mergear Branding (nested)
            if(proData.branding) {
                this.state.professional.branding = { ...this.state.professional.branding, ...proData.branding };
            }
        }
        
        if(jsonData.config) this.state.config = { ...this.state.config, ...jsonData.config };
        if(jsonData.state) this.state = { ...this.state, ...jsonData.state };
        
        // ID externo si lo hay
        if(jsonData.id) this.id = jsonData.id;
    }

    // [UP-002] Manejo de carga de imágenes
    handleImageUpload(type, file) {
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        
        // Manejo para Branding (dentro de professional.branding)
        if (['header', 'footer', 'signature', 'stamp'].includes(type)) {
            if (!this.state.professional.branding) this.state.professional.branding = {};
            this.state.professional.branding[`${type}File`] = file;
            this.state.professional.branding[`${type}Url`] = previewUrl; 
        } 
        else if (type === 'avatar') {
            this.state.identity.avatarFile = file;
            this.state.identity.avatarPreview = previewUrl;
        }
    }

    // [UP-003] Validación de datos
    validateStep1() {
        const { identity, personal } = this.state;
        const errors = [];

        if (!identity.names.trim()) errors.push("Nombres obligatorios");
        if (!identity.lastNames.trim()) errors.push("Apellidos obligatorios");
        if (!identity.emailProfessional.includes('@')) errors.push("Email profesional inválido");
        if (!identity.emailPersonal.includes('@')) errors.push("Email personal inválido");
        if (personal.bloodType === '') errors.push("Tipo de sangre es recomendado para seguridad ocupacional");
        
        return errors;
    }
    
    // Helpers para obtener datos formateados para UI
    getDisplayName() {
        return `${this.state.identity.names} ${this.state.identity.lastNames}`;
    }

    getDisplayRole() {
        return this.state.professional.role;
    }
}
