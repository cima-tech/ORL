/* modules/index.js */

/*
  [GLOSARIO-INDEX]
  StorageService -> Persistencia Local
  PatientFieldConfig -> Esquema completo del paciente
  Views -> Renderizadores de UI
  App -> Clase Principal (Toda la lógica en un solo lugar)
*/

import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';
import CalendarModule from './calendar.js'; // Nuevo módulo de agenda

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
    
    const currentUser = window.currentUser || { id: 'Guest' };

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

  static getLastConsultation(docId) {
    const consults = this.getConsultations(docId);
    return consults.length > 0 ? consults[0] : null;
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
  // ... (igual que antes, no cambia)
};

// [JS-IND-003] RENDERIZADORES
const Views = {
  // ... (igual que antes, no cambia)
};

// [JS-IND-004] APLICACIÓN PRINCIPAL
class App {
  constructor() {
    this.currentUser = null;
    this.currentPatient = null;
    this.currentEditingConsultationId = null;
    this.consoleVisible = false;
  }

  async init() {
    // Configurar consola
    this.setupConsole();

    // Intentar cargar usuario desde localStorage (si ya inició sesión)
    const savedUser = localStorage.getItem('CIMA_CURRENT_USER');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.currentUser = new UserProfile(null, userData);
        window.currentUser = this.currentUser;
        this.updateUserDisplay();
        this.hideLoginModal();
      } catch (e) {
        console.error('Error al cargar usuario guardado:', e);
        this.showLoginModal();
      }
    } else {
      this.showLoginModal();
    }

    await this.loadAvailableModels();

    // Listeners
    document.getElementById('btnHome').onclick = () => this.showDefaultView();
    document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
    document.getElementById('btnTheme').onclick = () => this.toggleTheme();
    document.getElementById('btnAgenda').onclick = () => this.showAgenda();
    document.getElementById('btnLogout').onclick = () => this.logout();
    const btnSearch = document.getElementById('btnSearch');
    if(btnSearch) btnSearch.onclick = () => this.showSearchModal();

    // Iniciar vista por defecto
    this.showDefaultView();

    // Configurar evento de teclado para la consola (Ctrl+L)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        this.toggleConsole();
      }
    });
  }

  setupConsole() {
    // Redirigir console.log a nuestro drawer
    const originalLog = console.log;
    const consoleOutput = document.getElementById('consoleOutput');
    console.log = function(...args) {
      originalLog.apply(console, args);
      if (consoleOutput) {
        consoleOutput.textContent += args.join(' ') + '\n';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
    };
  }

  toggleConsole() {
    const consoleDrawer = document.getElementById('consoleDrawer');
    if (consoleDrawer) {
      this.consoleVisible = !this.consoleVisible;
      if (this.consoleVisible) {
        consoleDrawer.classList.add('active');
      } else {
        consoleDrawer.classList.remove('active');
      }
    }
  }

  async loadAvailableModels() {
      // ... (igual que antes, no cambia)
  }

  updateUserDisplay() {
    const display = document.getElementById('userInfoDisplay');
    if (display && this.currentUser) {
      display.textContent = `${this.currentUser.getDisplayTitle()} (${this.currentUser.getDisplayRole()})`;
    }
  }

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.add('active');
      // Configurar botón de login
      document.getElementById('btnLogin').onclick = () => this.login();
      // Permitir también con Enter
      document.getElementById('loginPassword').onkeypress = (e) => {
        if (e.key === 'Enter') this.login();
      };
    }
  }

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
  }

  login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Por ahora, simulamos el login. En el futuro, esto será una petición al servidor.
    // Buscamos el usuario en una lista de usuarios guardada en localStorage.
    const users = JSON.parse(localStorage.getItem('CIMA_USERS') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      this.currentUser = new UserProfile(null, user);
      window.currentUser = this.currentUser;
      localStorage.setItem('CIMA_CURRENT_USER', JSON.stringify(user));
      this.updateUserDisplay();
      this.hideLoginModal();
      console.log('Usuario logueado:', this.currentUser.getDisplayName());
    } else {
      document.getElementById('loginMessage').textContent = 'Usuario o contraseña incorrectos';
    }
  }

  logout() {
    this.currentUser = null;
    window.currentUser = null;
    localStorage.removeItem('CIMA_CURRENT_USER');
    this.showLoginModal();
    this.showDefaultView();
  }

  showDefaultView() {
    this.hideAllViews();
    document.getElementById('defaultView').classList.remove('hidden');
    this.currentPatient = null;
  }

  showPatientView(patientId) {
    if (!patientId) { this.showDefaultView(); return; }

    this.currentPatient = StorageService.getPatient(patientId);
    if (!this.currentPatient) { alert("Paciente no encontrado"); return; }

    this.hideAllViews();
    const pView = document.getElementById('patientView');
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
    const pContent = pSec ? pSec.querySelector('.section-content') : null;
    if(pContent) {
        pContent.classList.add('expanded');
        pContent.style.maxHeight = "1000px";
    }
  }

  showAgenda() {
    this.hideAllViews();
    const agendaView = document.getElementById('agendaView');
    agendaView.classList.remove('hidden');
    // Inicializar el calendario
    CalendarModule.init('calendarContainer');
  }

  hideAllViews() {
    document.getElementById('defaultView').classList.add('hidden');
    document.getElementById('patientView').classList.add('hidden');
    document.getElementById('agendaView').classList.add('hidden');
  }

  // ... (el resto de métodos: sanitizePatientData, toggleTheme, editCurrentPatient, viewFullHistory, createNewPatientWorkflow, etc.) se mantienen igual.

  // MODIFICACIÓN: En openNewConsultationUI, cargar la última consulta para heredar datos
  openNewConsultationUI() {
      const modelSelect = document.getElementById('newConsultModelSelect');
      if(!modelSelect) return;
      const selectedModel = modelSelect.value;
      
      // Obtener la última consulta del paciente actual
      let lastConsultData = null;
      if (this.currentPatient) {
          lastConsultData = StorageService.getLastConsultation(this.currentPatient.identificacion.documento_numero);
      }
      
      // Pasar los datos de la última consulta al modal
      this.openConsultationModal(lastConsultData, selectedModel);
  }

  async openConsultationModal(data, modelId) {
      // ... (igual que antes, pero data ahora puede ser la última consulta)
  }

  // ... (el resto de métodos: showSearchModal, toggleSection, toggleConsultationContent, closeModal, etc.)
}

// Inicializar
window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());
