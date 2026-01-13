/* modules/field-config.js - Configuración de campos del paciente */

export const PATIENT_FIELD_CONFIG = {
    identificacion: {
        label: "Identificación",
        fields: [
            { key: "documento_tipo", label: "Tipo Doc", type: "select", options: ["V","E","P","J","G"] },
            { key: "documento_numero", label: "Número", type: "text", placeholder: "Ej: 12345678" },
            { key: "estado_paciente", label: "Estado", type: "select", options: ["Activo","Inactivo","Fallecido"] },
            { key: "codigo_interno_cima", label: "Cód. Interno", type: "text", placeholder: "HC-..." }
        ]
    },
    nombres: {
        label: "Nombres Completos",
        fields: [
            { key: "primer_nombre", label: "Primer Nombre", type: "text" },
            { key: "segundo_nombre", label: "Segundo Nombre", type: "text" },
            { key: "primer_apellido", label: "Primer Apellido", type: "text" },
            { key: "segundo_apellido", label: "Segundo Apellido", type: "text" }
        ]
    },
    demografia: {
        label: "Demografía",
        fields: [
            { key: "fecha_nacimiento", label: "Fecha Nac", type: "date" },
            { key: "genero", label: "Género Biológico", type: "select", options: ["Femenino","Masculino","Intersexual"] },
            { key: "identidad_genero", label: "Identidad de Género", type: "text" },
            { key: "estado_civil", label: "Estado Civil", type: "select", options: ["Soltero/a","Casado/a","Divorciado/a","Viudo/a","Unión Libre"] }
        ]
    },
    datos_biologicos: {
        label: "Datos Biológicos",
        fields: [
            { key: "peso_kg", label: "Peso (kg)", type: "number", step: "0.1" },
            { key: "talla_cm", label: "Talla (cm)", type: "number", step: "0.1" },
            { key: "grupo_sanguineo", label: "Grupo Sanguíneo", type: "select", options: ["A","B","AB","O","Desconocido"] },
            { key: "factor_rh", label: "Factor RH", type: "select", options: ["Positivo (+)","Negativo (-)","Desconocido"] },
            { key: "lateralidad", label: "Lateralidad", type: "select", options: ["Diestro","Zurdo","Ambidiestro"] }
        ]
    },
    contacto: {
        label: "Contacto y Ubicación",
        fields: [
            { key: "tel_principal", label: "Teléfono Principal", type: "tel" },
            { key: "tel_secundario", label: "Teléfono Secundario", type: "tel" },
            { key: "email_principal", label: "Email Principal", type: "email" },
            { key: "email_secundario", label: "Email Secundario", type: "email" },
            { key: "dir_calle_num", label: "Dirección (Calle y Nro)", type: "text", full: true },
            { key: "dir_ciudad", label: "Ciudad", type: "text" },
            { key: "dir_estado", label: "Estado", type: "text" },
            { key: "dir_pais", label: "País", type: "text" },
            { key: "dir_postal", label: "Código Postal", type: "text" }
        ]
    },
    redes_sociales: {
        label: "Redes Sociales (Opcional)",
        fields: [
            { key: "instagram", label: "Instagram Usuario", type: "text" },
            { key: "x_twitter", label: "X (Twitter) Usuario", type: "text" },
            { key: "facebook", label: "Facebook Usuario", type: "text" }
        ]
    },
    contacto_emergencia: {
        label: "Contacto de Emergencia",
        fields: [
            { key: "nombre", label: "Nombre Completo", type: "text", full: true },
            { key: "parentesco", label: "Parentesco", type: "text" },
            { key: "telefono", label: "Teléfono", type: "tel" },
            { key: "email", label: "Email", type: "email" }
        ]
    },
    alertas_clinicas: {
        label: "Alertas Clínicas",
        type: "group_check_detail", 
        items: [
            { key: "alergias", label: "Alergias" },
            { key: "cronicas", label: "Enf. Crónicas" },
            { key: "medicamentos", label: "Medicamentos Actuales" }
        ]
    },
    seguridad_prioritaria: {
        label: "Seguridad Prioritaria",
        fields: [
            { key: "riesgo_caidas", label: "Riesgo de Caídas", type: "select", options: ["Bajo","Medio","Alto"] },
            { key: "voluntad_anticipada", label: "Voluntad Anticipada", type: "text" }
        ]
    },
    datos_administrativos: {
        label: "Datos Administrativos",
        fields: [
            { key: "aseguradora", label: "Aseguradora", type: "text" },
            { key: "numero_poliza", label: "Número Póliza", type: "text" },
            { key: "referido_por", label: "Referido por", type: "text" },
            { key: "fecha_admision", label: "Fecha Admisión", type: "date" }
        ]
    },
    antecedentes_personales: {
        label: "Antecedentes Personales",
        type: "checkbox_list", 
        items: [
            { key: "hipertension", label: "Hipertensión Arterial" },
            { key: "diabetes", label: "Diabetes Mellitus" },
            { key: "asma", label: "Asma Bronquial" },
            { key: "cardiopatias", label: "Cardiopatías" },
            { key: "epilepsia", label: "Epilepsia/Convulsiones" },
            { key: "tiroideos", label: "Patología Tiroidea" }
        ],
        extra_field: "otros" 
    },
    historial_quirurgico: {
        label: "Historial Quirúrgico",
        fields: [
            { key: "tiene_cirugias", label: "¿Ha tenido cirugías?", type: "checkbox" },
            { key: "descripcion", label: "Descripción de Cirugía(s)", type: "textarea", full: true },
            { key: "anio", label: "Año aproximado", type: "number" },
            { key: "complicaciones", label: "Complicaciones", type: "text" }
        ]
    },
    hospitalizaciones: {
        label: "Hospitalizaciones Previas",
        fields: [
            { key: "ha_sido_hospitalizado", label: "¿Ha sido hospitalizado?", type: "checkbox" },
            { key: "motivo", label: "Motivo", type: "text", full: true },
            { key: "anio", label: "Año", type: "number" },
            { key: "transfusiones", label: "¿Recibió transfusiones?", type: "checkbox" }
        ]
    },
    lesiones_y_fracturas: {
        label: "Lesiones y Fracturas",
        fields: [
            { key: "lesion_desc", label: "Descripción Lesión", type: "text", full: true },
            { key: "fractura_bool", label: "¿Incluye Fractura?", type: "checkbox" },
            { key: "hueso", label: "Hueso Afectado", type: "text" }
        ]
    },
    antecedentes_familiares: {
        label: "Antecedentes Familiares",
        type: "checkbox_list",
        items: [
            { key: "hipertension", label: "Hipertensión" },
            { key: "diabetes", label: "Diabetes" },
            { key: "cancer", label: "Cáncer" },
            { key: "cardiopatias", label: "Cardiopatías" }
        ],
        extra_field: "geneticas"
    },
    habitos: {
        label: "Hábitos y Estilo de Vida",
        fields: [
            { key: "tabaquismo", label: "Tabaquismo", type: "select", options: ["Niega","Ex-fumador","Ocasional","Diario"] },
            { key: "alcohol", label: "Consumo Alcohol", type: "select", options: ["Niega","Ocasional","Social","Frecuente"] },
            { key: "sustancias", label: "Drogas/Sustancias", type: "select", options: ["Niega","Marihuana","Cocaína","Otras"] },
            { key: "actividad_fisica", label: "Actividad Física", type: "select", options: ["Sedentario","Ligera","Moderada","Intensa"] },
            { key: "alimentacion", label: "Alimentación", type: "select", options: ["Mala","Regular","Buena","Excelente"] }
        ]
    },
    contexto_social: {
        label: "Contexto Social",
        fields: [
            { key: "ocupacion", label: "Ocupación", type: "text" },
            { key: "educacion", label: "Nivel Educativo", type: "text" },
            { key: "vivienda", label: "Tipo Vivienda", type: "text" },
            { key: "cuidador", label: "Requiere Cuidador?", type: "checkbox" },
            { key: "barreras_comunicacion", label: "Barreras Comunicación", type: "text" }
        ]
    },
    consentimientos: {
        label: "Consentimientos",
        fields: [
            { key: "tratamiento_datos", label: "Acepta tratamiento de datos", type: "checkbox" }
        ]
    }
};
