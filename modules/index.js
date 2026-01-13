/* modules/index.js - VERSIÓN CORREGIDA Y SIMPLIFICADA */

// Importar módulos
import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';

// Servicio de almacenamiento (igual al tuyo original)
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
    
    static _saveDB(db) { 
        localStorage.setItem(this.BASE_KEY, JSON.stringify(db)); 
    }
}

// Clase principal App (simplificada)
class App {
    constructor() {
        this.currentUser = null;
        this.currentPatient = null;
        this.currentEditingConsultationId = null;
    }
    
    async init(userData) {
        this.currentUser = new UserProfile(null, userData);
        window.currentUser = this.currentUser;
        
        // Mostrar info de usuario
        const userInfoDisplay = document.getElementById('userInfoDisplay');
        if(userInfoDisplay) {
            userInfoDisplay.textContent = `${this.currentUser.getDisplayTitle()} (${this.currentUser.getDisplayRole()})`;
        }
        
        // Configurar listeners
        this.setupEventListeners();
        
        // Cargar modelos disponibles
        await this.loadAvailableModels();
        
        // Mostrar vista limpia
        this.showCleanView();
    }
    
    setupEventListeners() {
        // Botones del dock
        document.getElementById('btnHome').onclick = () => this.showCleanView();
        document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
        document.getElementById('btnTheme').onclick = () => this.toggleTheme();
        document.getElementById('btnSearch').onclick = () => this.showSearchModal();
        document.getElementById('btnAgenda').onclick = () => this.showAgenda();
        document.getElementById('btnLogout').onclick = () => this.logout();
    }
    
    async loadAvailableModels() {
        const select = document.getElementById('newConsultModelSelect');
        if (!select) return;
        
        try {
            const response = await fetch('modules/consultmodels.json');
            if (response.ok) {
                const models = await response.json();
                select.innerHTML = models.map(model => 
                    `<option value="${model.id}">${model.name}</option>`
                ).join('');
            }
        } catch (e) {
            console.warn("No se pudieron cargar los modelos");
        }
    }
    
    toggleTheme() {
        document.body.classList.toggle('light-mode');
    }
    
    showCleanView() {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div style="text-align: center; padding: 100px 20px; color: var(--color-text-dim);">
                    <h2>Bienvenido a CIMA</h2>
                    <p>Utilice las opciones de la barra superior para comenzar</p>
                </div>
            `;
        }
    }
    
    showAgenda() {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h2>Agenda</h2>
                    <p>Próximamente...</p>
                </div>
            `;
        }
    }
    
    // Métodos originales (copiados de tu código)
    createNewPatientWorkflow() {
        const modal = document.getElementById('editModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        const btn = document.getElementById('btnSaveConsultation');
        
        if(title) title.textContent = "Nuevo Paciente";
        if(btn) btn.textContent = "Guardar Paciente";
        
        if(body) {
            body.innerHTML = '';
            
            // Importar y usar el renderizador de formularios
            import('./views.js').then(module => {
                module.default.renderPatientForm(body, {}, (formData) => {
                    try {
                        const raw = this.sanitizePatientData(formData);
                        const patient = new PatientProfile(raw);
                        StorageService.savePatient(patient);
                        
                        alert("Paciente creado exitosamente");
                        this.closeModal();
                        this.showPatientView(patient.identificacion.documento_numero);
                    } catch(error) {
                        alert("Error: " + error.message);
                    }
                });
            });
            
            modal.classList.add('active');
        }
    }
    
    showSearchModal() {
        const modal = document.getElementById('searchModal');
        const input = document.getElementById('searchInput');
        
        if(modal && input) {
            modal.classList.add('active');
            input.value = '';
            input.focus();
            
            input.oninput = () => {
                const q = input.value;
                if(q.length < 2) return;
                const results = StorageService.search(q);
                const div = document.getElementById('searchResults');
                if(div) {
                    div.innerHTML = results.map(p => `
                        <div class="search-result" 
                             onclick="window.app.showPatientView('${p.identificacion.documento_numero}'); 
                                      document.getElementById('searchModal').classList.remove('active')">
                            <strong>${p.nombres.primer_nombre} ${p.nombres.primer_apellido}</strong>
                            <small>${p.identificacion.documento_numero}</small>
                        </div>
                    `).join('');
                }
            };
        }
    }
    
    showPatientView(patientId) {
        if (!patientId) { 
            this.showCleanView(); 
            return; 
        }
        
        this.currentPatient = StorageService.getPatient(patientId);
        if (!this.currentPatient) { 
            alert("Paciente no encontrado"); 
            return; 
        }
        
        const mainContainer = document.getElementById('mainContainer');
        if (!mainContainer) return;
        
        // Renderizar vista de paciente (simplificada por ahora)
        mainContainer.innerHTML = `
            <div style="padding: 20px;">
                <h2>Paciente: ${this.currentPatient.nombres.primer_nombre} ${this.currentPatient.nombres.primer_apellido}</h2>
                <p>Documento: ${this.currentPatient.identificacion.documento_numero}</p>
                <!-- Más información del paciente -->
            </div>
        `;
    }
    
    closeModal() {
        const modal = document.getElementById('editModal');
        if(modal) modal.classList.remove('active');
        this.currentEditingConsultationId = null;
    }
    
    logout() {
        sessionStorage.removeItem('CIMA_CURRENT_USER');
        location.reload();
    }
    
    // Método sanitizePatientData (del código original)
    sanitizePatientData(formData) {
        const raw = { 
            identificacion: {}, nombres: {}, demografia: {}, datos_biologicos: {}, contacto: {}, redes_sociales: {}, 
            contacto_emergencia: {}, alertas_clinicas: {}, seguridad_prioritaria: {}, datos_administrativos: {},
            antecedentes_personales: {}, historial_quirurgico: {}, hospitalizaciones: {}, 
            lesiones_y_fracturas: {}, antecedentes_familiares: {}, habitos: {}, contexto_social: {}, 
            consentimientos: {}
        };
        
        Object.entries(formData).forEach(([key, value]) => {
            const parts = key.split('.');
            let target = raw;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!target[parts[i]]) target[parts[i]] = {};
                target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = value;
        });
        
        return raw;
    }
}

// Inicializar aplicación globalmente
window.app = new App();
window.StorageService = StorageService;

// Esperar a que la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const userData = sessionStorage.getItem('CIMA_CURRENT_USER');
        if (userData) {
            window.app.init(JSON.parse(userData));
        }
    });
} else {
    const userData = sessionStorage.getItem('CIMA_CURRENT_USER');
    if (userData) {
        window.app.init(JSON.parse(userData));
    }
}
