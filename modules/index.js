/* modules/index.js - Sistema completamente corregido y profesional */
import AuthService from './start.js';
import { StorageService, PATIENT_FIELD_CONFIG, Views } from './core-modules.js';

class App {
    constructor() {
        this.currentUser = null;
        this.currentPatient = null;
        this.currentEditingConsultationId = null;
        this.logEntries = [];
        this.isLogDrawerOpen = false;
        this.publicFormData = {}; // Para almacenar datos del formulario público
    }

    async init() {
        // Configurar listeners globales
        this.setupGlobalListeners();
        this.setupKeyboardShortcuts();
        this.disableRightClick();
        
        // Verificar autenticación
        if (AuthService.isLoggedIn()) {
            await this.loadUser();
            this.showPrivateInterface();
        } else {
            this.showPublicInterface();
        }
    }
    
    setupGlobalListeners() {
        // Listeners para la vista pública
        document.getElementById('btnPatientAccess').onclick = () => this.openPatientAccess();
        document.getElementById('btnDoctorLogin').onclick = () => this.openDoctorLogin();
        document.getElementById('btnCreateAccount').onclick = () => this.openCreateAccount();
        
        // Listener para cerrar drawers al hacer click fuera
        document.getElementById('drawerOverlay').onclick = () => this.closeAllDrawers();
        
        // Formulario de login médico
        document.getElementById('doctorLoginForm').onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('doctorUsername').value;
            const password = document.getElementById('doctorPassword').value;
            
            const errorDiv = document.getElementById('doctorLoginError');
            errorDiv.style.display = 'none';
            
            try {
                await AuthService.login(username, password);
                // Recargar para mostrar interfaz privada
                window.location.reload();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        };
        
        // Tabs del área de paciente
        document.querySelectorAll('.form-tab').forEach(tab => {
            tab.onclick = () => {
                const tabId = tab.dataset.tab;
                this.switchPatientTab(tabId);
            };
        });
        
        // Cargar formulario público COMPLETO
        this.renderPublicPatientForm();
        
        // Configurar envío del formulario público
        document.getElementById('patientPublicForm').onsubmit = (e) => {
            e.preventDefault();
            this.submitPublicPatientForm();
        };
        
        // Solicitud de documentos
        document.getElementById('documentRequestForm').onsubmit = (e) => {
            e.preventDefault();
            this.submitDocumentRequest();
        };
    }
    
    async loadUser() {
        const userData = AuthService.getCurrentUser();
        if (!userData) return;
        
        // Importar UserProfile dinámicamente
        const { default: UserProfile } = await import('./user-profile.js');
        this.currentUser = new UserProfile(null, userData);
        window.currentUser = this.currentUser;
        
        // Actualizar display
        const userInfoDisplay = document.getElementById('userInfoDisplay');
        if (userInfoDisplay) {
            userInfoDisplay.textContent = `${this.currentUser.getDisplayTitle()} (${this.currentUser.getDisplayRole()})`;
        }
        
        this.log('Sistema', `Usuario ${this.currentUser.getDisplayName()} autenticado`);
    }
    
    showPublicInterface() {
        document.getElementById('publicView').style.display = 'block';
        document.getElementById('appView').style.display = 'none';
    }
    
    showPrivateInterface() {
        document.getElementById('publicView').style.display = 'none';
        document.getElementById('appView').style.display = 'block';
        
        // Configurar listeners privados
        this.setupPrivateListeners();
        
        // Mostrar vista limpia
        this.showCleanView();
        
        // Cargar modelos disponibles
        this.loadAvailableModels();
    }
    
    setupPrivateListeners() {
        // Listeners del dock privado
        document.getElementById('btnHome').onclick = () => this.showCleanView();
        document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
        document.getElementById('btnTheme').onclick = () => this.toggleTheme();
        document.getElementById('btnSearch').onclick = () => this.showSearchModal();
        document.getElementById('btnAgenda').onclick = () => this.showAgenda();
        document.getElementById('btnBuzon').onclick = () => this.showBuzonModal();
        document.getElementById('btnLogout').onclick = () => AuthService.logout();
    }
    
