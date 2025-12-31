/* modules/index.js */

/*
  [GLOSARIO-INDEX]
  StorageService -> Abstracción de LocalStorage
  App -> Controlador principal de la aplicación
  Views -> Manejadores de renderizado (AHORA COMPLETO)
  PATIENT_FIELD_CONFIG -> Esquema completo de mapeo UI para PatientProfile
*/

import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';
import { ORL_MODULE } from '../consultmodels/ORL-001.js';

// [JS-IND-001] SERVICIO DE ALMACENAMIENTO LOCAL
class StorageService {
  static BASE_KEY = 'CIMA_STORAGE_V2';

  static savePatient(patientProfile) {
    const db = this._getDB();
    const key = patientProfile.identificacion.documento_numero;
    if (!key) throw new Error("Documento de paciente requerido");
    db.patients[key] = patientProfile;
    this._saveDB(db);
    console.log(`[Storage] Guardado: ${key}`);
  }

  static getPatient(documentId) {
    const db = this._getDB();
    return db.patients[documentId] || null;
  }

  static searchPatients(query) {
    const db = this._getDB();
    const lowerQ = query.toLowerCase();
    return Object.values(db.patients).filter(p => {
      const fullName = `${p.nombres.primer_nombre} ${p.nombres.primer_apellido}`.toLowerCase();
      return fullName.includes(lowerQ) || p.identificacion.documento_numero.includes(lowerQ);
    });
  }

  static saveConsultation(documentId, consultationData) {
    const db = this._getDB();
    if (!db.consultations[documentId]) db.consultations[documentId] = [];
    consultationData.timestamp = new Date().toISOString();
    db.consultations[documentId].push(consultationData);
    this._saveDB(db);
  }

  static getConsultations(documentId) {
    const db = this._getDB();
    return db.consultations[documentId] || [];
  }

  static _getDB() {
    const raw = localStorage.getItem(this.BASE_KEY);
    return raw ? JSON.parse(raw) : { patients: {}, consultations: {} };
  }

  static _saveDB(db) {
    localStorage.setItem(this.BASE_KEY, JSON.stringify(db));
  }
}

// [JS-IND-002] CONFIGURACIÓN DE CAMPOS COMPLETA
// Mapea cada propiedad de PatientProfile a su configuración de UI (Tipo, Etiqueta, Opciones)
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
    type: "group_check_detail", // Tipo especial
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
    type: "checkbox_list", // Tipo especial
    items: [
      { key: "hipertension", label: "Hipertensión Arterial" },
      { key: "diabetes", label: "Diabetes Mellitus" },
      { key: "asma", label: "Asma Bronquial" },
      { key: "cardiopatias", label: "Cardiopatías" },
      { key: "epilepsia", label: "Epilepsia/Convulsiones" },
      { key: "tiroideos", label: "Patología Tiroidea" }
    ],
    extra_field: "otros" // Textarea para "Otros"
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

