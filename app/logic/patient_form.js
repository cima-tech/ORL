// app/logic/patient_form.js
import { $, $$ } from 'brain';

export const StandardPatientForm = {
    render(containerId) {
        const container = document.getElementById(containerId);
        if(!container) return;

        container.innerHTML = `
        <div class="form-section">
            <div class="form-section-title">Identificación</div>
            <div class="form-grid">
                <div class="span-1">
                    <label class="form-label">Tipo</label>
                    <select id="portal-doc-type" class="form-select">
                        <option value="C.I.">Cédula</option>
                        <option value="Pasaporte">Pasaporte</option>
                    </select>
                </div>
                <div class="span-1">
                    <label class="form-label">Número</label>
                    <input id="portal-doc-num" class="form-input" placeholder="Ej: 12345678" type="tel">
                </div>
                <div class="span-1">
                    <label class="form-label">Nombre</label>
                    <input id="portal-name" class="form-input">
                </div>
                <div class="span-1">
                    <label class="form-label">Apellido</label>
                    <input id="portal-lastname" class="form-input">
                </div>
            </div>
        </div>

        <div class="form-section">
            <div class="form-section-title">Contacto</div>
            <div class="form-grid">
                <div class="span-1">
                    <label class="form-label">Teléfono Móvil</label>
                    <input id="portal-phone" class="form-input" placeholder="+58...">
                </div>
                <div class="span-1">
                    <label class="form-label">Email</label>
                    <input id="portal-email" class="form-input" type="email">
                </div>
                <div class="span-2">
                    <label class="form-label">Dirección / Ciudad</label>
                    <input id="portal-address" class="form-input">
                </div>
            </div>
        </div>

        <div class="form-section">
            <div class="form-section-title">Datos Básicos</div>
            <div class="form-grid">
                <div class="span-1">
                    <label class="form-label">Fecha Nacimiento</label>
                    <input id="portal-dob" type="date" class="form-input">
                </div>
                <div class="span-1">
                    <label class="form-label">Género</label>
                    <select id="portal-gender" class="form-select">
                        <option value="">Seleccione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>
                <div class="span-2">
                    <label class="form-label">Motivo de la Cita</label>
                    <input id="portal-motive" class="form-input" placeholder="Breve descripción...">
                </div>
            </div>
        </div>

        <div style="text-align:center; margin-top:20px; padding:20px; border:1px dashed rgba(255,255,255,0.2); border-radius:12px;">
            <div style="margin-bottom:10px; color:#94a3b8;">Foto del Paciente (Opcional)</div>
            <div class="patient-avatar-container" style="margin:0 auto; width:100px; height:100px;" onclick="document.getElementById('portal-photo-input').click()">
                <img id="portal-photo-preview" class="hidden">
                <i class="bi bi-camera-fill patient-avatar-icon"></i>
            </div>
            <input type="file" id="portal-photo-input" hidden accept="image/*;capture=camera">
        </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        // Preview de Foto
        const input = document.getElementById('portal-photo-input');
        if(input) {
            input.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.getElementById('portal-photo-preview');
                        img.src = e.target.result;
                        img.classList.remove('hidden');
                        img.parentElement.querySelector('i').classList.add('hidden');
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    },

    getData() {
        const photoImg = document.getElementById('portal-photo-preview');
        return {
            documento_tipo: $('#portal-doc-type').value,
            documento_numero: $('#portal-doc-num').value,
            primer_nombre: $('#portal-name').value,
            primer_apellido: $('#portal-lastname').value,
            tel_principal: $('#portal-phone').value,
            email_principal: $('#portal-email').value,
            dir_calle_num: $('#portal-address').value,
            fecha_nacimiento: $('#portal-dob').value,
            genero: $('#portal-gender').value,
            motivo_consulta: $('#portal-motive').value, // Dato extra para el inbox
            photo: (photoImg && !photoImg.classList.contains('hidden')) ? photoImg.src : null
        };
    }
};
