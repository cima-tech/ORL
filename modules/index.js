/* modules/index.js */

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
    
    const currentUser = window.currentUser || { id: 'U-001' };

    if (consultationData.id) {
        const idx = db.consultations[docId].findIndex(c => c.id === consultationData.id);
        if (idx !== -1) {
            const existing = db.consultations[docId][idx];
            db.consultations[docId][idx] = { ...existing, ...consultationData, updatedAt: new Date().toISOString(), createdBy: currentUser.id };
        }
    } else {
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

// [JS-IND-004] APLICACIÓN PRINCIPAL (CON LÓGICA DE JSON Y ROLES)
/* modules/index.js -> Clase App (V6 CORRECCIÓN CONTEXTO DEFINITIVA) */

class App {
  constructor() {
    this.currentUser = null;
    this.currentPatient = null;
    this.currentEditingConsultationId = null;
  }

  // [HELPERS] Métodos de Datos (Puestos al principio para evitar "Not a Function")
  sanitizePatientData(formData) {
      const raw = { 
          identificacion: {}, nombres: {}, demografia: {}, datos_biologicos: {}, contacto: {}, redes_sociales: {}, 
          contacto_emergencia: {}, alertas_clinicas: {}, seguridad_prioritaria: {}, datos_administrativos: {},
          antecedentes_personales: {}, historial_quirurgico: {}, hospitalizaciones: {}, 
          lesiones_y_fracturas: {}, antecedentes_familiares: {}, habitos: {}, contexto_social: {}, 
          consentimientos: {}
      };
      
      formData.forEach((value, key) => {
          const parts = key.split('.');
          let target = raw;
          for (let i = 0; i < parts.length - 1; i++) {
              if (!target[parts[i]]) target[parts[i]] = {};
              target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = value;
      });

      ['identificacion', 'nombres', 'demografia', 'datos_biologicos', 'contacto', 'redes_sociales', 'contacto_emergencia',
       'seguridad_prioritaria', 'datos_administrativos', 'historial_quirurgico', 'hospitalizaciones', 'lesiones_y_fracturas',
       'contexto_social', 'consentimientos'].forEach(sec => {
         if(PATIENT_FIELD_CONFIG[sec]) {
            PATIENT_FIELD_CONFIG[sec].fields.forEach(f => {
               if(f.type === 'checkbox') {
                   const key = `${sec}.${f.key}`;
                   if(!raw[sec][f.key]) raw[sec][f.key] = false;
               }
            });
         }
      });
      ['antecedentes_personales', 'antecedentes_familiares'].forEach(sec => {
         if(PATIENT_FIELD_CONFIG[sec] && PATIENT_FIELD_CONFIG[sec].items) {
            PATIENT_FIELD_CONFIG[sec].items.forEach(f => {
               const key = `${sec}.${f.key}`;
               if(!raw[sec][f.key]) raw[sec][f.key] = false;
            });
         }
      });
      ['alertas_clinicas'].forEach(sec => {
         if(PATIENT_FIELD_CONFIG[sec] && PATIENT_FIELD_CONFIG[sec].items) {
            PATIENT_FIELD_CONFIG[sec].items.forEach(f => {
               const key = `${sec}.${f.key}_check`;
               if(!raw[sec][f.key+'_check']) raw[sec][f.key+'_check'] = false;
            });
         }
      });

      return raw;
  }

  async init() {
    // [1] INICIALIZACIÓN DE USUARIO
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    
    try {
        const response = await fetch('user/user-001/user-001.json');
        if (response.ok) {
            const jsonData = await response.json();
            if (jsonData.role !== 'Doctor') {
                this.loadGuestMode();
                return;
            }
            this.currentUser = new UserProfile(null, jsonData);
            window.currentUser = this.currentUser;
            if(userInfoDisplay) userInfoDisplay.textContent = `${this.currentUser.getDisplayTitle()} (${this.currentUser.getDisplayRole()})`;
        } else {
            throw new Error("404");
        }
    } catch (e) {
        console.warn("Error usuario -> Invitado");
        this.loadGuestMode();
    }

    // [2] CARGA DE MODELOS (Lectura de consultmodels.json)
    await this.loadAvailableModels();

    // [3] LISTENERS
    document.getElementById('btnHome').onclick = () => this.showDashboard();
    document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
    document.getElementById('btnTheme').onclick = () => this.toggleTheme();
    const btnAgenda = document.getElementById('btnAgenda');
    if(btnAgenda) btnAgenda.onclick = () => alert("Próximamente...");
    const btnSearch = document.getElementById('btnSearch');
    if(btnSearch) btnSearch.onclick = () => this.showSearchModal();

    this.showDashboard();
  }

  async loadAvailableModels() {
      const select = document.getElementById('newConsultModelSelect');
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Cargando...</option>';
      const validModels = [];
      let defaultSelected = null;

      try {
          const response = await fetch('modules/consultmodels.json');
          if (response.ok) {
              const registry = await response.json();
              for (const item of registry) {
                  try {
                      await import(`../consultmodels/${item.id}.js`);
                      validModels.push(item);
                      if (this.currentUser.state.professional.defaultConsultationModel === item.id) {
                          defaultSelected = item.id;
                      }
                  } catch (e) {
                      console.warn(`Modelo inválido: ${item.id}`);
                  }
              }
          }
      } catch (e) {
          console.warn("No se pudo leer consultmodels.json");
      }

      select.innerHTML = '';
      if (validModels.length === 0) {
          const opt = document.createElement('option');
          opt.text = "No hay modelos";
          select.appendChild(opt);
      } else {
          validModels.forEach((m) => {
              const opt = document.createElement('option');
              opt.value = m.id;
              opt.textContent = m.name;
              select.appendChild(opt);
          });
          select.value = defaultSelected || validModels[0].id;
      }
  }

  loadGuestMode() {
      this.currentUser = new UserProfile(null);
      window.currentUser = this.currentUser;
      const display = document.getElementById('userInfoDisplay');
      if(display) {
          display.textContent = "Invitado";
          display.style.color = "var(--color-text-dim)";
      }
  }

  toggleTheme() {
    document.body.classList.toggle('light-mode');
  }

  showDashboard() {
    const dView = document.getElementById('dashboardView');
    const pView = document.getElementById('patientView');
    if(dView) dView.classList.remove('hidden');
    if(pView) pView.classList.add('hidden');
    this.currentPatient = null;
  }

  showPatientView(patientId) {
    if (!patientId) { this.showDashboard(); return; }
    this.currentPatient = StorageService.getPatient(patientId);
    if (!this.currentPatient) { alert("Paciente no encontrado"); return; }

    const dView = document.getElementById('dashboardView');
    const pView = document.getElementById('patientView');
    if(dView) dView.classList.add('hidden');
    if(pView) pView.classList.remove('hidden');

    const title = document.getElementById('patientHeaderTitle');
    if(title) title.textContent = `PACIENTE: ${this.currentPatient.nombres.primer_nombre} ${this.currentPatient.nombres.primer_apellido} (${patientId})`;
    
    const infoCont = document.getElementById('patientInfoContainer');
    if(infoCont) Views.renderPatientInfo(infoCont, this.currentPatient);

    const consults = StorageService.getConsultations(patientId);
    const count = document.getElementById('consultationsCount');
    if(count) count.textContent = `CONSULTAS (${consults.length})`;
    
    const list = document.getElementById('consultationListContainer');
    if(list) Views.renderConsultationList(list, consults);

    const pSec = document.getElementById('patientSection');
    if(pSec) {
        const pContent = pSec.querySelector('.section-content');
        if(pContent) {
            pContent.classList.add('expanded');
            pContent.style.maxHeight = "1000px";
        }
    }
  }
  
  editCurrentPatient() {
      if (!this.currentPatient) return alert("No hay paciente seleccionado");

      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      const saveBtn = document.getElementById('btnSaveConsultation');

      if(title) title.textContent = "Editar Ficha Paciente";
      if(saveBtn) saveBtn.textContent = "Guardar Cambios"; // Texto corregido
      
      if(body) {
          body.innerHTML = ''; 
          Views.renderPatientForm(body, this.currentPatient);
          modal.classList.add('active');
          
          // CLONACIÓN LIMPIA DE BOTÓN PARA EVITAR DOBLES
          const newBtn = saveBtn.cloneNode(true);
          if(saveBtn) {
              saveBtn.parentNode.replaceChild(newBtn, saveBtn);
              newBtn.onclick = () => {
                  const inputs = body.querySelectorAll('input, select, textarea');
                  const formData = new FormData();
                  inputs.forEach(input => { 
                      if(input.name) {
                          formData.append(input.name, input.type === 'checkbox' ? input.checked : input.value); 
                      }
                  });

                  try {
                      // FIX: Usar window.app para asegurar que encuentra la función
                      const raw = window.app.sanitizePatientData(formData);
                      raw.identificacion.uuid = this.currentPatient.identificacion.uuid; 
                      
                      const p = new PatientProfile(raw);
                      StorageService.savePatient(p);
                      
                      alert("Ficha actualizada exitosamente");
                      this.closeModal();
                      this.showPatientView(p.identificacion.documento_numero);
                  } catch(e) { alert("Error al guardar: " + e.message); }
              };
          }
      }
  }

  createNewPatientWorkflow() {
      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      const saveBtn = document.getElementById('btnSaveConsultation');

      if(title) title.textContent = "Nuevo Paciente";
      
      if(body) {
          body.innerHTML = ''; 
          Views.renderPatientForm(body, {});
          modal.classList.add('active');
      }
      
      if(saveBtn) {
          saveBtn.textContent = "Crear Paciente"; // Texto corregido
          
          saveBtn.onclick = () => {
              const inputs = body.querySelectorAll('input, select, textarea');
              const formData = new FormData();
              inputs.forEach(input => {
                  if (input.name) {
                      if (input.type === 'checkbox') {
                          formData.append(input.name, input.checked);
                      } else {
                          formData.append(input.name, input.value);
                      }
                  }
              });

              try {
                  // FIX: Usar window.app
                  const raw = window.app.sanitizePatientData(formData);
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
  }

  openNewConsultationUI() {
      const modelSelect = document.getElementById('newConsultModelSelect');
      if(!modelSelect) return alert("Error crítico: Select no encontrado");
      const selectedModel = modelSelect.value;
      this.openConsultationModal(null, selectedModel);
  }

  async editConsultation(consultationId, modelId) {
      this.currentEditingConsultationId = consultationId;
      if(!this.currentPatient) return alert("No hay paciente activo");
      
      const consults = StorageService.getConsultations(this.currentPatient.identificacion.documento_numero);
      const data = consults.find(c => c.id === consultationId);
      this.openConsultationModal(data, modelId);
  }

  async openConsultationModal(data, modelId) {
      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      const saveBtn = document.getElementById('btnSaveConsultation');

      if(title) title.textContent = data ? `Editar Consulta (${data.id})` : "Nueva Consulta";
      if(saveBtn) saveBtn.textContent = "Guardar Consulta";
      
      if(body) {
          body.innerHTML = '<div style="text-align:center; padding:50px; color:var(--accent-blue);">Cargando modelo ' + modelId + '...</div>';
          modal.classList.add('active');
      }

      try {
          const module = await import(`../consultmodels/${modelId}.js`);
          
          if (!module.MODEL_DEFINITION) {
              throw new Error("El archivo no exporta MODEL_DEFINITION.");
          }

          if(body) body.innerHTML = '';
          module.MODEL_DEFINITION.initUI(body, data || {});

          if(saveBtn) {
              const newBtn = saveBtn.cloneNode(true);
              if(saveBtn) {
                  saveBtn.parentNode.replaceChild(newBtn, saveBtn);
                  
                  newBtn.onclick = async () => {
                      try {
                          const consultData = module.MODEL_DEFINITION.getData(body);
                          
                          consultData.modelo = modelId;
                          if(this.currentPatient) {
                              consultData.pacienteId = this.currentPatient.identificacion.documento_numero;
                          }
                          
                          if (data) consultData.id = data.id;

                          consultData.resumen = module.MODEL_DEFINITION.getSummary ? module.MODEL_DEFINITION.getSummary(consultData) : consultData.motivo;

                          if(this.currentPatient) {
                              StorageService.saveConsultation(this.currentPatient.identificacion.documento_numero, consultData);
                              alert("Consulta guardada exitosamente");
                              this.closeModal();
                              this.showPatientView(this.currentPatient.identificacion.documento_numero);
                          }
                      } catch(e) {
                          console.error(e);
                          alert("Error al guardar: " + e.message);
                      }
                  };
              }
          }

      } catch (err) {
          console.error("Error cargando modelo:", err);
          if(body) {
              body.innerHTML = `
                <div style="color:var(--color-error); text-align:center; padding:20px;">
                      <h3>Error Crítico</h3>
                      <p>No se pudo cargar el modelo ${modelId}.</p>
                      <p style="font-size:0.8rem; color:var(--text-dim);">${err.message}</p>
                      <p>Verifica que existe en consultmodels/ y revisa la consola.</p>
                </div>`;
          }
          const btnSave = document.getElementById('btnSaveConsultation');
          if(btnSave) btnSave.disabled = true;
      }
  }

  showSearchModal() {
      const modal = document.getElementById('searchModal');
      const input = document.getElementById('searchInput');
      
      if(modal && input) {
          document.getElementById('searchModal').classList.add('active');
          input.value = '';
          input.focus();
          
          input.oninput = () => {
              const q = input.value;
              if(q.length < 2) return;
              const results = StorageService.search(q);
              const div = document.getElementById('searchResults');
              if(div) {
                  div.innerHTML = results.map(p => `
                      <div class="patient-info-item" style="cursor:pointer; margin-bottom:10px;" onclick="window.app.showPatientView('${p.identificacion.documento_numero}'); document.getElementById('searchModal').classList.remove('active');">
                          <strong>${p.nombres.primer_nombre} ${p.nombres.primer_apellido}</strong> (${p.identificacion.documento_numero})
                      </div>
                  `).join('');
              }
          };
      }
  }

  toggleSection(id) {
      const sec = document.getElementById(id);
      if (!sec) return;
      const content = sec.querySelector('.section-content');
      const icon = sec.querySelector('.section-toggle i');
      
      if (content && icon) {
          if (content.classList.contains('expanded')) {
              content.classList.remove('expanded');
              content.style.maxHeight = "0";
              icon.className = "fas fa-chevron-down";
          } else {
              content.classList.add('expanded');
              content.style.maxHeight = "2000px";
              icon.className = "fas fa-chevron-up";
          }
      }
  }

  toggleConsultationContent(id) {
      const content = document.getElementById(`content-${id}`);
      if(content) content.classList.toggle('expanded');
  }

  closeModal() {
      const modal = document.getElementById('editModal');
      if(modal) modal.classList.remove('active');
      this.currentEditingConsultationId = null;
  }
}

// Inicializar
window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());

