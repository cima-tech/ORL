/* modules/index.js - Aplicación principal */
import AuthService from './start.js';
import StorageService from './storage.js';
import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';
import Views from './views.js';

class CIMA {
    constructor() {
        this.currentUser = null;
        this.currentPatient = null;
        this.currentView = null;
        this.logEntries = [];
        this.isLogOpen = false;
        
        // Bindear métodos
        this.init = this.init.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.openDrawer = this.openDrawer.bind(this);
        this.closeDrawer = this.closeDrawer.bind(this);
        this.closeAllDrawers = this.closeAllDrawers.bind(this);
        this.switchDrawer = this.switchDrawer.bind(this);
        this.openLogDrawer = this.openLogDrawer.bind(this);
        this.updateLog = this.updateLog.bind(this);
    }
    
    async init() {
        // Configurar listeners de teclado
        this.setupKeyboardShortcuts();
        
        // Cargar estado de tema
        if (localStorage.getItem('CIMA_THEME') === 'light') {
            document.body.classList.add('light-mode');
        }
        
        // Verificar autenticación
        this.currentUser = AuthService.getCurrentUser();
        this.currentPatient = AuthService.getCurrentPatient();
        
        // Renderizar interfaz según autenticación
        this.renderInterface();
        
        // Configurar listeners de forms
        this.setupForms();
        
        // Mostrar vista limpia
        this.showCleanView();
        
        // Cargar logs
        this.updateLog();
        
        AuthService.log('Sistema', 'Aplicación inicializada');
    }
    
    renderInterface() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;
        
        if (this.currentUser) {
            // Usuario médico autenticado
            const userData = this.currentUser.data;
            nav.innerHTML = `
                <span id="btnAgenda"><i class="fas fa-calendar-alt"></i> Agenda</span>
                <span id="btnNewPatient"><i class="fas fa-user-plus"></i> Nuevo Paciente</span>
                <span id="btnSearch"><i class="fas fa-search"></i> Buscar</span>
                <span id="btnBuzon"><i class="fas fa-inbox"></i> Buzón</span>
                <span id="btnModels"><i class="fas fa-cogs"></i> Modelos</span>
                <span id="btnDocuments"><i class="fas fa-file-pdf"></i> Documentos</span>
            `;
            
            // Actualizar título del dock
            const userInfo = document.querySelector('.dock-right');
            if (userInfo) {
                userInfo.innerHTML = `
                    <span title="${userData.identity.names}">
                        <i class="fas fa-user-md"></i>
                    </span>
                    <span id="btnTheme" title="Cambiar tema">
                        <i class="fas fa-adjust"></i>
                    </span>
                    <span id="btnLogout" title="Cerrar sesión">
                        <i class="fas fa-sign-out-alt"></i>
                    </span>
                `;
            }
            
            // Configurar listeners
            document.getElementById('btnAgenda').onclick = () => this.showAgenda();
            document.getElementById('btnNewPatient').onclick = () => this.createNewPatientWorkflow();
            document.getElementById('btnSearch').onclick = () => this.showSearchModal();
            document.getElementById('btnBuzon').onclick = () => this.showBuzonModal();
            document.getElementById('btnModels').onclick = () => this.showModelsManager();
            document.getElementById('btnDocuments').onclick = () => this.showDocumentManager();
            document.getElementById('btnLogout').onclick = () => this.logout();
            
        } else if (this.currentPatient) {
            // Paciente autenticado
            nav.innerHTML = `
                <span id="btnPatientInfo"><i class="fas fa-user"></i> Mi Información</span>
                <span id="btnPatientDocuments"><i class="fas fa-file-medical"></i> Mis Documentos</span>
                <span id="btnPatientAppointments"><i class="fas fa-calendar-check"></i> Mis Citas</span>
            `;
            
            document.getElementById('btnPatientInfo').onclick = () => this.showPatientInfo();
            document.getElementById('btnPatientDocuments').onclick = () => this.showPatientDocuments();
            document.getElementById('btnPatientAppointments').onclick = () => this.showPatientAppointments();
            
        } else {
            // No autenticado
            nav.innerHTML = `
                <span onclick="CIMA.openDrawer('loginDrawer')">
                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                </span>
                <span onclick="CIMA.openDrawer('patientAccessDrawer')">
                    <i class="fas fa-user-injured"></i> Área Paciente
                </span>
            `;
        }
        
