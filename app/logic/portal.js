import { $, $$, flash, fmtDate } from 'brain';
import { StandardPatientForm } from './patient_form.js';

export const PortalManager = {
    selectedDoctor: null,
    identifiedPatient: null, // Si existe, guardamos sus datos mínimos aquí

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'patient') {
            this.injectStyles();
            this.renderIdentityCheck(); // PASO 1: Identificación
        }
    },

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            body { background: #0f172a; overflow-y: auto; color: #f8fafc; font-family: 'Roboto Condensed', sans-serif; }
            .portal-container { max-width: 600px; margin: 0 auto; padding: 20px; }
            
            /* Cards de Doctores */
            .doctor-card {
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;
                cursor: pointer; transition: all 0.2s; margin-bottom: 10px;
            }
            .doctor-card:hover { background: rgba(255,255,255,0.1); border-color: #0ea5e9; transform: translateX(5px); }
            .doctor-avatar { width: 50px; height: 50px; border-radius: 50%; background: #334155; background-size: cover; background-position: center; }
            
            /* Botones de Menú (Solicitudes) */
            .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
            .menu-btn {
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s;
                display: flex; flex-direction: column; align-items: center; gap: 10px;
            }
            .menu-btn:hover { background: rgba(14, 165, 233, 0.1); border-color: #0ea5e9; transform: translateY(-3px); }
            .menu-btn i { font-size: 2rem; color: #0ea5e9; }
            
            .portal-step-title { text-align: center; margin-bottom: 30px; }
            .input-lg { padding: 15px; font-size: 1.2rem; text-align: center; letter-spacing: 2px; }
        `;
        document.head.appendChild(style);
    },

    // ----------------------------------------------------
    // PASO 1: IDENTIFICACIÓN
    // ----------------------------------------------------
    renderIdentityCheck() {
        document.body.innerHTML = `
        <div class="portal-container">
            <div class="portal-step-title" style="margin-top:50px;">
                <div style="font-size:3rem; color:#0ea5e9; margin-bottom:10px;"><i class="bi bi-hospital"></i></div>
                <h1>Bienvenido a CIMA</h1>
                <p style="color:#94a3b8;">Por favor ingrese su documento para continuar.</p>
            </div>
            
            <div class="card" style="padding:30px; border:1px solid rgba(255,255,255,0.1);">
                <div style="margin-bottom:20px;">
                    <label style="display:block; margin-bottom:10px; color:#cbd5e1;">Cédula / Pasaporte</label>
                    <div style="display:flex; gap:10px;">
                        <select id="auth-type" class="p-select" style="width:80px; padding:15px; background:rgba(0,0,0,0.3); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
                            <option value="V-">V-</option>
                            <option value="E-">E-</option>
                            <option value="P-">P-</option>
                        </select>
                        <input id="auth-doc" type="tel" class="input-lg" style="flex:1; width:100%; background:rgba(0,0,0,0.3); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:8px;" placeholder="12345678">
                    </div>
                </div>
                <button class="btn btn-primary" style="width:100%; padding:15px; font-size:1.1rem;" onclick="window.PortalManager.checkIdentity()">CONTINUAR</button>
            </div>
        </div>`;
    },

    checkIdentity() {
        const type = document.getElementById('auth-type').value;
        const num = document.getElementById('auth-doc').value.trim();
        if (!num) return alert("Ingrese su número de documento");

        const fullDoc = type + num; // Ej: V-12345678

        // Simulamos búsqueda en DB Local (CIMA_DB_ORL_V2)
        // Nota: En Cloudflare esto será un fetch a la API
        const db = JSON.parse(localStorage.getItem('CIMA_DB_ORL_V2') || '{}');
        
        // Buscar por key (que es el documento) o iterar si la estructura es diferente
        // Asumimos que la llave principal es el documento como definimos en engine.js
        let patient = db[fullDoc] ? db[fullDoc].patient : null;

        if (patient) {
            // PACIENTE EXISTE -> CAMINO A
            this.identifiedPatient = patient;
            this.renderDoctorSelection('existing'); 
        } else {
            // PACIENTE NUEVO -> CAMINO B
            this.identifiedPatient = { documento_numero: fullDoc }; // Guardamos lo que escribió para pre-llenar
            if(confirm(`El documento ${fullDoc} no está registrado.\n¿Desea crear una ficha nueva?`)) {
                this.renderDoctorSelection('new');
            }
        }
    },

    // ----------------------------------------------------
    // PASO 2: SELECCIÓN DE DOCTOR (Reutilizable)
    // ----------------------------------------------------
    async renderDoctorSelection(flowType) {
        // flowType: 'new' | 'existing'
        const title = flowType === 'new' ? "Registro de Nuevo Paciente" : `Hola, ${this.identifiedPatient.primer_nombre}`;
        const subtitle = flowType === 'new' ? "Seleccione con quién desea atenderse:" : "Seleccione el especialista para su solicitud:";

        document.body.innerHTML = `<div class="portal-container" id="portal-root"><div style="text-align:center;">Cargando...</div></div>`;

        try {
            const res = await fetch('./app/catalog/users.json');
            const users = await res.json();
            
            let doctorsHTML = users.map(u => `
                <div class="doctor-card" onclick="window.PortalManager.selectDoctor('${u.id}', '${u.name}', '${flowType}')">
                    <div class="doctor-avatar" style="background-image: url('${u.avatar}')"></div>
                    <div>
                        <div style="font-weight:bold; font-size:1.1rem;">${u.name}</div>
                        <div style="color:#94a3b8; font-size:0.9rem;">Especialista</div>
                    </div>
                    <div style="margin-left:auto; color:#0ea5e9;"><i class="bi bi-chevron-right"></i></div>
                </div>
            `).join('');

            document.getElementById('portal-root').innerHTML = `
                <div style="margin-bottom:20px;">
                    <button class="btn btn-ghost btn-small" onclick="window.PortalManager.renderIdentityCheck()"><i class="bi bi-arrow-left"></i> Salir</button>
                </div>
                <div class="portal-step-title">
                    <h2>${title}</h2>
                    <p style="color:#94a3b8;">${subtitle}</p>
                </div>
                <div>${doctorsHTML}</div>
            `;
        } catch (e) {
            document.body.innerHTML = "Error cargando doctores.";
        }
    },

    selectDoctor(id, name, flowType) {
        this.selectedDoctor = { id, name };
        if (flowType === 'new') {
            this.renderRegistrationForm();
        } else {
            this.renderRequestMenu();
        }
    },

    // ----------------------------------------------------
    // CAMINO A: MENÚ DE SOLICITUDES (Existente)
    // ----------------------------------------------------
    renderRequestMenu() {
        const root = document.getElementById('portal-root');
        root.innerHTML = `
            <div style="margin-bottom:20px;">
                <button class="btn btn-ghost btn-small" onclick="window.PortalManager.renderDoctorSelection('existing')"><i class="bi bi-arrow-left"></i> Volver</button>
            </div>
            <div class="portal-step-title">
                <h2>¿Qué desea solicitar?</h2>
                <div style="background:rgba(14,165,233,0.1); color:#38bdf8; display:inline-block; padding:5px 15px; border-radius:20px; font-size:0.9rem;">
                    Dr(a). ${this.selectedDoctor.name}
                </div>
            </div>
            
            <div class="menu-grid">
                <div class="menu-btn" onclick="window.PortalManager.renderRequestForm('CITA')">
                    <i class="bi bi-calendar-event"></i>
                    <span>Solicitar Cita</span>
                </div>
                <div class="menu-btn" onclick="window.PortalManager.renderRequestForm('ESTUDIO')">
                    <i class="bi bi-activity"></i>
                    <span>Solicitar Estudio</span>
                </div>
                <div class="menu-btn" onclick="window.PortalManager.renderRequestForm('RESULTADOS')">
                    <i class="bi bi-file-earmark-medical"></i>
                    <span>Solicitar Resultados</span>
                </div>
                <div class="menu-btn" onclick="window.PortalManager.renderRequestForm('MENSAJE')">
                    <i class="bi bi-chat-text"></i>
                    <span>Enviar Mensaje</span>
                </div>
            </div>
        `;
    },

    renderRequestForm(type) {
        const labels = {
            'CITA': 'Solicitud de Cita',
            'ESTUDIO': 'Solicitud de Estudio',
            'RESULTADOS': 'Solicitud de Resultados',
            'MENSAJE': 'Enviar Mensaje'
        };

        const extraFields = this.getFieldsForType(type);

        const root = document.getElementById('portal-root');
        root.innerHTML = `
            <div style="margin-bottom:20px;">
                <button class="btn btn-ghost btn-small" onclick="window.PortalManager.renderRequestMenu()"><i class="bi bi-arrow-left"></i> Volver</button>
            </div>
            <div class="card" style="padding:25px; border:1px solid rgba(255,255,255,0.1);">
                <h2 style="color:#0ea5e9; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:20px;">${labels[type]}</h2>
                
                ${extraFields}

                <div style="margin-top:20px;">
                    <label style="display:block; margin-bottom:8px; color:#cbd5e1;">Mensaje / Observaciones Adicionales</label>
                    <textarea id="req-msg" class="p-input" rows="4" style="width:100%; background:rgba(0,0,0,0.3); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;"></textarea>
                </div>

                <button class="btn btn-success" style="width:100%; margin-top:20px; padding:15px; font-size:1.1rem;" onclick="window.PortalManager.submitRequest('${type}')">
                    ENVIAR SOLICITUD
                </button>
            </div>
        `;
    },

    getFieldsForType(type) {
        if (type === 'CITA') {
            return `
            <div>
                <label style="display:block; margin-bottom:8px; color:#cbd5e1;">Fecha Preferida (Opcional)</label>
                <input type="date" id="req-date" class="p-input" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:white;">
            </div>`;
        }
        if (type === 'ESTUDIO') {
            return `
            <div>
                <label style="display:block; margin-bottom:8px; color:#cbd5e1;">Nombre del Estudio</label>
                <select id="req-study" class="p-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:white;">
                    <option value="Nasofibrolaringoscopia">Nasofibrolaringoscopia</option>
                    <option value="Endoscopia">Endoscopia</option>
                    <option value="Audiometria">Audiometría</option>
                    <option value="Otro">Otro (Especifique abajo)</option>
                </select>
            </div>`;
        }
        if (type === 'RESULTADOS') {
            return `
            <div>
                <label style="display:block; margin-bottom:8px; color:#cbd5e1;">Fecha de la Consulta/Estudio</label>
                <input type="date" id="req-date" class="p-input" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:white;">
            </div>`;
        }
        return '';
    },

    submitRequest(type) {
        const msg = document.getElementById('req-msg').value;
        const date = document.getElementById('req-date')?.value;
        const study = document.getElementById('req-study')?.value;

        // Construir paquete para Inbox
        const inboxItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: `Solicitud: ${type}`,
            targetDoctorId: this.selectedDoctor.id,
            patientName: `${this.identifiedPatient.primer_nombre} ${this.identifiedPatient.primer_apellido}`,
            patientDoc: this.identifiedPatient.documento_numero,
            details: {
                message: msg,
                preferredDate: date,
                studyType: study
            },
            status: 'pending'
        };

        this.pushToInbox(inboxItem);
        this.renderSuccess("Solicitud Enviada", "El doctor revisará su solicitud y le responderá a la brevedad.");
    },

    // ----------------------------------------------------
    // CAMINO B: REGISTRO NUEVO (Existente)
    // ----------------------------------------------------
    renderRegistrationForm() {
        const root = document.getElementById('portal-root');
        root.innerHTML = `
            <div style="margin-bottom:20px;">
                <button class="btn btn-ghost btn-small" onclick="window.PortalManager.renderDoctorSelection('new')"><i class="bi bi-arrow-left"></i> Volver</button>
            </div>
            <div class="portal-step-title">
                <h2>Ficha de Ingreso</h2>
                <div style="background:rgba(14,165,233,0.1); color:#38bdf8; display:inline-block; padding:5px 15px; border-radius:20px; font-size:0.9rem;">
                    Dr(a). ${this.selectedDoctor.name}
                </div>
            </div>
            
            <div id="portal-form-container" class="card" style="border:1px solid rgba(255,255,255,0.1);"></div>

            <div style="margin-top:30px;">
                <button class="btn btn-success" style="width:100%; padding:15px; font-size:1.1rem;" onclick="window.PortalManager.submitRegistration()">
                    ENVIAR DATOS
                </button>
            </div>
        `;

        StandardPatientForm.render('portal-form-container');
        
        // Pre-llenar cédula si la escribió en el paso 1
        if (this.identifiedPatient && this.identifiedPatient.documento_numero) {
            // Un pequeño hack para separar V-1234
            const raw = this.identifiedPatient.documento_numero;
            const type = raw.substring(0, 2);
            const num = raw.substring(2);
            
            setTimeout(() => {
                const elType = document.getElementById('p_documento_tipo');
                const elNum = document.getElementById('p_documento_numero');
                if(elType) elType.value = type.includes('V') ? 'C.I.' : 'Pasaporte'; // Simplificación
                if(elNum) elNum.value = num;
            }, 100);
        }
    },

    submitRegistration() {
        const data = StandardPatientForm.getData();

        if (!data.primer_nombre || !data.documento_numero || !data.tel_principal) {
            alert("Por favor complete al menos: Nombre, Documento y Teléfono.");
            return;
        }

        const inboxItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'Pre-Registro Web',
            targetDoctorId: this.selectedDoctor.id,
            patientName: `${data.primer_nombre} ${data.primer_apellido}`,
            patientDoc: data.documento_numero, // Nuevo campo para visualización rápida
            data: data,
            status: 'pending'
        };

        this.pushToInbox(inboxItem);
        this.renderSuccess("¡Registro Exitoso!", "Sus datos han sido recibidos. Por favor anuncie su llegada en recepción.");
    },

    // ----------------------------------------------------
    // UTILS
    // ----------------------------------------------------
    pushToInbox(item) {
        const inbox = JSON.parse(localStorage.getItem('CIMA_INBOX') || '[]');
        inbox.push(item);
        localStorage.setItem('CIMA_INBOX', JSON.stringify(inbox));
    },

    renderSuccess(title, msg) {
        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; background:#0f172a; color:white;">
                <div style="width:80px; height:80px; background:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                    <i class="bi bi-check-lg" style="font-size:3rem; color:white;"></i>
                </div>
                <h1 style="margin-bottom:10px;">${title}</h1>
                <p style="color:#cbd5e1; max-width:400px; margin-bottom:30px;">${msg}</p>
                <button class="btn btn-ghost" onclick="location.reload()">Volver al Inicio</button>
            </div>
        `;
    }
};

window.PortalManager = PortalManager;
