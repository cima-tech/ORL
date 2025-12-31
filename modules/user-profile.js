/* modules/user-profile.js */

/*
  [GLOSARIO-USUARIO]
  state -> Estado global del perfil
  identity -> Datos de acceso y nombres
  personal -> Datos biomédicos y contacto
  professional -> Datos médicos y colegiatura
  assets -> Archivos de firma y membrete
*/

// [JS-UP-001] CLASE UserProfile
export default class UserProfile {
    constructor(specialtiesCatalog) {
        this.catalog = specialtiesCatalog;
        
        this.state = {
            step: 1, 
            
            // A. Identidad y Acceso
            identity: {
                avatarFile: null,      
                avatarPreview: null,   
                names: '',             
                lastNames: '',         
                emailProfessional: '', 
                emailPersonal: '',     
                password: '',
                confirmPassword: ''
            },

            // B. Datos Personales
            personal: {
                phoneProfessional: '', 
                phonePersonal: '',     
                governmentId: '',      
                birthDate: '',         
                maritalStatus: '',     
                bloodType: '',         
                healthConditions: ''   
            },

            // C. Datos Profesionales
            professional: {
                role: '',              
                titlePrefix: '',       
                collegeNumber: '',     
                licenseNumber: '',     
                specialtyCode: null,   
                department: null,      
                defaultConsultationModel: null 
            },

            // D. Activos (Firmas, etc)
            assets: {
                headerFile: null,      
                footerFile: null,      
                signatureFile: null,   
                stampFile: null,       
                headerUrl: null,
                footerUrl: null,
                signatureUrl: null,
                stampUrl: null
            },

            // E. Configuración
            config: {
                acceptedTerms: false,
                enableNotifications: true
            }
        };
    }

    // [JS-UP-002] Manejo de carga de imágenes
    handleImageUpload(type, file) {
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        
        if (type === 'avatar') {
            this.state.identity.avatarFile = file;
            this.state.identity.avatarPreview = previewUrl;
        } else if (['header', 'footer', 'signature', 'stamp'].includes(type)) {
            this.state.assets[`${type}File`] = file;
            this.state.assets[`${type}Url`] = previewUrl; 
        }
    }

    // [JS-UP-003] Validación de datos
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
}