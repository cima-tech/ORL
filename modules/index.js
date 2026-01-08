/* modules/index.js */

/*
  [GLOSARIO-INDEX]
  StorageService -> Persistencia Local
  PatientFieldConfig -> Esquema completo del paciente (A-R)
  App -> Orquestador principal (Dashboard, Paciente, Modal)
*/

import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';

// [JS-IND-001] SERVICIO DE ALMACENAMIENTO
class StorageService {
  static BASE_KEY = 'CIMA_STORAGE_V3';

  static savePatient(profile) {
    const db = this._getDB();
    const key = profile.identificacion.documento_numero;
    if (!key) throw new Error("Documento requerido");
    db.patients[key] = profile;
    this._saveDB(db);
  }

  static getPatient(docId) {
    return this._getDB().patients[docId] || null;
  }

  static saveConsultation(docId, consultationData) {
    const db = this._getDB();
    if (!db.consultations[docId]) db.consultations[docId] = [];
    
    // [FIX FINAL CRÍTICO] Si no hay usuario, crear uno fantasma por defecto
    const currentUser = window.currentUser || { id: 'U-001' };

    if (consultationData.id) {
        const idx = db.consultations[docId].findIndex(c => c.id === consultationData.id);
        if (idx !== -1) {
            const existing = db.consultations[docId][idx];
            db.consultations[docId][idx] = { ...existing, ...consultationData, updatedAt: new Date().toISOString(), createdBy: currentUser.id };
        }
    } else {
        // Nueva
        consultationData.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        consultationData.createdAt = new Date().toISOString();
        consultationData.createdBy = currentUser.id;
        db.consultations[docId].push(consultationData);
    }
    this._saveDB(db);
  }

  static getConsultations(docId) {
    const db = this._getDB();
    return (db.consultations[docId] || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static search(query) {
    const db = this._getDB();
    const q = query.toLowerCase();
    return Object.values(db.patients).filter(p => {
        const name = `${p.nombres.primer_nombre} ${p.nombres.primer_apellido}`.toLowerCase();
        return name.includes(q) || p.identificacion.documento_numero.includes(q);
    });
  }

  static _getDB() {
    const raw = localStorage.getItem(this.BASE_KEY);
    return raw ? JSON.parse(raw) : { patients: {}, consultations: {} };
  }
  static _saveDB(db) { localStorage.setItem(this.BASE_KEY, JSON.stringify(db)); }
}

// [JS-IND-002] CONFIGURACIÓN DE PACIENTE (COMPLETA A-R)
const PATIENT_FIELD_CONFIG = {
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

// [JS-IND-003] RENDERIZADORES
const Views = {
  renderPatientInfo: (container, profile) => {
    container.innerHTML = '';
    const items = [
      { l: "ID", v: `${profile.identificacion.documento_tipo}-${profile.identificacion.documento_numero}` },
      { l: "Edad", v: `${profile.demografia.edad_auto} años` },
      { l: "Contacto", v: profile.contacto.tel_principal || "N/A" },
      { l: "Email", v: profile.contacto.email_principal || "N/A" },
      { l: "Sangre", v: `${profile.datos_biologicos.grupo_sanguineo}${profile.datos_biologicos.factor_rh}` },
      { l: "Alergias", v: profile.alertas_clinicas.alergias_detalle || "Ninguna" }
    ];
    
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'patient-info-item';
      div.innerHTML = `<div class="info-label">${item.l}</div><div class="info-value">${item.v}</div>`;
      container.appendChild(div);
    });
  },

  renderConsultationList: (container, consultations) => {
    container.innerHTML = '';
    if (consultations.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--color-text-dim); padding:20px;">No hay consultas registradas.</p>';
        return;
    }

    consultations.forEach(c => {
      const card = document.createElement('div');
      card.className = 'consultation-item';
      
      const date = new Date(c.createdAt).toLocaleString();
      const modDate = c.updatedAt ? new Date(c.updatedAt) : null;
      const modified = modDate ? `<span style="font-size:0.75rem; color:var(--color-warning);"> (Mod: ${modDate.toLocaleDateString()})</span>` : '';
      const author = c.createdBy || 'Desconocido';

      const summary = c.resumen || c.motivo || "Sin datos de motivo.";

      card.innerHTML = `
        <div class="consultation-header" onclick="window.app.toggleConsultationContent('${c.id}')">
            <div class="consultation-title">
                <i class="fas fa-calendar"></i>
                <span>${date}</span>
            </div>
            <div class="consultation-meta">
                <span>${c.modelo || 'Modelo Desconocido'}</span>
                <span>Por: ${author}</span>
                ${modified}
            </div>
        </div>
        <div class="consultation-content" id="content-${c.id}">
            <div class="consultation-content-inner">
                <div style="margin-bottom:15px;">
                    <strong>Motivo:</strong> ${summary}
                </div>
                <div class="actions-row">
                    <button class="action-btn" onclick="window.app.editConsultation('${c.id}', '${c.modelo}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn secondary">
                        <i class="fas fa-file-pdf"></i> Documentos
                    </button>
                </div>
            </div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  renderPatientForm: (container, data = {}) => {
    container.innerHTML = '';
    
    const getNestedValue = (path, obj) => {
      return path.split('.').reduce((o, k) => (o || {})[k], obj);
    };

    const createField = (sectionKey, fieldConfig, value) => {
      const { key, label, type, options, placeholder, full } = fieldConfig;
      const inputName = `${sectionKey}.${key}`;
      const wrapper = document.createElement('div');
      wrapper.className = `input-group ${full ? 'full-width' : ''}`;
      
      if (type === 'checkbox') {
        wrapper.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; background:rgba(255,255,255,0.05); border-radius:8px; padding-left:10px; border:1px solid var(--color-border);">
            <input type="checkbox" name="${inputName}" id="id_${inputName}" style="width:20px; height:20px;" ${value ? 'checked' : ''}>
            <label for="id_${inputName}" style="margin:0; cursor:pointer; font-weight:600; color:var(--color-text);">${label}</label>
          </div>`;
      } else {
        let inputHtml = '';
        if (type === 'select') {
          inputHtml = `<select name="${inputName}" class="model-select" style="background:rgba(255,255,255,0.05);
