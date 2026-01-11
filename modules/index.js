/* modules/index.js - Versión Completa */

import AuthService from './start.js';
import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';

// [CONSTANTES]
const PATIENT_FIELD_CONFIG = {
    // ... (mantener toda la estructura existente, exactamente igual)
    identificacion: {
        label: "Identificación",
        fields: [
            { key: "documento_tipo", label: "Tipo Doc", type: "select", options: ["V","E","P","J","G"] },
            { key: "documento_numero", label: "Número", type: "text", placeholder: "Ej: 12345678" },
            { key: "estado_paciente", label: "Estado", type: "select", options: ["Activo","Inactivo","Fallecido"] },
            { key: "codigo_interno_cima", label: "Cód. Interno", type: "text", placeholder: "HC-..." }
        ]
    },
    // ... (todas las demás secciones exactamente igual)
};

// [SERVICIOS]
class StorageService {
    static BASE_KEY = 'CIMA_STORAGE_V4';
    static INBOX_KEY = 'CIMA_INBOX_V1';

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
                db.consultations[docId][idx] = { 
                    ...existing, 
                    ...consultationData, 
                    updatedAt: new Date().toISOString(), 
                    createdBy: currentUser.id 
                };
            }
        } else {
            // Heredar datos de la última consulta si existe
            if (consultationData.inheritPrevious && db.consultations[docId].length > 0) {
                const lastConsult = db.consultations[docId][0];
                consultationData = { ...lastConsult, ...consultationData, id: undefined };
            }
            
            consultationData.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
            consultationData.createdAt = new Date().toISOString();
            consultationData.createdBy = currentUser.id;
            db.consultations[docId].unshift(consultationData);
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
            const phone = p.contacto?.tel_principal?.toLowerCase() || '';
            return name.includes(q) || 
                   p.identificacion.documento_numero.includes(q) ||
                   phone.includes(q);
        });
    }

    static addToInbox(patientData) {
        const inbox = this._getInbox();
        const id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        patientData.tempId = id;
        patientData.createdAt = new Date().toISOString();
        inbox.push(patientData);
        localStorage.setItem(this.INBOX_KEY, JSON.stringify(inbox));
        return id;
    }

    static getInbox() {
        return this._getInbox();
    }

    static removeFromInbox(tempId) {
        let inbox = this._getInbox();
        inbox = inbox.filter(item => item.tempId !== tempId);
        localStorage.setItem(this.INBOX_KEY, JSON.stringify(inbox));
    }

    static clearInbox() {
        localStorage.removeItem(this.INBOX_KEY);
    }

    static _getDB() {
        const raw = localStorage.getItem(this.BASE_KEY);
        return raw ? JSON.parse(raw) : { patients: {}, consultations: {} };
    }

    static _saveDB(db) {
        localStorage.setItem(this.BASE_KEY, JSON.stringify(db));
    }

    static _getInbox() {
        const raw = localStorage.getItem(this.INBOX_KEY);
        return raw ? JSON.parse(raw) : [];
    }
}

