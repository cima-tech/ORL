/* modules/index.js */

/*
  [GLOSARIO-INDEX]
  StorageService -> Abstracción de LocalStorage
  App -> Controlador principal de la aplicación
  Views -> Manejadores de renderizado de vistas
*/

import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';
import { ORL_MODULE } from '../consultmodels/ORL-001.js';

// [JS-IND-001] SERVICIO DE ALMACENAMIENTO LOCAL (Simulando D:/documents/CIMA-ORL/storage)
class StorageService {
  static BASE_KEY = 'CIMA_STORAGE_V2';

  static savePatient(patientProfile) {
    const db = this._getDB();
    // Usamos el documento_numero como ID único para facilitar la búsqueda
    const key = patientProfile.identificacion.documento_numero;
    if (!key) throw new Error("Documento de paciente requerido");
    
    db.patients[key] = patientProfile;
    this._saveDB(db);
    console.log(`[Storage] Paciente guardado: ${key}`);
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
    if (!db.consultations[documentId]) {
      db.consultations[documentId] = [];
    }
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
    if (raw) return JSON.parse(raw);
    return { patients: {}, consultations: {} };
  }

  static _saveDB(db) {
    localStorage.setItem(this.BASE_KEY, JSON.stringify(db));
  }
}

// [JS-IND-002] GESTOR DE VISTAS Y RENDERIZADO
const Views = {
  renderPatientForm: (container, data = {}) => {
    const p = new PatientProfile(data);
    container.innerHTML = '';

    // Función auxiliar para crear inputs
    const createInput = (label, path, value, type='text', options=[]) => {
      const div = document.createElement('div');
      div.className = 'input-group';
      
      let inputHtml = '';
      if (type === 'select') {
        inputHtml = `<select name="${path}">
          <option value="">Seleccione...</option>
          ${options.map(o => `<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('')}
        </select>`;
      } else if (type === 'checkbox') {
        inputHtml = `<div style="display:flex; align-items:center; gap:8px; padding:10px 0;">
          <input type="checkbox" name="${path}" style="width:auto;" ${value ? 'checked' : ''}>
          <span>${label}</span>
        </div>`;
        div.innerHTML = inputHtml;
        return div; // Retorna temprano para checkbox
      } else {
        inputHtml = `<input type="${type}" name="${path}" value="${value || ''}">`;
      }

      if (type !== 'checkbox') div.innerHTML = `<label>${label}</label>${inputHtml}`;
      return div;
    };

    // Secciones
    const sections = [
      { title: 'Identificación', fields: [
        { l: 'Tipo Doc', p: 'identificacion.documento_tipo', t: 'select', o: ['V','E','P'] },
        { l: 'Número', p: 'identificacion.documento_numero' },
        { l: '1er Nombre', p: 'nombres.primer_nombre' },
        { l: '1er Apellido', p: 'nombres.primer_apellido' },
        { l: 'Fecha Nac', p: 'demografia.fecha_nacimiento', t: 'date' },
        { l: 'Género', p: 'demografia.genero', t: 'select', o: ['Masculino','Femenino','Otro'] }
      ]},
      { title: 'Contacto', fields: [
        { l: 'Teléfono', p: 'contacto.tel_principal' },
        { l: 'Email', p: 'contacto.email_principal', t: 'email' }
      ]},
      { title: 'Datos Clínicos Base', fields: [
        { l: 'Alergias', p: 'alertas_clinicas.alergias_check', t: 'checkbox' }
      ]}
    ];

    const card = document.createElement('div');
    card.className = 'glass-panel';
    
    sections.forEach(sec => {
      const secDiv = document.createElement('div');
      secDiv.innerHTML = `<h3 style="color:var(--accent-blue); margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">${sec.title}</h3>`;
      const row = document.createElement('div');
      row.className = 'input-row';
      
      sec.fields.forEach(f => {
        const val = f.p.split('.').reduce((obj, key) => obj && obj[key], p);
        row.appendChild(createInput(f.l, f.p, val, f.t, f.o));
      });
      secDiv.appendChild(row);
      card.appendChild(secDiv);
    });

    container.appendChild(card);
  },

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

    // Inicializar lógica de ORL-001 en este contenedor
    ORL_MODULE.UI.init(container);

    // Bindings adicionales
    container.querySelector('#btnTogglePE').onclick = function() {
      const pe = container.querySelector('.pe-panels');
      pe.classList.toggle('hidden');
      this.textContent = pe.classList.contains('hidden') ? 'Mostrar Examen' : 'Ocultar Examen';
    };
    
    return container;
  }
};

// [JS-IND-003] LÓGICA PRINCIPAL DE LA APP
class App {
  constructor() {
    this.currentUser = null; // UserProfile
    this.currentPatient = null; // PatientProfile
    this.mainContainer = document.getElementById('mainContent');
  }

  async init() {
    // Simular carga de usuario o login
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
    Views.renderPatientForm(formContainer);
    
    const actions = document.createElement('div');
    actions.className = 'glass-panel';
    actions.style.textAlign = 'right';
    actions.innerHTML = `<button class="btn btn-primary" id="btnCreatePatient">Crear Paciente</button>`;
    
    workArea.appendChild(formContainer);
    workArea.appendChild(actions);

    document.getElementById('btnCreatePatient').onclick = () => {
      const formData = new FormData(formContainer);
      // Recolectar datos manualmente o construir objeto
      const raw = { identificacion: {}, nombres: {}, demografia: {}, contacto: {}, alertas_clinicas: {} };
      
      // Simplificación de recolección para ejemplo:
      const inputs = formContainer.querySelectorAll('input, select');
      inputs.forEach(inp => {
        const path = inp.name;
        const val = inp.type === 'checkbox' ? inp.checked : inp.value;
        if(!path) return;
        
        const parts = path.split('.');
        let target = raw;
        parts.forEach((p, i) => {
          if (i === parts.length - 1) target[p] = val;
          else {
            if (!target[p]) target[p] = {};
            target = target[p];
          }
        });
      });

      try {
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
        <div class="glass-panel" style="padding:10px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between;"
             onclick="window.app.loadPatient('${p.identificacion.documento_numero}')">
          <div>
            <strong>${p.nombres.primer_nombre} ${p.nombres.primer_apellido}</strong><br>
            <span class="small">${p.identificacion.documento_tipo}-${p.identificacion.documento_numero}</span>
          </div>
          <div style="align-self:center;">
            <button class="btn btn-ghost small">Abrir</button>
          </div>
        </div>
      `).join('');
    };
  }

  loadPatient(docId) {
    this.currentPatient = StorageService.getPatient(docId);
    const workArea = document.getElementById('workArea');
    workArea.innerHTML = '';

    // Header del Paciente
    const header = document.createElement('div');
    header.className = 'glass-panel';
    header.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="color:var(--accent-blue)">${this.currentPatient.nombres.primer_nombre} ${this.currentPatient.nombres.primer_apellido}</h2>
          <span class="badge">${this.currentPatient.identificacion.documento_tipo}-${this.currentPatient.identificacion.documento_numero}</span>
          <span class="small" style="margin-left:10px;">Edad: ${this.currentPatient.demografia.edad_auto}</span>
        </div>
        <div>
          <button class="btn btn-ghost" id="btnBackToDash">Salir</button>
          <button class="btn btn-primary" id="btnNewConsult">+ Consulta</button>
        </div>
      </div>
    `;
    workArea.appendChild(header);

    // Contenedor de Consultas
    const consultsContainer = document.createElement('div');
    consultsContainer.id = 'consultsContainer';
    workArea.appendChild(consultsContainer);

    // Cargar historial
    const history = StorageService.getConsultations(docId);
    history.forEach(c => {
      // Aquí se renderizarían consultas pasadas (solo lectura)
      const card = document.createElement('div');
      card.className = 'glass-panel card-visit';
      card.style.opacity = '0.8';
      card.innerHTML = `<strong>${new Date(c.timestamp).toLocaleDateString()}</strong> - ${c.diagnostico || 'Sin Dx'}`;
      consultsContainer.appendChild(card);
    });

    document.getElementById('btnBackToDash').onclick = () => this.renderDashboard();
    
    document.getElementById('btnNewConsult').onclick = () => {
      const formDiv = document.createElement('div');
      Views.renderConsultationForm(formDiv);
      
      // Insertar al inicio
      consultsContainer.insertBefore(formDiv, consultsContainer.firstChild);

      // Evento guardar
      formDiv.querySelector('#btnSaveConsult').onclick = () => {
        const data = {
          motivo: formDiv.querySelector('.txt-motivo').value,
          ea: formDiv.querySelector('.txt-ea').value,
          diagnostico: formDiv.querySelector('.txt-dx').value,
          plan: formDiv.querySelector('.txt-plan').value,
          recipe: formDiv.querySelector('.txt-recipe').value
        };
        StorageService.saveConsultation(docId, data);
        alert("Consulta Guardada Localmente");
        // Recargar página para ver en historial o limpiar
        formDiv.querySelector('.btn-primary').textContent = "Guardado";
        formDiv.querySelector('.btn-primary').disabled = true;
      };
      
      // Evento preview
      formDiv.querySelector('#btnPreviewInf').onclick = () => {
         alert("Funcionalidad de preview (html2canvas) pendiente de configurar en este módulo.");
      };
    };
  }
}

// [JS-IND-004] INICIALIZACIÓN
window.app = new App();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});