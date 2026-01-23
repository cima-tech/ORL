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
        // 1. Inyectar CSS específico para Modo Paciente (Mejoras visuales y ocultamiento)
        const style = document.createElement('style');
        style.innerHTML = `
            body { background: #0f172a; overflow-y: auto; }
            .portal-container { max-width: 800px; margin: 0 auto; padding: 20px; padding-bottom: 100px; }
            
            /* Ocultar elementos técnicos o innecesarios para el paciente */
            #imc_auto, 
            label[for="imc_auto"],
            #internal_id, 
            label[for="internal_id"],
            #uuid, 
            label[for="uuid"],
            .patient-toggle-btn, /* Botón colapsar del header */
            .btn-ghost:nth-child(2) /* Botón colapsar del footer */
            { display: none !important; }

            /* Hacer campos de texto más anchos en móvil/portal */
            .form-grid .span-1 { grid-column: span 2; } /* En móvil todo es más ancho */
            .form-grid .span-2, .form-grid .span-4 { grid-column: span 4; }
            
            @media (min-width: 768px) {
                .form-grid .span-1 { grid-column: span 1; } /* Restaurar en PC */
                /* Pero forzar anchos en campos de texto largo */
                #alergias_detalle, #cronicas_detalle, #medicamentos_detalle, #dir_calle_num {
                    grid-column: span 4 !important;
                }
            }

            /* Feedback visual para la foto */
            .patient-avatar-container::after {
                content: 'Subir Foto';
                display: block;
                font-size: 0.6rem;
                position: absolute;
                bottom: 5px;
                width: 100%;
                text-align: center;
                background: rgba(0,0,0,0.5);
                color: white;
            }
        `;
        document.head.appendChild(style);

        // 2. Renderizar Estructura Base
        document.body.innerHTML = `
            <div class="portal-container">
                <div style="text-align:center; margin-bottom:30px; margin-top:20px;">
                    <div style="font-size:3rem; color:#0ea5e9;"><i class="bi bi-hospital"></i></div>
                    <h1 style="color:white; font-size:2rem; margin:10px 0;">Registro de Paciente</h1>
                    <p style="color:#94a3b8;">Por favor complete sus datos para agilizar su atención.</p>
                </div>

                <div id="patient-form-mount" class="card" style="border:1px solid rgba(255,255,255,0.1);"></div>
                
                <div style="margin-top:30px; text-align:right;">
                    <button class="btn btn-success" style="padding:15px 40px; font-size:1.2rem; width:100%; border-radius:12px;" onclick="window.PortalManager.submitData()">
                        <i class="bi bi-send-fill"></i> ENVIAR DATOS
                    </button>
                </div>
                
                <div style="margin-top:40px; text-align:center; color:#64748b; font-size:0.8rem;">
                    <p>Sus datos están seguros y serán usados únicamente para su historia médica.</p>
                    <p>Para solicitar resultados o documentos anteriores, por favor contacte a recepción.</p>
                </div>
            </div>
        `;

        // 3. Cargar formulario de paciente
        ServiceLoader.init().then(() => {
            const PatientService = ServiceLoader.get('patient');
            const mount = document.getElementById('patient-form-mount');
            mount.innerHTML = `<div id="patient-form-container"></div>`;
            
            // Inicializar formulario
            PatientService.initializeNewPatient();
            
            // Ajustes POST-RENDERIZADO
            this.tweakUI();
        });
    },

    tweakUI() {
        // 1. Placeholder en Dropdowns
        document.querySelectorAll('select').forEach(sel => {
            // Verificar si ya tiene opción vacía
            if (sel.options.length > 0 && sel.options[0].value !== "") {
                const opt = new Option("Seleccione una opción...", "", true, true);
                opt.disabled = true;
                sel.prepend(opt);
                sel.selectedIndex = 0;
            }
        });

        // 2. Valores por defecto limpieza
        const defaultClean = ['Generando...', 'p0000001u001'];
        document.querySelectorAll('input').forEach(inp => {
            if(defaultClean.includes(inp.value)) inp.value = "";
        });
    },

    submitData() {
        const PatientService = ServiceLoader.get('patient');
        const data = PatientService.getPatientData();
        
        // Validación básica
        if (!data.primer_nombre || !data.documento_numero || !data.tel_principal) {
            alert("Por favor complete al menos: Nombre, Documento y Teléfono.");
            return;
        }

        // FOTO: Recuperar si existe en el DOM (el input file)
        const photoInput = document.getElementById('patient-photo-input');
        let photoData = null;
        // Intentar leer la imagen preview si ya se cargó en base64 en patient.js
        const imgPreview = document.getElementById('patient-photo-img');
        if (imgPreview && !imgPreview.classList.contains('hidden')) {
            photoData = imgPreview.src;
        }

        const inboxItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'Pre-Registro Web',
            patientName: `${data.primer_nombre} ${data.primer_apellido}`,
            data: data,
            photo: photoData, // Enviamos la foto al inbox
            status: 'pending'
        };

        // Guardar en Inbox (Simulado)
        const inbox = JSON.parse(localStorage.getItem('CIMA_INBOX') || '[]');
        inbox.push(inboxItem);
        localStorage.setItem('CIMA_INBOX', JSON.stringify(inbox));

        // Pantalla de éxito
        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; background:#0f172a; color:white;">
                <div style="width:80px; height:80px; background:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                    <i class="bi bi-check-lg" style="font-size:3rem; color:white;"></i>
                </div>
                <h1 style="margin-bottom:10px;">¡Datos Recibidos!</h1>
                <p style="color:#cbd5e1; max-width:400px;">Su información ha sido registrada exitosamente. Por favor notifique su llegada en la recepción.</p>
                <button class="btn btn-ghost" style="margin-top:30px;" onclick="location.reload()">Nuevo Registro</button>
            </div>
        `;
    }
};

window.PortalManager = PortalManager;
