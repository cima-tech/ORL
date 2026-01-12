/* modules/index.js - Actualizado */

import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';
import AuthService from './start.js';
import CalendarSystem from './calendar.js';

// [JS-IND-001] SERVICIO DE ALMACENAMIENTO (Actualizado)
class StorageService {
  static BASE_KEY = 'CIMA_STORAGE_V4';
  static BUZON_KEY = 'CIMA_BUZON_V1';

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
    
    const currentUser = window.currentUser || { id: 'Guest' };

    if (consultationData.id) {
        const idx = db.consultations[docId].findIndex(c => c.id === consultationData.id);
        if (idx !== -1) {
            const existing = db.consultations[docId][idx];
            // HERENCIA: Guardar configuración para futuras consultas
            if (consultationData.config) {
                db.patientConfigs = db.patientConfigs || {};
                db.patientConfigs[docId] = consultationData.config;
            }
            db.consultations[docId][idx] = { ...existing, ...consultationData, updatedAt: new Date().toISOString(), createdBy: currentUser.id };
        }
    } else {
        consultationData.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        consultationData.createdAt = new Date().toISOString();
        consultationData.createdBy = currentUser.id;
        
        // HERENCIA: Aplicar configuración previa si existe
        const prevConfig = this.getPatientConfig(docId);
        if (prevConfig && consultationData.modelo === prevConfig.modelo) {
            consultationData = { ...prevConfig, ...consultationData };
        }
        
        db.consultations[docId].push(consultationData);
    }
    this._saveDB(db);
  }

  static getConsultations(docId) {
    const db = this._getDB();
    return (db.consultations[docId] || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static getPatientConfig(docId) {
    const db = this._getDB();
    return (db.patientConfigs || {})[docId] || null;
  }

  static savePatientConfig(docId, config) {
    const db = this._getDB();
    if (!db.patientConfigs) db.patientConfigs = {};
    db.patientConfigs[docId] = config;
    this._saveDB(db);
  }

  static search(query) {
    const db = this._getDB();
    const q = query.toLowerCase();
    return Object.values(db.patients).filter(p => {
        const name = `${p.nombres.primer_nombre} ${p.nombres.primer_apellido}`.toLowerCase();
        return name.includes(q) || p.identificacion.documento_numero.includes(q);
    });
  }

  // BUZÓN de pacientes nuevos
  static addToBuzon(patientData) {
    const buzon = this._getBuzon();
    const id = 'buzon_' + Date.now();
    patientData.id = id;
    patientData.createdAt = new Date().toISOString();
    patientData.status = 'pending';
    buzon.push(patientData);
    localStorage.setItem(this.BUZON_KEY, JSON.stringify(buzon));
    return id;
  }

  static getBuzon() {
    return this._getBuzon();
  }

  static removeFromBuzon(id) {
    let buzon = this._getBuzon();
    buzon = buzon.filter(p => p.id !== id);
    localStorage.setItem(this.BUZON_KEY, JSON.stringify(buzon));
  }

  static _getBuzon() {
    const raw = localStorage.getItem(this.BUZON_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static _getDB() {
    const raw = localStorage.getItem(this.BASE_KEY);
    return raw ? JSON.parse(raw) : { patients: {}, consultations: {} };
  }
  
  static _saveDB(db) { 
    localStorage.setItem(this.BASE_KEY, JSON.stringify(db)); 
  }
}

// [JS-IND-002] CONFIGURACIÓN DE PACIENTE (Mantener igual)
const PATIENT_FIELD_CONFIG = {
  // ... (mantener igual que antes)
};

// [JS-IND-003] RENDERIZADORES (Actualizado)
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
    // ... (mantener igual)
  },

  renderBuzon: (container) => {
    const buzon = StorageService.getBuzon();
    container.innerHTML = '';
    
    if (buzon.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:40px; color:var(--color-text-dim);">No hay pacientes pendientes en el buzón.</p>';
      return;
    }
    
    buzon.forEach(patient => {
      const div = document.createElement('div');
      div.className = 'buzon-item glass-panel';
      div.style.padding = '20px';
      div.style.marginBottom = '15px';
      div.style.borderLeft = '4px solid var(--color-accent)';
      
      const name = `${patient.nombres?.primer_nombre || ''} ${patient.nombres?.primer_apellido || ''}`.trim() || 'Nombre no disponible';
      const doc = patient.identificacion?.documento_numero || 'Sin documento';
      const date = new Date(patient.createdAt).toLocaleString();
      
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4 style="margin: 0 0 10px 0; color: var(--color-text);">${name}</h4>
            <div style="color: var(--color-text-dim); font-size: 0.9rem;">
              <div>Documento: ${doc}</div>
              <div>Fecha de registro: ${date}</div>
            </div>
          </div>
          <div class="actions-row">
            <button class="action-btn" onclick="window.app.importBuzonPatient('${patient.id}')">
              <i class="fas fa-file-import"></i> Importar
            </button>
            <button class="action-btn secondary" onclick="window.app.deleteBuzonPatient('${patient.id}')">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(div);
    });
  }
};

// [JS-IND-004] APLICACIÓN PRINCIPAL (Actualizada)
class App {
  constructor() {
    this.currentUser = null;
    this.currentPatient = null;
    this.currentEditingConsultationId = null;
    this.logEntries = [];
    this.isLogDrawerOpen = false;
  }

  async init() {
    // Verificar autenticación
    if (!AuthService.isLoggedIn()) {
      this.setupLogin();
      return;
    }
    
    // Cargar usuario
    await this.loadUser();
    
    // Configurar interfaz
    this.setupUI();
    
    // Configurar atajos de teclado
    this.setupKeyboardShortcuts();
    
    // Desactivar click derecho
    this.disableRightClick();
    
    // Mostrar vista limpia
    this.showCleanView();
    
    // Cargar modelos
    await this.loadAvailableModels();
    
    // Inicializar agenda
    CalendarSystem.init(document.getElementById('mainContainer'));
  }
  
  setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
          const user = await AuthService.login(username, password);
          window.location.reload();
        } catch (error) {
          document.getElementById('loginError').textContent = error.message;
        }
      };
    }
  }
  
  async loadUser() {
    try {
      const userData = AuthService.getCurrentUser();
      if (!userData) throw new Error("No hay usuario autenticado");
      
      this.currentUser = new UserProfile(null, userData);
      window.currentUser = this.currentUser;
      
      const userInfoDisplay = document.getElementById('userInfoDisplay');
      if(userInfoDisplay) {
          userInfoDisplay.textContent = `${this.currentUser.getDisplayTitle()} (${this.currentUser.getDisplayRole()})`;
      }
      
      this.log('Sistema', `Usuario ${this.currentUser.getDisplayName()} autenticado`);
    } catch (e) {
      console.error("Error cargando usuario:", e);
      AuthService.logout();
    }
  }
  
  setupUI() {
    // Listeners del dock
    document.getElementById('btnHome').onclick = () => this.showCleanView();
    document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
    document.getElementById('btnTheme').onclick = () => this.toggleTheme();
    document.getElementById('btnSearch').onclick = () => this.showSearchModal();
    document.getElementById('btnAgenda').onclick = () => this.showAgenda();
    document.getElementById('btnBuzon').onclick = () => this.showBuzonModal();
    document.getElementById('btnLogout').onclick = () => AuthService.logout();
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+L para abrir/cerrar log drawer
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        if (!this.isLogDrawerOpen) {
          this.openLogDrawer();
        } else {
          this.closeLogDrawer();
        }
      }
      
      // Ctrl+S para buscar
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.showSearchModal();
      }
      
      // Ctrl+N para nuevo paciente
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.createNewPatientWorkflow();
      }
    });
  }
  
  disableRightClick() {
    document.addEventListener('contextmenu', (e) => {
      if (!this.isLogDrawerOpen) {
        e.preventDefault();
        this.log('Seguridad', 'Click derecho bloqueado');
      }
    }, { capture: true });
  }
  
  log(source, message) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${source}: ${message}`;
    this.logEntries.push(entry);
    
    // Actualizar drawer si está abierto
    if (this.isLogDrawerOpen) {
      this.updateLogDrawer();
    }
    
    // Limitar log a 100 entradas
    if (this.logEntries.length > 100) {
      this.logEntries.shift();
    }
  }
  
  openLogDrawer() {
    const drawer = document.getElementById('logDrawer');
    if (!drawer) return;
    
    // Pedir contraseña
    const password = prompt('Contraseña para acceder al log:');
    if (password !== 'astroyluna') {
      alert('Contraseña incorrecta');
      return;
    }
    
    drawer.classList.add('open');
    this.isLogDrawerOpen = true;
    this.updateLogDrawer();
    this.log('Sistema', 'Drawer de log abierto');
  }
  
  closeLogDrawer() {
    const drawer = document.getElementById('logDrawer');
    if (drawer) {
      drawer.classList.remove('open');
      this.isLogDrawerOpen = false;
      this.log('Sistema', 'Drawer de log cerrado');
    }
  }
  
  updateLogDrawer() {
    const logContent = document.getElementById('logContent');
    if (logContent) {
      logContent.textContent = this.logEntries.join('\n');
      logContent.scrollTop = logContent.scrollHeight;
    }
  }
  
  showCleanView() {
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--color-text-dim);">
          <i class="fas fa-stethoscope" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
          <h2>Bienvenido a CIMA</h2>
          <p>Seleccione una acción del menú superior para comenzar.</p>
          <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin-left: auto; margin-right: auto;">
            <div class="quick-action" onclick="window.app.showSearchModal()">
              <i class="fas fa-search"></i>
              <h4>Buscar Paciente</h4>
            </div>
            <div class="quick-action" onclick="window.app.createNewPatientWorkflow()">
              <i class="fas fa-user-plus"></i>
              <h4>Nuevo Paciente</h4>
            </div>
            <div class="quick-action" onclick="window.app.showAgenda()">
              <i class="fas fa-calendar-alt"></i>
              <h4>Agenda</h4>
            </div>
            <div class="quick-action" onclick="window.app.showBuzonModal()">
              <i class="fas fa-inbox"></i>
              <h4>Buzón</h4>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  showAgenda() {
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
      mainContainer.innerHTML = '<div id="calendarContainer"></div>';
      CalendarSystem.init(document.getElementById('calendarContainer'));
      this.log('Agenda', 'Vista de agenda cargada');
    }
  }
  
  showBuzonModal() {
    const modal = document.getElementById('buzonModal');
    if (modal) {
      Views.renderBuzon(document.getElementById('buzonList'));
      modal.classList.add('active');
      this.log('Buzón', 'Modal de buzón abierto');
    }
  }
  
  importBuzonPatient(buzonId) {
    const buzon = StorageService.getBuzon();
    const patientData = buzon.find(p => p.id === buzonId);
    
    if (!patientData) {
      alert('Paciente no encontrado en el buzón');
      return;
    }
    
    // Abrir modal para confirmar importación
    const modal = document.getElementById('editModal');
    const body = document.getElementById('modalBody');
    const title = document.getElementById('modalTitle');
    const btn = document.getElementById('btnSaveConsultation');
    
    if (title) title.textContent = "Importar Paciente del Buzón";
    if (btn) btn.textContent = "Importar a Base de Datos";
    
    if (body) {
      body.innerHTML = `
        <div style="padding: 20px;">
          <div style="background: var(--color-glass); padding: 20px; border-radius: var(--radius); margin-bottom: 20px;">
            <h4 style="margin-top: 0;">Datos del paciente:</h4>
            <pre style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; overflow: auto; max-height: 300px;">${JSON.stringify(patientData, null, 2)}</pre>
          </div>
          <p>¿Desea importar estos datos a la base de datos principal?</p>
        </div>
      `;
      
      modal.classList.add('active');
      
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.onclick = () => {
        try {
          // Crear perfil de paciente
          const patientProfile = new PatientProfile(patientData);
          StorageService.savePatient(patientProfile);
          StorageService.removeFromBuzon(buzonId);
          
          alert("Paciente importado exitosamente");
          this.closeModal();
          this.showPatientView(patientProfile.identificacion.documento_numero);
          this.log('Buzón', `Paciente ${buzonId} importado a base de datos`);
        } catch (e) {
          alert("Error: " + e.message);
        }
      };
    }
  }
  
  deleteBuzonPatient(buzonId) {
    if (confirm('¿Está seguro de eliminar este paciente del buzón?')) {
      StorageService.removeFromBuzon(buzonId);
      Views.renderBuzon(document.getElementById('buzonList'));
      this.log('Buzón', `Paciente ${buzonId} eliminado del buzón`);
    }
  }

  async loadAvailableModels() {
      // ... (mantener similar pero optimizado)
  }

  // HERENCIA DE CONSULTAS: Modificar openConsultationModal para heredar configuración
  async openConsultationModal(data, modelId) {
      const modal = document.getElementById('editModal');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      const btn = document.getElementById('btnSaveConsultation');

      if(title) title.textContent = data ? `Editar Consulta` : "Nueva Consulta";
      if(btn) btn.textContent = "Guardar Consulta";
      
      if(body) {
          body.innerHTML = '<div style="text-align:center; padding:50px; color:var(--accent-blue);">Cargando modelo...</div>';
          modal.classList.add('active');
      }

      try {
          const module = await import(`../consultmodels/${modelId}.js`);
          
          if (!module.MODEL_DEFINITION) {
              throw new Error("Sin MODEL_DEFINITION");
          }

          if(body) body.innerHTML = '';

          // HERENCIA: Si es nueva consulta y hay configuración previa, mezclar
          let initialData = data || {};
          if (!data && this.currentPatient) {
              const prevConfig = StorageService.getPatientConfig(this.currentPatient.identificacion.documento_numero);
              if (prevConfig && prevConfig.modelo === modelId) {
                  initialData = { ...prevConfig, ...initialData };
              }
          }
          
          module.MODEL_DEFINITION.initUI(body, initialData);

          const newBtn = btn.cloneNode(true);
          if(btn) {
              btn.parentNode.replaceChild(newBtn, btn);
              newBtn.onclick = async () => {
                  try {
                      const consultData = module.MODEL_DEFINITION.getData(body);
                      consultData.modelo = modelId;
                      if(this.currentPatient) {
                          consultData.pacienteId = this.currentPatient.identificacion.documento_numero;
                          
                          // HERENCIA: Guardar configuración para futuras consultas
                          consultData.config = {
                              ...consultData,
                              id: undefined, // No guardar el ID en la configuración
                              createdAt: undefined,
                              updatedAt: undefined
                          };
                          StorageService.savePatientConfig(this.currentPatient.identificacion.documento_numero, consultData.config);
                      }
                      if (data) consultData.id = data.id;
                      consultData.resumen = module.MODEL_DEFINITION.getSummary ? module.MODEL_DEFINITION.getSummary(consultData) : consultData.motivo;

                      if(this.currentPatient) {
                          StorageService.saveConsultation(this.currentPatient.identificacion.documento_numero, consultData);
                          alert("Consulta guardada");
                          this.closeModal();
                          this.showPatientView(this.currentPatient.identificacion.documento_numero);
                      }
                  } catch(e) {
                      console.error(e);
                      alert("Error: " + e.message);
                  }
              };
          }
      } catch (err) {
          console.error(err);
          if(body) {
              body.innerHTML = `
                <div style="color:var(--color-error); text-align:center; padding:20px;">
                      <h3>Error</h3>
                      <p>No se pudo cargar el modelo ${modelId}.</p>
                </div>`;
          }
          const btnSave = document.getElementById('btnSaveConsultation');
          if(btnSave) btnSave.disabled = true;
      }
  }

  // Mantener otras funciones existentes...
  toggleTheme() { /* ... */ }
  showPatientView(patientId) { /* ... */ }
  editCurrentPatient() { /* ... */ }
  createNewPatientWorkflow() { /* ... */ }
  showSearchModal() { /* ... */ }
  toggleSection(id) { /* ... */ }
  toggleConsultationContent(id) { /* ... */ }
  closeModal() { /* ... */ }
}

// Inicializar
window.app = new App();
window.StorageService = StorageService;

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Si ya está autenticado, ocultar login y mostrar app
        if (AuthService.isLoggedIn()) {
            document.getElementById('loginContainer').classList.add('hidden');
            document.getElementById('appContainer').classList.remove('hidden');
            window.app.init();
        }
    });
} else {
    if (AuthService.isLoggedIn()) {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        window.app.init();
    }
}
