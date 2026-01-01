/* modules/index.js */

/*
  [GLOSARIO-INDEX]
  StorageService -> Persistencia Local
  PatientFieldConfig -> Esquema completo del paciente
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
    
    // Si tiene ID, es actualización. Si no, es nueva.
    if (consultationData.id) {
        const idx = db.consultations[docId].findIndex(c => c.id === consultationData.id);
        if (idx !== -1) {
            // Merge de datos para mantener metadatos
            const existing = db.consultations[docId][idx];
            db.consultations[docId][idx] = { ...existing, ...consultationData, updatedAt: new Date().toISOString() };
        }
    } else {
        // Nueva
        consultationData.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        consultationData.createdAt = new Date().toISOString();
        consultationData.createdBy = window.currentUser.id;
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
  // Renderiza los datos del paciente en el Grid de "Paciente"
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

  // Renderiza la lista de consultas (Modo Resumen)
  renderConsultationList: (container, consultations) => {
    container.innerHTML = '';
    if (consultations.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--color-text-dim); padding:20px;">No hay consultas registradas.</p>';
        return;
    }

    consultations.forEach(c => {
      const card = document.createElement('div');
      card.className = 'consultation-item';
      
      // Datos de auditoría para mostrar
      const date = new Date(c.createdAt).toLocaleString();
      const modified = c.updatedAt ? `<span style="font-size:0.75rem; color:var(--color-warning);"> (Mod: ${new Date(c.updatedAt).toLocaleDateString()})</span>` : '';
      const author = c.createdBy || 'Desconocido';

      // Intentamos obtener resumen del modelo (si estuviera cargado) o fallback
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

  // Renderiza el formulario de creación de paciente (en Modal o nueva vista)
  renderPatientForm: (container, data = {}) => {
    container.innerHTML = '';
    
    // Función auxiliar para obtener valor anidado de forma segura
    const getNestedValue = (path, obj) => {
      return path.split('.').reduce((o, k) => (o || {})[k], obj);
    };

    // Función auxiliar para crear inputs
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
        // Select con estilo glass
        if (type === 'select') {
          inputHtml = `<select name="${inputName}" class="model-select" style="background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px;">
            <option value="">Seleccione...</option>${options.map(o => `<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('')}
          </select>`;
        } else if (type === 'textarea') {
          inputHtml = `<textarea name="${inputName}" rows="3" class="model-select" style="background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text);" placeholder="${placeholder||''}">${value||''}</textarea>`;
        } else {
          inputHtml = `<input type="${type}" name="${inputName}" value="${value||''}" class="model-select" style="background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text);" placeholder="${placeholder||''}" step="${fieldConfig.step || 'any'}">`;
        }
        wrapper.innerHTML = `<label style="font-size:0.85rem; font-weight:600; color:var(--text-dim);">${label}</label>${inputHtml}`;
      }
      return wrapper;
    };

    const formCard = document.createElement('div');
    formCard.className = 'glass-panel';
    formCard.style.padding = "20px";

    // Iterar sobre TODAS las secciones de configuración (Tu A-R)
    Object.entries(PATIENT_FIELD_CONFIG).forEach(([secKey, secConfig]) => {
      const secDiv = document.createElement('div');
      secDiv.style.marginBottom = "30px";
      secDiv.style.borderBottom = "1px solid var(--color-border)";
      secDiv.style.paddingBottom = "15px";

      const title = document.createElement('h3');
      title.textContent = secConfig.label;
      title.style.color = "var(--accent-blue)";
      title.style.marginBottom = "15px";
      title.style.fontSize = "1.1rem";
      secDiv.appendChild(title);

      const row = document.createElement('div');
      row.className = 'input-row';

      // Manejar tipos complejos (Checklists)
      if (secConfig.type === 'checkbox_list') {
        secConfig.items.forEach(item => {
          const val = getNestedValue(`${secKey}.${item.key}`, data);
          row.appendChild(createField(secKey, { ...item, type: 'checkbox' }, val));
        });
        if (secConfig.extra_field) {
          const val = getNestedValue(`${secKey}.${secConfig.extra_field}`, data);
          const div = document.createElement('div');
          div.className = 'input-group full-width';
          div.innerHTML = `<label>Otros / Detalles</label><textarea name="${secKey}.${secConfig.extra_field}" rows="2" class="model-select" style="background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text);">${val||''}</textarea>`;
          row.appendChild(div);
        }
      } 
      else if (secConfig.type === 'group_check_detail') {
        secConfig.items.forEach(item => {
          const valCheck = getNestedValue(`${secKey}.${item.key}_check`, data);
          const valDetail = getNestedValue(`${secKey}.${item.key}_detalle`, data);
          
          const group = document.createElement('div');
          group.className = 'glass-panel';
          group.style.padding = "10px";
          group.style.background = "rgba(255,255,255,0.05)";
          group.style.border = "1px solid var(--color-border)";
          group.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="checkbox" name="${secKey}.${item.key}_check" style="width:auto;" ${valCheck ? 'checked' : ''}>
              <label style="margin:0; font-weight:bold; color:var(--color-text);">${item.label}</label>
            </div>
            <input type="text" name="${secKey}.${item.key}_detalle" value="${valDetail||''}" placeholder="Especifique..." style="margin-top:5px; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:8px;">
          `;
          row.appendChild(group);
        });
      } 
      else {
        // Campos estándar
        secConfig.fields.forEach(field => {
          const val = getNestedValue(`${secKey}.${field.key}`, data);
          row.appendChild(createField(secKey, field, val));
        });
      }

      secDiv.appendChild(row);
      formCard.appendChild(secDiv);
    });

    container.appendChild(formCard);
  }
};

// [JS-IND-004] APLICACIÓN PRINCIPAL
class App {
  constructor() {
    this.currentUser = null;
    this.currentPatient = null;
    this.currentEditingConsultationId = null;
  }

  async init() {
    // 1. Cargar Usuario (Valentina Hardcoded por ahora)
    this.currentUser = {
        id: "user-001",
        names: "Valentina",
        lastNames: "Gonzalez Yanez",
        defaultModel: "ORL-001"
    };
    document.getElementById('userInfoDisplay').textContent = 
        `Dra. ${this.currentUser.names} ${this.currentUser.lastNames}`;

    // Listeners del Dock
    document.getElementById('btnHome').onclick = () => this.showDashboard();
    document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
    document.getElementById('btnTheme').onclick = () => this.toggleTheme();

    this.showDashboard();
  }

  toggleTheme() {
    document.body.classList.toggle('light-mode');
  }

  showDashboard() {
    document.getElementById('dashboardView').classList.remove('hidden');
    document.getElementById('patientView').classList.add('hidden');
    this.currentPatient = null;
  }

  showPatientView(patientId) {
    this.currentPatient = StorageService.getPatient(patientId);
    if (!this.currentPatient) { alert("Paciente no encontrado"); return; }

    // UI
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('patientView').classList.remove('hidden');

    // Llenar Datos
    document.getElementById('patientHeaderTitle').textContent = 
        `PACIENTE: ${this.currentPatient.nombres.primer_nombre} ${this.currentPatient.nombres.primer_apellido} (${patientId})`;
    
    Views.renderPatientInfo(document.getElementById('patientInfoContainer'), this.currentPatient);

    // Listar Consultas
    const consults = StorageService.getConsultations(patientId);
    document.getElementById('consultationsCount').textContent = `CONSULTAS (${consults.length})`;
    Views.renderConsultationList(document.getElementById('consultationListContainer'), consults);

    // Expandir sección paciente por defecto
    const pSec = document.getElementById('patientSection');
    const pContent = pSec.querySelector('.section-content');
    pContent.classList.add('expanded');
    pContent.style.maxHeight = "1000px";
  }
  
  editCurrentPatient() {
      if (!this.currentPatient) return alert("No hay paciente seleccionado");

      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      const btn = document.getElementById('btnSaveConsultation');

      title.textContent = "Editar Ficha Paciente";
      btn.textContent = "Guardar Cambios";
      
      body.innerHTML = ''; 
      // IMPORTANTE: Pasamos 'this.currentPatient' para que el formulario se llene con los datos existentes
      Views.renderPatientForm(body, this.currentPatient);
      modal.classList.add('active');
      
      // Reutilizamos la lógica de recolección manual que creamos antes
      btn.onclick = () => {
          const inputs = body.querySelectorAll('input, select, textarea');
          const formData = new FormData();
          inputs.forEach(input => {
              if (input.name) {
                  formData.append(input.name, input.type === 'checkbox' ? input.checked : input.value);
              }
          });

          try {
              const raw = this.sanitizePatientData(formData);
              // IMPORTANTE: Pasamos el UUID existente para que no cree uno nuevo
              raw.identificacion.uuid = this.currentPatient.identificacion.uuid; 
              
              const p = new PatientProfile(raw);
              StorageService.savePatient(p);
              
              alert("Ficha actualizada exitosamente");
              this.closeModal();
              this.showPatientView(p.identificacion.documento_numero); // Recargar vista
          } catch(e) { alert("Error al guardar: " + e.message); }
      };
  }

    viewFullHistory() {
      if (!this.currentPatient) return;
      // Por ahora, esto abrirá el formulario de edición en modo lectura
      // para que puedas ver todos los datos detallados del paciente.
      // En el futuro esto podría abrir un PDF o una vista más detallada.
      alert("La ficha actual (Paciente) contiene toda la historia clínica. \nPara revisar detalles específicos, use la opción 'Editar Ficha'.");
  }
  
  // [FIX-001] SANITIZACIÓN DE BOOLEANOS PARA PATIENT PROFILE
  sanitizePatientData(formData) {
      const raw = { 
          identificacion: {}, nombres: {}, demografia: {}, alertas_clinicas: {} 
      };
      
      // 1. Llenar con lo que llegó del form
      formData.forEach((value, key) => {
          const parts = key.split('.');
          let target = raw;
          for (let i = 0; i < parts.length - 1; i++) {
              if (!target[parts[i]]) target[parts[i]] = {};
              target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = value;
      });

      // 2. CORRECCIÓN: Forzar booleanos falsos
      // Iterar la configuración conocida para asegurar que los checks no marcados sean false
      // Nota: En una app real, iteraríamos recursivamente PATIENT_FIELD_CONFIG.
      // Aquí hacemos un parche específico para las alertas_clinicas que definimos.
      if (!raw.alertas_clinicas.alergias_check) raw.alertas_clinicas.alergias_check = false;

      return raw;
  }

  createNewPatientWorkflow() {
      // Abrir Modal
      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      document.getElementById('modalTitle').textContent = "Nuevo Paciente";
      
      body.innerHTML = ''; 
      Views.renderPatientForm(body, {});
      
      modal.classList.add('active');
      
      document.getElementById('btnSaveConsultation').onclick = () => {
          // [FIX-003] RECOLECCIÓN MANUAL DE DATOS
          // Como no hay etiqueta <form>, no podemos usar new FormData(body).
          // Tenemos que buscar inputs uno por uno y llenar un FormData vacío.
          
          const inputs = body.querySelectorAll('input, select, textarea');
          const formData = new FormData(); // Creamos uno nuevo vacío
          
          inputs.forEach(input => {
              if (input.name) {
                  if (input.type === 'checkbox') {
                      // Para checkboxes, guardamos true/false explícito
                      formData.append(input.name, input.checked);
                  } else {
                      // Para el resto, el valor del input
                      formData.append(input.name, input.value);
                  }
              }
          });

          try {
              // Ahora pasamos este formData manual a tu lógica de saneamiento
              const raw = this.sanitizePatientData(formData);
              const p = new PatientProfile(raw);
              StorageService.savePatient(p);
              
              alert("Paciente creado exitosamente");
              this.closeModal();
              this.showPatientView(p.identificacion.documento_numero);
          } catch(e) {
              console.error(e);
              alert("Error al guardar paciente: " + e.message);
          }
      };
  }

  // [LOGIC-003] FLUJO DE CONSULTAS
  openNewConsultationUI() {
      const modelSelect = document.getElementById('newConsultModelSelect');
      const selectedModel = modelSelect.value;
      this.openConsultationModal(null, selectedModel);
  }

  async editConsultation(consultationId, modelId) {
      this.currentEditingConsultationId = consultationId;
      const consults = StorageService.getConsultations(this.currentPatient.identificacion.documento_numero);
      const data = consults.find(c => c.id === consultationId);
      this.openConsultationModal(data, modelId);
  }

  async openConsultationModal(data, modelId) {
      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      const btn = document.getElementById('btnSaveConsultation');

      title.textContent = data ? `Editar Consulta (${data.id})` : "Nueva Consulta";
      // Cambiar texto del botón para evitar confusiones
      btn.textContent = "Guardar Consulta";
      
      body.innerHTML = '<div style="text-align:center; padding:50px; color:var(--accent-blue);">Cargando modelo ' + modelId + '...</div>';
      modal.classList.add('active');

      try {
          // [POINT 4] CARGA DINÁMICA DEL MODELO
          // Nota: Esta ruta es RELATIVA a la ubicación de index.js (dentro de modules/)
          // La ruta para ir a consultmodels es ../consultmodels/
          const module = await import(`../consultmodels/${modelId}.js`);
          
          // Verificar que el contrato exista
          if (!module.MODEL_DEFINITION) {
              throw new Error("El archivo no exporta MODEL_DEFINITION. Revisa el parche en ORL-001.js");
          }

          // Limpiar
          body.innerHTML = '';

          // Inicializar UI del Modelo en el Modal
          // Pasamos 'data' si existe (edición) o {} (nuevo)
          module.MODEL_DEFINITION.initUI(body, data || {});

          // Configurar botón guardar
          // Quitamos listeners anteriores clonando el botón para evitar dobles clicks
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);
          
          newBtn.onclick = async () => {
              try {
                  // Obtener datos del modelo
                  const consultData = module.MODEL_DEFINITION.getData(body);
                  
                  // Metadatos del sistema
                  consultData.modelo = modelId;
                  consultData.pacienteId = this.currentPatient.identificacion.documento_numero;
                  
                  // Si es edición, mantenemos el ID
                  if (data) consultData.id = data.id;

                  // Generar resumen para la lista
                  consultData.resumen = module.MODEL_DEFINITION.getSummary ? module.MODEL_DEFINITION.getSummary(consultData) : consultData.motivo;

                  StorageService.saveConsultation(this.currentPatient.identificacion.documento_numero, consultData);
                  alert("Consulta guardada exitosamente");
                  this.closeModal();
                  this.showPatientView(this.currentPatient.identificacion.documento_numero); // Recargar
              } catch(e) {
                  console.error(e);
                  alert("Error al guardar: " + e.message);
              }
          };

      } catch (err) {
          console.error("Error cargando modelo:", err);
          body.innerHTML = `
            <div style="color:var(--color-error); text-align:center; padding:20px;">
                  <h3>Error Crítico</h3>
                  <p>No se pudo cargar el modelo ${modelId}.</p>
                  <p style="font-size:0.8rem; color:var(--text-dim);">${err.message}</p>
                  <p>Verifica la consola (F12) para más detalles.</p>
            </div>`;
          // Desactivar botón para evitar clicks
          const btn = document.getElementById('btnSaveConsultation');
          if(btn) btn.disabled = true;
      }
  }

  closeModal() {
      document.getElementById('editModal').classList.remove('active');
      this.currentEditingConsultationId = null;
  }

  // Helpers de UI del Mockup
  toggleSection(id) {
      const sec = document.getElementById(id);
      const content = sec.querySelector('.section-content');
      const icon = sec.querySelector('.section-toggle i');
      
      if (content.classList.contains('expanded')) {
          content.classList.remove('expanded');
          content.style.maxHeight = "0";
          icon.className = "fas fa-chevron-down";
      } else {
          content.classList.add('expanded');
          content.style.maxHeight = "2000px"; // Altura arbitraria grande
          icon.className = "fas fa-chevron-up";
      }
  }

  toggleConsultationContent(id) {
      const content = document.getElementById(`content-${id}`);
      content.classList.toggle('expanded');
  }
}

// Inicializar
window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());




