// app/logic/portal.js
import { $, $$, flash } from 'brain';
import { ServiceLoader } from './service_loader.js';

export const PortalManager = {
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'patient') {
            this.activatePatientMode();
        }
    },

    activatePatientMode() {
        // 1. Limpiar UI
        document.body.innerHTML = `
            <div class="portal-container" style="max-width:800px; margin:40px auto; padding:20px;">
                <div style="text-align:center; margin-bottom:40px;">
                    <h1 style="color:var(--primary); font-size:2.5rem;">CIMA</h1>
                    <p style="color:var(--text-muted);">Registro de Pacientes</p>
                </div>
                <div id="patient-form-mount" class="card"></div>
                <div style="margin-top:20px; text-align:right;">
                    <button class="btn btn-success" style="padding:15px 30px; font-size:1.1rem;" onclick="window.PortalManager.submitData()">ENVIAR DATOS</button>
                </div>
            </div>
        `;

        // 2. Cargar formulario de paciente
        ServiceLoader.init().then(() => {
            const PatientService = ServiceLoader.get('patient');
            // Hack para montar el template en nuestro container nuevo
            const mount = document.getElementById('patient-form-mount');
            // Necesitamos crear la estructura que patient.js espera
            mount.innerHTML = `<div id="patient-form-container"></div>`;
            
            // Inicializar formulario vacío
            PatientService.initializeNewPatient();
            
            // Desactivar campos internos
            const internalFields = ['internal_id', 'uuid', 'fecha_admision', 'fecha_alta', 'aseguradora'];
            internalFields.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.closest('.span-1')?.remove(); // Remover visualmente
            });
        });
    },

    submitData() {
        // En un futuro, esto enviaría a Cloudflare Workers
        // Por ahora, simulamos guardando en un "Inbox" en LocalStorage
        const PatientService = ServiceLoader.get('patient');
        const data = PatientService.getPatientData();
        
        // Validación básica
        if (!data.primer_nombre || !data.documento_numero) {
            alert("Por favor complete Nombre y Documento de Identidad.");
            return;
        }

        const inboxItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'Pre-Registro Web',
            data: data,
            status: 'pending'
        };

        const inbox = JSON.parse(localStorage.getItem('CIMA_INBOX') || '[]');
        inbox.push(inboxItem);
        localStorage.setItem('CIMA_INBOX', JSON.stringify(inbox));

        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                <i class="bi bi-check-circle-fill" style="font-size:5rem; color:#10b981;"></i>
                <h1>¡Datos Enviados!</h1>
                <p>Su información ha sido recibida correctamente.</p>
                <button class="btn btn-ghost" onclick="location.reload()">Nuevo Registro</button>
            </div>
        `;
    }
};

window.PortalManager = PortalManager;