// [JS-IND-003] RENDERIZADOR INTELIGENTE
const Views = {
  // Genera el formulario basado en la configuración completa
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
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; background:rgba(255,255,255,0.3); border-radius:8px; padding-left:10px;">
            <input type="checkbox" name="${inputName}" id="id_${inputName}" style="width:20px; height:20px;" ${value ? 'checked' : ''}>
            <label for="id_${inputName}" style="margin:0; cursor:pointer; font-weight:600; color:var(--text-primary);">${label}</label>
          </div>`;
      } else {
        let inputHtml = '';
        if (type === 'select') {
          inputHtml = `<select name="${inputName}"><option value="">Seleccione...</option>${options.map(o => `<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('')}</select>`;
        } else if (type === 'textarea') {
          inputHtml = `<textarea name="${inputName}" rows="3" placeholder="${placeholder||''}">${value||''}</textarea>`;
        } else {
          inputHtml = `<input type="${type}" name="${inputName}" value="${value||''}" placeholder="${placeholder||''}" step="${fieldConfig.step || 'any'}">`;
        }
        wrapper.innerHTML = `<label>${label}</label>${inputHtml}`;
      }
      return wrapper;
    };

    const formCard = document.createElement('div');
    formCard.className = 'glass-panel';
    formCard.style.padding = "20px";

    // Iterar sobre TODAS las secciones de configuración
    Object.entries(PATIENT_FIELD_CONFIG).forEach(([secKey, secConfig]) => {
      const secDiv = document.createElement('div');
      secDiv.style.marginBottom = "30px";
      secDiv.style.borderBottom = "1px solid rgba(37, 99, 235, 0.1)";
      secDiv.style.paddingBottom = "15px";

      const title = document.createElement('h3');
      title.textContent = secConfig.label;
      title.style.color = "var(--accent-blue)";
      title.style.marginBottom = "15px";
      title.style.fontSize = "1.1rem";
      secDiv.appendChild(title);

      const row = document.createElement('div');
      row.className = 'input-row';

      // Manejar tipos complejos
      if (secConfig.type === 'checkbox_list') {
        secConfig.items.forEach(item => {
          const val = getNestedValue(`${secKey}.${item.key}`, data);
          row.appendChild(createField(secKey, { ...item, type: 'checkbox' }, val));
        });
        if (secConfig.extra_field) {
          const val = getNestedValue(`${secKey}.${secConfig.extra_field}`, data);
          const div = document.createElement('div');
          div.className = 'input-group full-width';
          div.innerHTML = `<label>Otros / Detalles</label><textarea name="${secKey}.${secConfig.extra_field}" rows="2">${val||''}</textarea>`;
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
          group.style.background = "rgba(255,255,255,0.2)";
          group.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="checkbox" name="${secKey}.${item.key}_check" style="width:auto;" ${valCheck ? 'checked' : ''}>
              <label style="margin:0; font-weight:bold;">${item.label}</label>
            </div>
            <input type="text" name="${secKey}.${item.key}_detalle" value="${valDetail||''}" placeholder="Especifique..." style="margin-top:5px;">
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
  },

  // Renderiza la consulta ORL (Sin cambios mayores, solo llamadas a ORL)
  renderConsultationForm: (container) => {
    container.innerHTML = `
      <div class="glass-panel card-visit">
        <div class="visit-header">
          <span class="badge">Nueva Consulta</span>
          <div style="font-size:0.8rem; color:var(--text-secondary);">${new Date().toLocaleString()}</div>
        </div>
        
        <div class="input-row">
          <div class="col">
            <label>Enfermedad Actual</label>
            <textarea class="txt-ea" rows="3"></textarea>
          </div>
        </div>

        <div class="input-row">
          <div class="col">
            <label>Motivo</label>
            <input type="text" class="txt-motivo">
            <div class="chips-container chips-motivo"></div>
          </div>
        </div>

        <div class="input-row">
          <div class="col">
            <label>Antecedentes Personales</label>
            <input type="text" class="txt-ap">
            <div class="chips-container chips-ap"></div>
          </div>
        </div>

        <div class="input-row">
          <div class="col">
            <label>Examen Físico</label>
            <button type="button" id="btnTogglePE" class="btn-ghost" style="margin-bottom:10px;">Mostrar Examen</button>
            <div class="pe-panels hidden"></div>
          </div>
        </div>

        <div class="input-row" style="margin-top:20px;">
          <div class="col">
            <label>Diagnóstico</label>
            <input type="text" class="txt-dx">
            <div class="chips-container chips-dx"></div>
          </div>
        </div>

        <div class="input-row" style="margin-top:20px;">
          <div class="col" style="flex:1">
            <label>Recipe</label>
            <textarea class="txt-recipe" rows="4"></textarea>
            <div class="recipe-chips-container" style="margin-top:10px;"></div>
          </div>
          <div class="col" style="flex:1">
            <label>Indicaciones (Auto)</label>
            <div class="indicaciones-dropdowns"></div>
            <textarea class="txt-indicaciones" rows="4" style="margin-top:10px;"></textarea>
          </div>
        </div>

        <div class="input-row" style="margin-top:20px;">
          <div class="col">
            <label>Plan y Tratamiento</label>
            <textarea class="txt-plan" rows="4"></textarea>
          </div>
        </div>

        <div class="input-row" style="margin-top:20px; justify-content:flex-end;">
          <button class="btn btn-primary" id="btnSaveConsult">Guardar Consulta</button>
          <button class="btn btn-ghost" id="btnPreviewInf">Ver Informe</button>
        </div>
      </div>
    `;

    // Inicializar lógica de ORL
    ORL_MODULE.UI.init(container);

    container.querySelector('#btnTogglePE').onclick = function() {
      const pe = container.querySelector('.pe-panels');
      pe.classList.toggle('hidden');
      this.textContent = pe.classList.contains('hidden') ? 'Mostrar Examen' : 'Ocultar Examen';
    };
    
    return container;
  }
};

// [JS-IND-004] LÓGICA PRINCIPAL
class App {
  constructor() {
    this.currentUser = null;
    this.currentPatient = null;
    this.mainContainer = document.getElementById('mainContent');
  }

  async init() {
    this.currentUser = new UserProfile({});
    this.currentUser.state.identity.names = "Valentina";
    this.currentUser.state.identity.lastNames = "Gonzalez Yanez";
    this.renderDashboard();
  }

  renderDashboard() {
    this.mainContainer.innerHTML = `
      <div class="glass-panel" style="text-align:center; padding:50px;">
        <h2>Bienvenida Dra. ${this.currentUser.state.identity.names}</h2>
        <p style="margin-bottom:30px; color:var(--text-secondary);">Seleccione una opción</p>
        <div style="display:flex; gap:20px; justify-content:center;">
          <button class="btn btn-primary" id="btnNewPatient">Nueva Historia</button>
          <button class="btn btn-ghost" id="btnSearchPatient">Buscar Paciente</button>
        </div>
      </div>
      <div id="workArea"></div>
    `;

    document.getElementById('btnNewPatient').onclick = () => this.startNewPatient();
    document.getElementById('btnSearchPatient').onclick = () => this.showSearch();
  }

  startNewPatient() {
    const workArea = document.getElementById('workArea');
    workArea.innerHTML = '';
    
    const formContainer = document.createElement('div');
    // PASAMOS UN OBJETO VACÍO PARA INICIAR EL FORMULARIO LIMPIO SEGÚN EL ESQUEMA COMPLETO
    Views.renderPatientForm(formContainer, {});
    
    const actions = document.createElement('div');
    actions.className = 'glass-panel';
    actions.style.textAlign = 'right';
    actions.style.position = 'sticky';
    actions.style.bottom = '20px';
    actions.style.zIndex = '100';
    actions.style.boxShadow = '0 -10px 40px rgba(0,0,0,0.1)';
    actions.innerHTML = `<button class="btn btn-primary" id="btnCreatePatient">Crear Paciente</button>`;
    
    workArea.appendChild(formContainer);
    workArea.appendChild(actions);

    document.getElementById('btnCreatePatient').onclick = () => {
      // Recolector Genérico para Objetos Anidados
      const formData = new FormData(formContainer);
      const raw = { 
        identificacion: {}, nombres: {}, demografia: {}, datos_biologicos: {}, 
        contacto: {}, redes_sociales: {}, contacto_emergencia: {}, alertas_clinicas: {},
        seguridad_prioritaria: {}, datos_administrativos: {}, antecedentes_personales: {},
        historial_quirurgico: {}, hospitalizaciones: {}, lesiones_y_fracturas: {},
        antecedentes_familiares: {}, habitos: {}, contexto_social: {}, consentimientos: {} 
      };
      
      formData.forEach((value, key) => {
        // key viene como "identificacion.documento_tipo" o "antecedentes_personales.hipertension"
        const parts = key.split('.');
        let target = raw;
        
        // Navegar hasta el penúltimo nivel
        for (let i = 0; i < parts.length - 1; i++) {
           if (!target[parts[i]]) target[parts[i]] = {};
           target = target[parts[i]];
        }
        
        // Asignar valor al último nivel, manejando checkboxes
        const lastKey = parts[parts.length - 1];
        // Verificamos si es checkbox (FormData no envía checkboxes desmarcados, así que si no existe es false, pero FormData sí lo envía si está marcado)
        // En nuestro HTML, los checkboxes tienen name="sect.key".
        // Si es checkbox, value es "on". Debemos poner true.
        // Si el campo es texto normal, ponemos el valor.
        
        // Lógica simple: si el input en el DOM era checkbox...
        // Como no tenemos el DOM aquí, inferimos por el nombre o estructura.
        // Para simplificar: Si es "_check", es booleano.
        if (lastKey.includes('_check')) {
            target[lastKey] = true; 
        } else {
            target[lastKey] = value;
        }
      });

      try {
        // Crear instancia para que corra la lógica de cálculo (edad, IMC)
        const newP = new PatientProfile(raw);
        StorageService.savePatient(newP);
        this.loadPatient(newP.identificacion.documento_numero);
      } catch (e) {
        alert("Error: " + e.message);
      }
    };
  }

  showSearch() {
    const workArea = document.getElementById('workArea');
    workArea.innerHTML = `
      <div class="glass-panel">
        <h3>Buscar Paciente</h3>
        <div class="input-row" style="margin-top:15px;">
          <input type="text" id="searchInput" placeholder="Nombre o Documento..." style="flex:1;">
          <button class="btn btn-primary" id="btnDoSearch">Buscar</button>
        </div>
        <div id="searchResults" style="margin-top:20px;"></div>
      </div>
    `;

    document.getElementById('btnDoSearch').onclick = () => {
      const q = document.getElementById('searchInput').value;
      const results = StorageService.searchPatients(q);
      const resDiv = document.getElementById('searchResults');
      
      if (results.length === 0) {
        resDiv.innerHTML = '<p class="small">No encontrado.</p>';
        return;
      }

      resDiv.innerHTML = results.map(p => `
        <div class="glass-panel" style="padding:15px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"
             onclick="window.app.loadPatient('${p.identificacion.documento_numero}')">
          <div>
            <strong style="font-size:1.1rem; color:var(--accent-blue)">${p.nombres.primer_nombre} ${p.nombres.primer_apellido}</strong><br>
            <span class="small">${p.identificacion.documento_tipo}-${p.identificacion.documento_numero}</span>
            <span class="small" style="margin-left:10px;">Edad: ${p.demografia.edad_auto}</span>
            <span class="small" style="margin-left:10px;">${p.datos_biologicos.grupo_sanguineo||''}</span>
          </div>
          <div style="align-self:center;">
            <button class="btn btn-primary small">Abrir</button>
          </div>
        </div>
      `).join('');
    };
  }

  loadPatient(docId) {
    this.currentPatient = StorageService.getPatient(docId);
    const workArea = document.getElementById('workArea');
    workArea.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'glass-panel';
    header.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="color:var(--accent-blue); line-height:1.2;">${this.currentPatient.nombres.primer_nombre} ${this.currentPatient.nombres.primer_apellido}</h2>
          <div style="margin-top:5px;">
            <span class="badge" style="background:var(--text-secondary)">${this.currentPatient.identificacion.documento_tipo}-${this.currentPatient.identificacion.documento_numero}</span>
            <span class="small" style="margin-left:10px; font-weight:600;">${this.currentPatient.demografia.edad_auto} años</span>
            <span class="small" style="margin-left:10px;">${this.currentPatient.contacto.tel_principal}</span>
          </div>
        </div>
        <div>
          <button class="btn btn-ghost" id="btnBackToDash">Salir</button>
          <button class="btn btn-primary" id="btnNewConsult">+ Consulta</button>
        </div>
      </div>
    `;
    workArea.appendChild(header);

    const consultsContainer = document.createElement('div');
    consultsContainer.id = 'consultsContainer';
    workArea.appendChild(consultsContainer);

    const history = StorageService.getConsultations(docId);
    history.forEach(c => {
      const card = document.createElement('div');
      card.className = 'glass-panel card-visit';
      card.style.opacity = '0.9';
      card.style.marginLeft = "20px"; // Sangría para historia
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <strong>${new Date(c.timestamp).toLocaleDateString()}</strong>
          <span style="font-size:0.9rem; color:var(--accent-blue);">${c.diagnostico || 'Sin Dx'}</span>
        </div>
        <div class="small" style="margin-top:5px; color:var(--text-secondary);">${c.motivo || ''}</div>
      `;
      consultsContainer.appendChild(card);
    });

    document.getElementById('btnBackToDash').onclick = () => this.renderDashboard();
    
    document.getElementById('btnNewConsult').onclick = () => {
      const formDiv = document.createElement('div');
      Views.renderConsultationForm(formDiv);
      
      // Animación de entrada
      formDiv.style.animation = "fadeIn 0.5s";
      consultsContainer.insertBefore(formDiv, consultsContainer.firstChild);

      formDiv.querySelector('#btnSaveConsult').onclick = () => {
        const data = {
          motivo: formDiv.querySelector('.txt-motivo').value,
          ea: formDiv.querySelector('.txt-ea').value,
          diagnostico: formDiv.querySelector('.txt-dx').value,
          plan: formDiv.querySelector('.txt-plan').value,
          recipe: formDiv.querySelector('.txt-recipe').value
        };
        StorageService.saveConsultation(docId, data);
        alert("Consulta Guardada");
        
        // Convertir tarjeta en modo lectura
        formDiv.querySelector('.btn-primary').textContent = "Guardado";
        formDiv.querySelector('.btn-primary').disabled = true;
        formDiv.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
      };
      
      formDiv.querySelector('#btnPreviewInf').onclick = () => {
         alert("Funcionalidad de PDF/Preview pendiente de implementación con html2canvas.");
      };
    };
  }
}

// [JS-IND-005] INICIALIZACIÓN
window.app = new App();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