        // Tema siempre disponible
        document.getElementById('btnTheme').onclick = this.toggleTheme;
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+L para abrir log
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.openLogDrawer();
            }
            
            // Escape para cerrar drawers/modales
            if (e.key === 'Escape') {
                this.closeAllDrawers();
                this.closeAllModals();
            }
            
            // Ctrl+S para buscar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (this.currentUser) {
                    this.showSearchModal();
                }
            }
            
            // Ctrl+N para nuevo paciente
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                if (this.currentUser) {
                    this.createNewPatientWorkflow();
                }
            }
        });
    }
    
    setupForms() {
        // Formulario de login médico
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                try {
                    await AuthService.login(username, password);
                    location.reload();
                } catch (error) {
                    alert(error.message);
                }
            };
        }
        
        // Configurar formulario de paciente (se llenará dinámicamente)
        this.setupPatientForm();
    }
    
    setupPatientForm() {
        const container = document.getElementById('patientFormContainer');
        if (!container) return;
        
        // Renderizar formulario completo de paciente
        Views.renderPatientForm(container, {}, (data) => {
            // Al enviar, guardar en buzon
            try {
                const buzonId = StorageService.addToBuzon(data);
                alert('Datos enviados correctamente. El médico revisará su información.');
                this.closeDrawer('patientRegisterDrawer');
                
                // Limpiar formulario
                container.innerHTML = '';
                Views.renderPatientForm(container, {}, (data) => {
                    const buzonId = StorageService.addToBuzon(data);
                    alert('Datos enviados correctamente.');
                    this.closeDrawer('patientRegisterDrawer');
                });
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
    
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('CIMA_THEME', 
            document.body.classList.contains('light-mode') ? 'light' : 'dark'
        );
        AuthService.log('Sistema', 'Tema cambiado');
    }
    
    openDrawer(drawerId) {
        const drawer = document.getElementById(drawerId);
        const overlay = document.getElementById('drawerOverlay');
        
        if (drawer && overlay) {
            drawer.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeDrawer(drawerId) {
        const drawer = document.getElementById(drawerId);
        const overlay = document.getElementById('drawerOverlay');
        
        if (drawer) {
            drawer.classList.remove('open');
        }
        
        // Verificar si hay otros drawers abiertos
        const openDrawers = document.querySelectorAll('.drawer.open');
        if (openDrawers.length === 0) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    closeAllDrawers() {
        document.querySelectorAll('.drawer').forEach(drawer => {
            drawer.classList.remove('open');
        });
        document.getElementById('drawerOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    switchDrawer(fromId, toId) {
        this.closeDrawer(fromId);
        setTimeout(() => this.openDrawer(toId), 300);
    }
    
    openLogDrawer() {
        const password = prompt('Contraseña para acceder al log:');
        if (password !== 'astroyluna') {
            alert('Contraseña incorrecta');
            return;
        }
        this.openDrawer('logDrawer');
        this.updateLog();
    }
    
    updateLog() {
        const logContent = document.getElementById('logContent');
        if (logContent) {
            const logs = AuthService.getLogs();
            logContent.innerHTML = logs.map(log => 
                `<div class="log-entry">${log}</div>`
            ).join('');
            logContent.scrollTop = 0;
        }
    }
    
    showCleanView() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        if (this.currentUser) {
            mainContent.innerHTML = `
                <div class="clean-view">
                    <i class="fas fa-stethoscope"></i>
                    <h2>Bienvenido, ${this.currentUser.data.identity.names}</h2>
                    <p>Seleccione una opción del menú superior para comenzar</p>
                </div>
            `;
        } else if (this.currentPatient) {
            mainContent.innerHTML = `
                <div class="clean-view">
                    <i class="fas fa-user-injured"></i>
                    <h2>Bienvenido, ${this.currentPatient.name}</h2>
                    <p>Utilice el menú superior para acceder a sus datos</p>
                </div>
            `;
        } else {
            mainContent.innerHTML = `
                <div class="clean-view">
                    <i class="fas fa-heartbeat"></i>
                    <h2>CIMA Sistema Clínico</h2>
                    <p>Inicie sesión o acceda al área de pacientes para comenzar</p>
                </div>
            `;
        }
    }
    
    logout() {
        AuthService.logout();
        location.reload();
    }
    
    // Funciones existentes (mantenidas para compatibilidad)
    createNewPatientWorkflow() {
        // Abrir modal de edición con formulario vacío
        const modal = document.getElementById('editModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        const btn = document.getElementById('btnSaveConsultation');
        
        if(title) title.textContent = "Nuevo Paciente";
        if(btn) btn.textContent = "Guardar Paciente";
        
        if(body) {
            body.innerHTML = '';
            Views.renderPatientForm(body, {});
            modal.classList.add('active');
            
            const newBtn = btn.cloneNode(true);
            if(btn) {
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.onclick = () => {
                    const inputs = body.querySelectorAll('input, select, textarea');
                    const formData = new FormData();
                    inputs.forEach(input => {
                        if(input.name) {
                            formData.append(input.name, 
                                input.type === 'checkbox' ? input.checked : input.value
                            );
                        }
                    });
                    
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
                };
            }
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
                             onclick="CIMA.showPatientView('${p.identificacion.documento_numero}'); 
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
        // Implementar vista de paciente
        console.log('Mostrando paciente:', patientId);
    }
    
    showBuzonModal() {
        // Implementar vista de buzón
        console.log('Mostrando buzón');
    }
    
    showAgenda() {
        // Implementar agenda
        console.log('Mostrando agenda');
    }
    
    showModelsManager() {
        // Implementar gestión de modelos
        console.log('Mostrando gestor de modelos');
    }
    
    showDocumentManager() {
        // Implementar gestor de documentos
        console.log('Mostrando gestor de documentos');
    }
    
    // Métodos del paciente
    showPatientInfo() {
        console.log('Mostrando información del paciente');
    }
    
    showPatientDocuments() {
        console.log('Mostrando documentos del paciente');
    }
    
    showPatientAppointments() {
        console.log('Mostrando citas del paciente');
    }
    
    // Métodos de documentos
    addSignature() {
        console.log('Añadir firma');
    }
    
    addStamp() {
        console.log('Añadir sello');
    }
    
    generatePDF() {
        console.log('Generar PDF');
    }
    
    printDocument() {
        console.log('Imprimir documento');
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('active');
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Método de sanitización (copiado de tu código original)
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

        return raw;
    }
}

// Crear instancia global
window.CIMA = new CIMA();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => window.CIMA.init());

// Exportar para módulos
export default CIMA;