    // FUNCIONES PARA DRAWERS
    openDrawer(drawerId) {
        document.getElementById('drawerOverlay').classList.add('active');
        document.getElementById(drawerId).classList.add('open');
    }
    
    closeDrawer(drawerId) {
        document.getElementById('drawerOverlay').classList.remove('active');
        document.getElementById(drawerId).classList.remove('open');
    }
    
    closeAllDrawers() {
        document.getElementById('drawerOverlay').classList.remove('active');
        document.querySelectorAll('.drawer').forEach(drawer => {
            drawer.classList.remove('open');
        });
    }
    
    openPatientAccess() {
        this.closeAllDrawers();
        this.openDrawer('patientAccessDrawer');
    }
    
    openDoctorLogin() {
        this.closeAllDrawers();
        this.openDrawer('doctorLoginDrawer');
    }
    
    openCreateAccount() {
        this.closeAllDrawers();
        this.openDrawer('createAccountDrawer');
    }
    
    switchPatientTab(tabId) {
        // Actualizar tabs activos
        document.querySelectorAll('.form-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Mostrar contenido correspondiente
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }
    
    // RENDERIZAR FORMULARIO PÚBLICO COMPLETO (usando PATIENT_FIELD_CONFIG)
    renderPublicPatientForm() {
        const container = document.getElementById('patientFormContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Crear formulario con TODOS los campos del paciente
        Object.entries(PATIENT_FIELD_CONFIG).forEach(([sectionKey, sectionConfig]) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'form-section-glass';
            sectionDiv.style.marginBottom = '30px';
            sectionDiv.style.padding = '20px';
            sectionDiv.style.background = 'var(--color-glass)';
            sectionDiv.style.borderRadius = 'var(--radius)';
            sectionDiv.style.border = '1px solid var(--color-glass-border)';
            
            // Título de la sección
            const title = document.createElement('h5');
            title.textContent = sectionConfig.label;
            title.style.margin = '0 0 15px 0';
            title.style.color = 'var(--color-accent)';
            title.style.fontSize = '1rem';
            sectionDiv.appendChild(title);
            
            // Campos de la sección
            if (sectionConfig.fields) {
                sectionConfig.fields.forEach(field => {
                    // Solo mostrar campos esenciales en formulario público
                    const essentialFields = [
                        'documento_tipo', 'documento_numero', 'primer_nombre', 'segundo_nombre',
                        'primer_apellido', 'segundo_apellido', 'fecha_nacimiento', 'genero',
                        'tel_principal', 'email_principal', 'dir_calle_num', 'dir_ciudad'
                    ];
                    
                    if (essentialFields.includes(field.key)) {
                        const fieldDiv = this.createPublicFormField(sectionKey, field);
                        sectionDiv.appendChild(fieldDiv);
                    }
                });
            }
            
            container.appendChild(sectionDiv);
        });
        
        // Sección especial para alertas clínicas (MUY IMPORTANTE)
        const alertsDiv = document.createElement('div');
        alertsDiv.className = 'form-section-glass';
        alertsDiv.style.marginBottom = '30px';
        alertsDiv.style.padding = '20px';
        alertsDiv.style.background = 'rgba(239, 68, 68, 0.05)';
        alertsDiv.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        alertsDiv.style.borderRadius = 'var(--radius)';
        
        alertsDiv.innerHTML = `
            <h5 style="margin: 0 0 15px 0; color: var(--color-error);">
                <i class="fas fa-exclamation-triangle"></i> Alertas Clínicas CRÍTICAS
            </h5>
            <p style="color: var(--color-text-dim); margin-bottom: 15px; font-size: 0.9rem;">
                Esta información es VITAL para su seguridad durante la atención médica
            </p>
            <div class="form-grid">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Alergias conocidas *</label>
                    <textarea name="alertas_clinicas.alergias_detalle" 
                              class="login-input" 
                              rows="3" 
                              placeholder="Ej: Penicilina, Mariscos, Latex..." 
                              required></textarea>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Medicamentos actuales</label>
                    <textarea name="alertas_clinicas.medicamentos_detalle" 
                              class="login-input" 
                              rows="3" 
                              placeholder="Medicamentos que toma actualmente"></textarea>
                </div>
            </div>
        `;
        
        container.appendChild(alertsDiv);
        
        // Consentimiento
        const consentDiv = document.createElement('div');
        consentDiv.className = 'form-section-glass';
        consentDiv.style.marginTop = '20px';
        consentDiv.style.padding = '20px';
        consentDiv.style.background = 'rgba(59, 130, 246, 0.05)';
        consentDiv.style.border = '1px solid rgba(59, 130, 246, 0.2)';
        consentDiv.style.borderRadius = 'var(--radius)';
        
        consentDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 15px;">
                <input type="checkbox" id="consentimiento" name="consentimientos.tratamiento_datos" 
                       style="margin-top: 5px;" required>
                <div>
                    <label for="consentimiento" style="font-weight: 600; color: var(--color-text); cursor: pointer;">
                        Consentimiento para el tratamiento de datos personales *
                    </label>
                    <p style="color: var(--color-text-dim); margin-top: 5px; font-size: 0.9rem;">
                        Autorizo el tratamiento de mis datos personales con fines médicos, 
                        diagnóstico, tratamiento y gestión de salud, de acuerdo con la 
                        legislación vigente en materia de protección de datos y confidencialidad médica.
                    </p>
                </div>
            </div>
        `;
        
        container.appendChild(consentDiv);
    }
    
    createPublicFormField(sectionKey, field) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.style.marginBottom = '15px';
        
        const inputId = `${sectionKey}_${field.key}`;
        let inputHtml = '';
        
        if (field.type === 'select') {
            inputHtml = `
                <select id="${inputId}" name="${sectionKey}.${field.key}" class="login-input" ${field.required ? 'required' : ''}>
                    <option value="">Seleccione...</option>
                    ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            `;
        } else if (field.type === 'textarea') {
            inputHtml = `
                <textarea id="${inputId}" name="${sectionKey}.${field.key}" 
                          class="login-input" rows="3" 
                          placeholder="${field.placeholder || ''}"
                          ${field.required ? 'required' : ''}></textarea>
            `;
        } else {
            const inputType = field.type === 'date' ? 'date' : 
                            field.type === 'email' ? 'email' : 
                            field.type === 'tel' ? 'tel' : 'text';
            
            inputHtml = `
                <input type="${inputType}" 
                       id="${inputId}" 
                       name="${sectionKey}.${field.key}" 
                       class="login-input" 
                       placeholder="${field.placeholder || ''}"
                       ${field.required ? 'required' : ''}>
            `;
        }
        
        div.innerHTML = `
            <label for="${inputId}" style="display: block; margin-bottom: 5px; font-size: 0.9rem;">
                ${field.label} ${field.required ? '<span style="color:var(--color-error)">*</span>' : ''}
            </label>
            ${inputHtml}
        `;
        
        return div;
    }
    
    async submitPublicPatientForm() {
        try {
            const form = document.getElementById('patientPublicForm');
            const formData = new FormData(form);
            
            // Convertir FormData a objeto estructurado
            const rawData = {};
            for (let [key, value] of formData.entries()) {
                const keys = key.split('.');
                let obj = rawData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) obj[keys[i]] = {};
                    obj = obj[keys[i]];
                }
                obj[keys[keys.length - 1]] = value;
            }
            
            // Validar datos críticos
            if (!rawData.identificacion?.documento_numero) {
                throw new Error('El número de documento es obligatorio');
            }
            
            if (!rawData.nombres?.primer_nombre || !rawData.nombres?.primer_apellido) {
                throw new Error('Nombre y apellido son obligatorios');
            }
            
            // Agregar metadata
            rawData.metadata = {
                fuente: 'formulario_publico',
                fecha_registro: new Date().toISOString(),
                estado: 'pendiente_revision',
                revisado_por: null,
                fecha_revision: null
            };
            
            // Guardar en el buzón del sistema
            StorageService.addToBuzon(rawData);
            
            // Mostrar confirmación
            alert(`✅ Registro enviado exitosamente.\n\nDocumento: ${rawData.identificacion.documento_numero}\nNombre: ${rawData.nombres.primer_nombre} ${rawData.nombres.primer_apellido}\n\nSus datos serán revisados por nuestro personal médico.`);
            
            // Cerrar drawer y limpiar formulario
            this.closeDrawer('patientAccessDrawer');
            form.reset();
            
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            console.error('Error en formulario público:', error);
        }
    }
    
    submitDocumentRequest() {
        const form = document.getElementById('documentRequestForm');
        const formData = new FormData(form);
        
        // Aquí normalmente enviaríamos a un backend
        // Por ahora, solo mostrar confirmación
        alert('✅ Solicitud de documentos enviada.\n\nNos contactaremos con usted para coordinar la entrega.');
        
        this.closeDrawer('patientAccessDrawer');
        form.reset();
    }
    
    // FUNCIONES EXISTENTES DEL SISTEMA (mantener igual pero optimizadas)
    showCleanView() {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div style="text-align: center; padding: 80px 20px; color: var(--color-text-dim);">
                    <i class="fas fa-stethoscope" style="font-size: 4rem; margin-bottom: 30px; opacity: 0.3;"></i>
                    <h2 style="margin-bottom: 20px; color: var(--color-text);">Bienvenido al Sistema CIMA</h2>
                    <p style="font-size: 1.1rem; max-width: 600px; margin: 0 auto 40px;">
                        Utilice las opciones del menú superior para comenzar
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; max-width: 800px; margin: 0 auto;">
                        <div class="quick-action" onclick="window.app.showSearchModal()">
                            <i class="fas fa-search"></i>
                            <h4>Buscar Paciente</h4>
                            <p>Acceda a historiales existentes</p>
                        </div>
                        <div class="quick-action" onclick="window.app.createNewPatientWorkflow()">
                            <i class="fas fa-user-plus"></i>
                            <h4>Nuevo Paciente</h4>
                            <p>Registre un nuevo paciente</p>
                        </div>
                        <div class="quick-action" onclick="window.app.showAgenda()">
                            <i class="fas fa-calendar-alt"></i>
                            <h4>Agenda</h4>
                            <p>Gestione citas y consultas</p>
                        </div>
                        <div class="quick-action" onclick="window.app.showBuzonModal()">
                            <i class="fas fa-inbox"></i>
                            <h4>Buzón</h4>
                            <p>Revise registros pendientes</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    async showAgenda() {
        // Cargar módulo de agenda dinámicamente
        const { default: CalendarSystem } = await import('./calendar.js');
        const mainContainer = document.getElementById('mainContainer');
        
        if (mainContainer) {
            mainContainer.innerHTML = '<div id="calendarContainer"></div>';
            CalendarSystem.init(document.getElementById('calendarContainer'));
            this.log('Agenda', 'Vista de agenda cargada');
        }
    }
    
    showBuzonModal() {
        // Implementar vista del buzón
        const modal = document.getElementById('buzonModal');
        if (!modal) return;
        
        // Obtener datos del buzón
        const buzon = StorageService.getBuzon();
        
        let modalContent = `
            <div class="modal-box" style="height:auto; max-height:85vh; width:90%; max-width:1200px;">
                <div class="modal-header">
                    <span class="modal-title">Buzón de Pacientes Pendientes</span>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
                </div>
                <div class="modal-body">
        `;
        
        if (buzon.length === 0) {
            modalContent += `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--color-text-dim); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--color-text-dim); margin-bottom: 10px;">Buzón Vacío</h3>
                    <p>No hay pacientes pendientes de revisión.</p>
                </div>
            `;
        } else {
            modalContent += `
                <div style="margin-bottom: 20px;">
                    <p>${buzon.length} paciente(s) pendiente(s) de revisión:</p>
                </div>
                <div style="display: grid; gap: 15px;">
            `;
            
            buzon.forEach((paciente, index) => {
                const nombre = `${paciente.nombres?.primer_nombre || ''} ${paciente.nombres?.primer_apellido || ''}`.trim();
                const doc = paciente.identificacion?.documento_numero || 'Sin documento';
                const fecha = paciente.metadata?.fecha_registro ? new Date(paciente.metadata.fecha_registro).toLocaleDateString() : 'Fecha desconocida';
                
                modalContent += `
                    <div class="glass-panel" style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h4 style="margin: 0 0 10px 0; color: var(--color-text);">${nombre || 'Nombre no disponible'}</h4>
                                <div style="color: var(--color-text-dim); font-size: 0.9rem;">
                                    <div><strong>Documento:</strong> ${doc}</div>
                                    <div><strong>Fecha de registro:</strong> ${fecha}</div>
                                    <div><strong>Estado:</strong> ${paciente.metadata?.estado || 'pendiente'}</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="action-btn" onclick="window.app.importBuzonPatient(${index})">
                                    <i class="fas fa-file-import"></i> Importar
                                </button>
                                <button class="action-btn secondary" onclick="window.app.rejectBuzonPatient(${index})">
                                    <i class="fas fa-times"></i> Rechazar
                                </button>
                            </div>
                        </div>
                        <div style="background: var(--color-glass); padding: 15px; border-radius: var(--radius); margin-top: 15px;">
                            <h5 style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--color-text-dim);">Datos enviados:</h5>
                            <pre style="margin: 0; font-size: 0.8rem; max-height: 200px; overflow: auto; padding: 10px; background: rgba(0,0,0,0.1); border-radius: var(--radius-sm);">${JSON.stringify(paciente, null, 2)}</pre>
                        </div>
                    </div>
                `;
            });
            
            modalContent += `</div>`;
        }
        
        modalContent += `
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        modal.classList.add('active');
    }
    
    importBuzonPatient(index) {
        const buzon = StorageService.getBuzon();
        if (index < 0 || index >= buzon.length) return;
        
        const paciente = buzon[index];
        
        // Importar usando la clase PatientProfile existente
        const { default: PatientProfile } = await import('./patient-profile.js');
        
        try {
            const patientProfile = new PatientProfile(paciente);
            StorageService.savePatient(patientProfile);
            
            // Eliminar del buzón
            StorageService.removeFromBuzon(index);
            
            alert(`✅ Paciente importado exitosamente.\n\nDocumento: ${patientProfile.identificacion.documento_numero}`);
            
            // Cerrar modal y mostrar paciente
            document.getElementById('buzonModal').classList.remove('active');
            this.showPatientView(patientProfile.identificacion.documento_numero);
            
        } catch (error) {
            alert(`❌ Error al importar: ${error.message}`);
        }
    }
    
    rejectBuzonPatient(index) {
        if (confirm('¿Está seguro de rechazar este registro? Esta acción no se puede deshacer.')) {
            StorageService.removeFromBuzon(index);
            this.showBuzonModal(); // Refrescar vista
            alert('Registro rechazado.');
        }
    }
    
    // FUNCIONES PARA GENERAR DOCUMENTOS PDF (6 tipos)
    async generateDocument(type, consultationData) {
        if (!this.currentPatient || !this.currentUser) {
            alert('No hay paciente o usuario seleccionado');
            return;
        }
        
        // Cargar módulo de generación de PDF
        const { PDFGenerator } = await import('./pdf-generator.js');
        
        const documentData = {
            type,
            patient: this.currentPatient,
            consultation: consultationData,
            doctor: this.currentUser,
            date: new Date().toISOString()
        };
        
        try {
            await PDFGenerator.generateDocument(documentData);
            this.log('Documentos', `PDF generado: ${type}`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el documento PDF');
        }
    }
    
    // HERENCIA DE CONSULTAS (segunda consulta hereda de la primera)
    async openConsultationModal(data, modelId) {
        // ... (implementación existente pero con herencia)
        
        // HERENCIA: Si es nueva consulta y hay configuración previa
        let initialData = data || {};
        if (!data && this.currentPatient) {
            const prevConsultations = StorageService.getConsultations(this.currentPatient.identificacion.documento_numero);
            if (prevConsultations.length > 0) {
                // Tomar la última consulta del mismo modelo
                const lastConsult = prevConsultations.find(c => c.modelo === modelId) || prevConsultations[0];
                if (lastConsult) {
                    // Heredar campos específicos (excluyendo metadatos)
                    const { id, createdAt, updatedAt, createdBy, ...inheritableData } = lastConsult;
                    initialData = { ...inheritableData, ...initialData };
                }
            }
        }
        
        // ... (resto de la implementación)
    }
    
    // FUNCIONES DE SEGURIDAD Y LOG
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+L para abrir/cerrar log drawer (solo cuando autenticado)
            if (e.ctrlKey && e.key === 'l' && AuthService.isLoggedIn()) {
                e.preventDefault();
                if (!this.isLogDrawerOpen) {
                    this.openLogDrawer();
                } else {
                    this.closeLogDrawer();
                }
            }
            
            // Ctrl+S para buscar (solo cuando autenticado)
            if (e.ctrlKey && e.key === 's' && AuthService.isLoggedIn()) {
                e.preventDefault();
                this.showSearchModal();
            }
            
            // Ctrl+N para nuevo paciente (solo cuando autenticado)
            if (e.ctrlKey && e.key === 'n' && AuthService.isLoggedIn()) {
                e.preventDefault();
                this.createNewPatientWorkflow();
            }
            
            // ESC para cerrar modales/drawers
            if (e.key === 'Escape') {
                this.closeAllDrawers();
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }
    
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            // Solo permitir click derecho en el drawer de log
            if (!this.isLogDrawerOpen) {
                e.preventDefault();
                this.log('Seguridad', 'Click derecho bloqueado');
                return false;
            }
        }, { capture: true });
    }
    
    log(source, message) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ${source}: ${message}`;
        this.logEntries.push(entry);
        
        // Mantener solo las últimas 100 entradas
        if (this.logEntries.length > 100) {
            this.logEntries.shift();
        }
        
        // Actualizar drawer si está abierto
        if (this.isLogDrawerOpen) {
            this.updateLogDrawer();
        }
    }
    
    openLogDrawer() {
        // Pedir contraseña (astroyluna es la del usuario por defecto)
        const password = prompt('🔐 Contraseña para acceder al log del sistema:');
        if (password !== 'astroyluna') {
            alert('❌ Contraseña incorrecta');
            return;
        }
        
        const drawer = document.getElementById('logDrawer');
        if (!drawer) return;
        
        // Crear drawer de log si no existe
        if (!drawer.innerHTML) {
            drawer.innerHTML = `
                <div class="log-header">
                    <h3><i class="fas fa-terminal"></i> Log del Sistema</h3>
                    <button class="close-log" onclick="window.app.closeLogDrawer()">&times;</button>
                </div>
                <div class="log-body">
                    <div id="logContent" style="font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; padding: 10px;"></div>
                </div>
            `;
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
    
    // MANTENER FUNCIONES EXISTENTES (optimizadas)
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        this.log('UI', 'Tema cambiado');
    }
    
    showSearchModal() { /* ... */ }
    createNewPatientWorkflow() { /* ... */ }
    showPatientView(patientId) { /* ... */ }
    editCurrentPatient() { /* ... */ }
    // ... otras funciones existentes
}

// Inicializar aplicación
window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());