// [RENDERIZADORES]
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

    renderAgenda: async (container) => {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let html = `
            <div class="agenda-controls">
                <button onclick="window.app.prevMonth()"><i class="fas fa-chevron-left"></i></button>
                <h2>${today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                <button onclick="window.app.nextMonth()"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="calendar">
                <div class="calendar-header">
                    <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                </div>
                <div class="calendar-grid">
        `;
        
        // Días del mes
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            
            if (i === 1) {
                // Espacios vacíos al inicio
                for (let j = 0; j < (firstDay.getDay() + 6) % 7; j++) {
                    html += '<div class="calendar-day empty"></div>';
                }
            }
            
            const isToday = i === today.getDate() && month === today.getMonth();
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <div class="day-number">${i}</div>
                    <div class="appointments">
                        <!-- Aquí se cargarían las citas del día -->
                    </div>
                </div>
            `;
            
            if (i === lastDay.getDate()) {
                // Espacios vacíos al final
                const remaining = (7 - (dayOfWeek + 6) % 7 - 1) % 7;
                for (let j = 0; j < remaining; j++) {
                    html += '<div class="calendar-day empty"></div>';
                }
            }
        }
        
        html += `
                </div>
            </div>
            <div class="agenda-actions">
                <button class="action-btn" onclick="window.app.addAppointment()">
                    <i class="fas fa-plus"></i> Agregar Cita
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    },

    renderInbox: (container) => {
        const inbox = StorageService.getInbox();
        
        if (inbox.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-text-dim);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Buzón vacío</h3>
                    <p>No hay pacientes pendientes de importar</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        inbox.forEach((patient, index) => {
            html += `
                <div class="inbox-item">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3>${patient.nombres?.primer_nombre || ''} ${patient.nombres?.primer_apellido || ''}</h3>
                            <p style="color: var(--color-text-dim); margin: 5px 0;">
                                <strong>Documento:</strong> ${patient.identificacion?.documento_numero || 'No especificado'}
                            </p>
                            <p style="color: var(--color-text-dim); margin: 5px 0;">
                                <strong>Teléfono:</strong> ${patient.contacto?.tel_principal || 'No especificado'}
                            </p>
                            <p style="color: var(--color-text-dim); margin: 5px 0;">
                                <strong>Fecha:</strong> ${new Date(patient.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="action-btn" onclick="window.app.importPatient('${patient.tempId}')">
                                <i class="fas fa-file-import"></i> Importar
                            </button>
                            <button class="action-btn secondary" onclick="window.app.viewInboxPatient('${patient.tempId}')">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="action-btn secondary" onclick="window.app.deleteInboxPatient('${patient.tempId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    renderModels: (container) => {
        // Esta función cargaría los modelos desde consultmodels.json
        // Por ahora mostramos un mensaje
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Gestión de Modelos de Consulta</h3>
                <p style="color: var(--color-text-dim); margin: 20px 0;">
                    Esta función permitirá agregar, editar y eliminar modelos de consulta.
                </p>
                <div class="action-btn" onclick="window.app.loadModels()">
                    <i class="fas fa-sync"></i> Cargar Modelos
                </div>
            </div>
        `;
    }
};

// [APLICACIÓN PRINCIPAL]
class App {
    constructor() {
        this.currentUser = null;
        this.currentPatient = null;
        this.currentView = 'agenda';
        this.logEntries = [];
    }

    async init() {
        // Verificar autenticación
        const user = AuthService.getCurrentUser();
        if (!user) {
            this.showLogin();
            return;
        }

        // Cargar perfil de usuario
        this.currentUser = new UserProfile(null, user);
        window.currentUser = this.currentUser;
        
        // Actualizar UI
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userInfoDisplay').textContent = 
            `${this.currentUser.getDisplayTitle()} - ${this.currentUser.getDisplayRole()}`;

        // Cargar modelos disponibles
        await this.loadAvailableModels();

        // Setup event listeners
        this.setupEventListeners();
        
        // Cargar vista por defecto (agenda)
        this.showView('agenda');
        
        // Actualizar badge del buzón
        this.updateInboxBadge();
        
        // Setup shortcuts
        this.setupShortcuts();
        
        // Log
        this.addLog('Sistema iniciado', 'system');
    }

    showLogin() {
        document.getElementById('loginView').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        
        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await AuthService.login(username, password);
            if (result.success) {
                this.init();
            } else {
                alert(result.message || 'Error de autenticación');
            }
        };
    }

    setupEventListeners() {
        // Navegación
        document.getElementById('btnAgenda').onclick = () => this.showView('agenda');
        document.getElementById('btnSearch').onclick = () => this.showSearchModal();
        document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow(true); // true = para buzón
        document.getElementById('btnInbox').onclick = () => this.showView('inbox');
        document.getElementById('btnModels').onclick = () => this.showView('models');
        document.getElementById('btnTheme').onclick = () => this.toggleTheme();
        document.getElementById('btnLogout').onclick = () => AuthService.logout();
        
        // Click derecho deshabilitado
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+L para abrir/cerrar log drawer
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.toggleLogDrawer();
            }
            
            // Escape para cerrar modales
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeSearchModal();
            }
        });
    }

    showView(viewName) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.add('hidden');
        });
        
        // Mostrar la vista solicitada
        this.currentView = viewName;
        const viewElement = document.getElementById(`${viewName}View`);
        
        if (viewElement) {
            viewElement.classList.remove('hidden');
            
            // Cargar contenido específico de la vista
            switch(viewName) {
                case 'agenda':
                    Views.renderAgenda(viewElement);
                    break;
                case 'inbox':
                    Views.renderInbox(document.getElementById('inboxList'));
                    break;
                case 'models':
                    Views.renderModels(document.getElementById('modelsList'));
                    break;
            }
        }
    }

    async loadAvailableModels() {
        const select = document.getElementById('newConsultModelSelect');
        if (!select) return;

        select.innerHTML = '<option value="" disabled>Cargando modelos...</option>';

        try {
            const response = await fetch('modules/consultmodels.json');
            if (response.ok) {
                const models = await response.json();
                select.innerHTML = '';
                
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    select.appendChild(option);
                });
                
                // Seleccionar modelo por defecto del usuario
                if (this.currentUser.state.professional.defaultConsultationModel) {
                    select.value = this.currentUser.state.professional.defaultConsultationModel;
                }
            }
        } catch (error) {
            console.error('Error loading models:', error);
            select.innerHTML = '<option value="" disabled>Error cargando modelos</option>';
        }
    }

    async createNewPatientWorkflow(forInbox = false) {
        const modal = document.getElementById('editModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        
        title.textContent = forInbox ? 'Nuevo Paciente (Buzón)' : 'Nuevo Paciente';
        
        // Renderizar formulario
        body.innerHTML = '';
        this.renderPatientForm(body, {});
        
        modal.classList.add('active');
        
        // Configurar botón de guardar
        const saveBtn = document.getElementById('btnSaveConsultation');
        saveBtn.textContent = forInbox ? 'Enviar a Buzón' : 'Guardar Paciente';
        
        saveBtn.onclick = () => {
            const formData = this.collectFormData(body);
            try {
                const patientData = this.sanitizePatientData(formData);
                
                if (forInbox) {
                    // Guardar en buzón
                    StorageService.addToInbox(patientData);
                    this.closeModal();
                    this.showView('inbox');
                    this.updateInboxBadge();
                    this.addLog(`Paciente ${patientData.nombres.primer_nombre} enviado al buzón`, 'patient');
                } else {
                    // Guardar directamente
                    const patient = new PatientProfile(patientData);
                    StorageService.savePatient(patient);
                    this.closeModal();
                    this.showPatientView(patient.identificacion.documento_numero);
                    this.addLog(`Paciente ${patient.nombres.primer_nombre} creado`, 'patient');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        };
    }

    importPatient(tempId) {
        const inbox = StorageService.getInbox();
        const patientData = inbox.find(p => p.tempId === tempId);
        
        if (patientData) {
            // Eliminar tempId antes de crear perfil
            delete patientData.tempId;
            delete patientData.createdAt;
            
            const patient = new PatientProfile(patientData);
            StorageService.savePatient(patient);
            StorageService.removeFromInbox(tempId);
            
            this.updateInboxBadge();
            this.showView('inbox');
            this.addLog(`Paciente ${patient.nombres.primer_nombre} importado del buzón`, 'patient');
            
            alert('Paciente importado exitosamente');
        }
    }

    updateInboxBadge() {
        const inbox = StorageService.getInbox();
        const badge = document.getElementById('inboxBadge');
        
        if (inbox.length > 0) {
            badge.textContent = inbox.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // ... (mantener todas las demás funciones existentes como showPatientView, editCurrentPatient, etc.)
    // Solo se muestran las funciones modificadas o nuevas

    showSearchModal() {
        const modal = document.getElementById('searchModal');
        modal.classList.add('active');
        
        const input = document.getElementById('searchInput');
        input.value = '';
        input.focus();
        
        input.oninput = () => {
            const results = StorageService.search(input.value);
            const container = document.getElementById('searchResults');
            
            if (results.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--color-text-dim);">
                        No se encontraron pacientes
                    </div>
                `;
                return;
            }
            
            let html = '';
            results.forEach(patient => {
                html += `
                    <div class="search-result-item" 
                         onclick="window.app.selectPatient('${patient.identificacion.documento_numero}')">
                        <div>
                            <strong>${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}</strong>
                            <div style="color: var(--color-text-dim); font-size: 0.9rem;">
                                ${patient.identificacion.documento_tipo}-${patient.identificacion.documento_numero}
                                ${patient.contacto.tel_principal ? ' · ' + patient.contacto.tel_principal : ''}
                            </div>
                        </div>
                        <div style="color: var(--color-accent);">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        };
    }

    selectPatient(patientId) {
        this.closeSearchModal();
        this.showPatientView(patientId);
        this.showView('patient');
    }

    closeSearchModal() {
        document.getElementById('searchModal').classList.remove('active');
    }

    // Funciones del Log Drawer
    toggleLogDrawer() {
        const drawer = document.getElementById('logDrawer');
        drawer.classList.toggle('open');
    }

    closeLogDrawer() {
        document.getElementById('logDrawer').classList.remove('open');
    }

    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            time: timestamp,
            message: message,
            type: type
        };
        
        this.logEntries.unshift(entry);
        if (this.logEntries.length > 100) this.logEntries.pop();
        
        this.updateLogDisplay();
    }

    updateLogDisplay() {
        const container = document.getElementById('logContent');
        let html = '';
        
        this.logEntries.forEach(entry => {
            html += `
                <div class="log-entry">
                    <span style="color: var(--color-text-dim);">[${entry.time}]</span>
                    <span style="color: ${this.getLogColor(entry.type)}; margin-left: 10px;">
                        ${entry.message}
                    </span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    getLogColor(type) {
        switch(type) {
            case 'error': return 'var(--color-error)';
            case 'warning': return 'var(--color-warning)';
            case 'success': return 'var(--color-success)';
            case 'system': return 'var(--color-accent)';
            default: return 'var(--color-text)';
        }
    }

    executeLogCommand() {
        const input = document.getElementById('logPassword');
        const command = input.value.trim();
        
        if (command === 'astroyluna') {
            this.addLog('Contraseña verificada. Modo administrador activado.', 'success');
            // Aquí se podrían habilitar funciones de administración
        } else if (command) {
            this.addLog(`Comando no reconocido: ${command}`, 'error');
        }
        
        input.value = '';
    }

    // ... (todas las demás funciones del código original)
}

// Inicializar aplicación
window.app = new App();

// Iniciar cuando el DOM esté listo
if (AuthService.isAuthenticated()) {
    document.addEventListener('DOMContentLoaded', () => window.app.init());
} else {
    document.addEventListener('DOMContentLoaded', () => window.app.showLogin());
}
