import { $, $$ } from 'brain';
import { StandardPatientForm } from './patient_form.js'; // Importamos el form genérico

export const PortalManager = {
    selectedDoctor: null,

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'patient') {
            this.injectStyles();
            this.renderDoctorSelection();
        }
    },

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            body { background: #0f172a; overflow-y: auto; color: #f8fafc; font-family: 'Roboto Condensed', sans-serif; }
            .portal-container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .doctor-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 10px;
            }
            .doctor-card:hover {
                background: rgba(255,255,255,0.1);
                border-color: #0ea5e9;
                transform: translateX(5px);
            }
            .doctor-avatar {
                width: 50px; height: 50px;
                border-radius: 50%;
                background: #334155;
                background-size: cover;
                background-position: center;
            }
            .portal-step-title {
                text-align: center; margin-bottom: 30px;
            }
        `;
        document.head.appendChild(style);
    },

    async renderDoctorSelection() {
        document.body.innerHTML = `<div class="portal-container" id="portal-root">
            <div style="text-align:center; margin-top:40px;">Cargando especialistas...</div>
        </div>`;

        try {
            // Cargar usuarios disponibles
            const res = await fetch('./app/catalog/users.json');
            const users = await res.json();
            // Filtrar solo doctores activos (por ahora todos)
            
            let doctorsHTML = users.map(u => `
                <div class="doctor-card" onclick="window.PortalManager.selectDoctor('${u.id}', '${u.name}')">
                    <div class="doctor-avatar" style="background-image: url('${u.avatar}')"></div>
                    <div>
                        <div style="font-weight:bold; font-size:1.1rem;">${u.name}</div>
                        <div style="color:#94a3b8; font-size:0.9rem;">Especialista</div>
                    </div>
                    <div style="margin-left:auto; color:#0ea5e9;"><i class="bi bi-chevron-right"></i></div>
                </div>
            `).join('');

            document.getElementById('portal-root').innerHTML = `
                <div class="portal-step-title">
                    <div style="font-size:3rem; color:#0ea5e9; margin-bottom:10px;"><i class="bi bi-hospital"></i></div>
                    <h1>Bienvenido a CIMA</h1>
                    <p style="color:#94a3b8;">Seleccione el especialista con quien desea atenderse:</p>
                </div>
                <div>${doctorsHTML}</div>
            `;

        } catch (e) {
            document.getElementById('portal-root').innerHTML = `<div style="color:red; text-align:center;">Error cargando directorio médico.</div>`;
        }
    },

    selectDoctor(id, name) {
        this.selectedDoctor = { id, name };
        this.renderForm();
    },

    renderForm() {
        const root = document.getElementById('portal-root');
        root.innerHTML = `
            <div style="margin-bottom:20px;">
                <button class="btn btn-ghost btn-small" onclick="window.PortalManager.renderDoctorSelection()"><i class="bi bi-arrow-left"></i> Volver</button>
            </div>
            <div class="portal-step-title">
                <h2>Registro de Paciente</h2>
                <div style="background:rgba(14,165,233,0.1); color:#38bdf8; display:inline-block; padding:5px 15px; border-radius:20px; font-size:0.9rem;">
                    Dr(a). ${this.selectedDoctor.name}
                </div>
            </div>
            
            <div id="portal-form-container" class="card"></div>

            <div style="margin-top:30px;">
                <button class="btn btn-success" style="width:100%; padding:15px; font-size:1.1rem;" onclick="window.PortalManager.submitData()">
                    ENVIAR DATOS
                </button>
            </div>
        `;

        // Renderizar el formulario genérico aquí
        StandardPatientForm.render('portal-form-container');
    },

    submitData() {
        const data = StandardPatientForm.getData();

        if (!data.primer_nombre || !data.documento_numero || !data.tel_principal) {
            alert("Por favor complete al menos: Nombre, Documento y Teléfono.");
            return;
        }

        // Crear el paquete para el Inbox
        const inboxItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'Pre-Registro Web',
            targetDoctorId: this.selectedDoctor.id, // IMPORTANTE: Para filtrar en el dashboard
            patientName: `${data.primer_nombre} ${data.primer_apellido}`,
            data: data, // Datos crudos para que el doctor decida qué usar
            status: 'pending'
        };

        // Guardar en LocalStorage (Simulación de Backend)
        // Nota: En producción esto va a una tabla 'inbox' en D1
        const inbox = JSON.parse(localStorage.getItem('CIMA_INBOX') || '[]');
        inbox.push(inboxItem);
        localStorage.setItem('CIMA_INBOX', JSON.stringify(inbox));

        // Pantalla final
        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; color:white;">
                <div style="width:80px; height:80px; background:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                    <i class="bi bi-check-lg" style="font-size:3rem; color:white;"></i>
                </div>
                <h1>¡Registro Exitoso!</h1>
                <p style="color:#cbd5e1; max-width:400px; margin-bottom:30px;">
                    Sus datos han sido enviados al consultorio del <strong>Dr(a). ${this.selectedDoctor.name}</strong>.
                </p>
                <button class="btn btn-ghost" onclick="location.reload()">Nuevo Registro</button>
            </div>
        `;
    }
};

window.PortalManager = PortalManager;
