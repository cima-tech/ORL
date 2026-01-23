import { $, $$ } from 'brain';

// ==========================================
// 1. ESTILOS PROPIOS DEL FORMULARIO (PORTAL)
// ==========================================
const STYLES = `
<style>
    /* Grid System Local */
    .p-form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
    .p-span-1 { grid-column: span 1; }
    .p-span-2 { grid-column: span 2; }
    .p-span-4 { grid-column: span 4; }

    /* Responsivo para móviles */
    @media (max-width: 768px) {
        .p-form-grid { grid-template-columns: 1fr 1fr; }
        .p-span-1 { grid-column: span 2; } /* Todo full width en móvil */
        .p-span-2 { grid-column: span 2; }
        .p-span-4 { grid-column: span 2; }
    }

    .p-section { margin-bottom: 30px; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .p-title { font-size: 1.1rem; color: #22d3ee; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    
    .p-label { display: block; margin-bottom: 6px; font-size: 0.85rem; color: #cbd5e1; }
    
    .p-input, .p-select { 
        width: 100%; padding: 10px 12px; 
        background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); 
        border-radius: 8px; color: white; font-family: 'Roboto Condensed', sans-serif; font-size: 1rem;
        transition: border-color 0.2s;
    }
    .p-input:focus, .p-select:focus { border-color: #0ea5e9; outline: none; background: rgba(0,0,0,0.5); }
    
    /* Checkboxes */
    .p-check-group { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; }
    .p-check-group input { width: 18px; height: 18px; accent-color: #0ea5e9; cursor: pointer; }
    .p-check-group label { cursor: pointer; font-size: 0.95rem; color: #e2e8f0; }

    /* Foto */
    .p-avatar-box {
        width: 120px; height: 120px; margin: 0 auto 20px auto;
        border-radius: 50%; border: 2px dashed rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; overflow: hidden; position: relative;
        background: rgba(0,0,0,0.2);
    }
    .p-avatar-box:hover { border-color: #0ea5e9; }
    .p-avatar-box img { width: 100%; height: 100%; object-fit: cover; }
    .p-avatar-label { position: absolute; bottom: 10px; width: 100%; text-align: center; font-size: 0.7rem; background: rgba(0,0,0,0.6); }
    
    .input-error { border-color: #ef4444 !important; }
</style>
`;

export const StandardPatientForm = {
    render(containerId) {
        const container = document.getElementById(containerId);
        if(!container) return;

        // Inyectar HTML Completo (Copia de patient.js adaptada con clases p-*)
        container.innerHTML = `
        ${STYLES}
        
        <div style="text-align:center;">
            <div class="p-avatar-box" onclick="document.getElementById('portal-photo').click()">
                <img id="portal-photo-preview" style="display:none;">
                <i class="bi bi-camera-fill" style="font-size:2rem; color:#64748b;" id="portal-photo-icon"></i>
                <div class="p-avatar-label">SUBIR FOTO</div>
            </div>
            <input type="file" id="portal-photo" hidden accept="image/*;capture=camera">
        </div>

        <div class="p-section">
            <div class="p-title">1. Identificación</div>
            <div class="p-form-grid">
                <div class="p-span-1">
                    <label class="p-label">Tipo Doc *</label>
                    <select id="p_documento_tipo" class="p-select">
                        <option value="C.I.">Cédula</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="RIF">RIF</option>
                    </select>
                </div>
                <div class="p-span-1">
                    <label class="p-label">Número Doc *</label>
                    <input id="p_documento_numero" class="p-input" data-mask="cedula" placeholder="12345678">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Primer Nombre *</label>
                    <input id="p_primer_nombre" class="p-input" data-mask="capital">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Segundo Nombre</label>
                    <input id="p_segundo_nombre" class="p-input" data-mask="capital">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Primer Apellido *</label>
                    <input id="p_primer_apellido" class="p-input" data-mask="capital">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Segundo Apellido</label>
                    <input id="p_segundo_apellido" class="p-input" data-mask="capital">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Fecha Nacimiento *</label>
                    <input id="p_fecha_nacimiento" type="date" class="p-input">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Género</label>
                    <select id="p_genero" class="p-select">
                        <option value="" disabled selected>Seleccione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">2. Contacto</div>
            <div class="p-form-grid">
                <div class="p-span-1">
                    <label class="p-label">Teléfono Principal *</label>
                    <input id="p_tel_principal" class="p-input" data-mask="phone" placeholder="+58...">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Email Principal</label>
                    <input id="p_email_principal" type="email" class="p-input" data-mask="email">
                </div>
                <div class="p-span-2">
                    <label class="p-label">Dirección de Habitación</label>
                    <input id="p_dir_calle_num" class="p-input">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Ciudad</label>
                    <input id="p_dir_ciudad" class="p-input" value="Caracas">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Instagram</label>
                    <input id="p_instagram" class="p-input" placeholder="@usuario">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">3. Antecedentes Personales</div>
            <div class="p-form-grid">
                <div class="p-span-4" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="p-check-group"><input type="checkbox" id="p_diabetes"><label for="p_diabetes">Diabetes</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_hipertension"><label for="p_hipertension">Hipertensión (HTA)</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_asma"><label for="p_asma">Asma</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_tiroides"><label for="p_tiroides">Tiroides</label></div>
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_alergias_check" data-toggle="p_alergias_detalle">
                        <label for="p_alergias_check" style="color:#f87171; font-weight:bold;">¿Sufre de Alergias?</label>
                    </div>
                    <input id="p_alergias_detalle" class="p-input" placeholder="Especifique a qué es alérgico..." style="display:none;">
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_medicamentos_check" data-toggle="p_medicamentos_detalle">
                        <label for="p_medicamentos_check">¿Toma medicamentos actualmente?</label>
                    </div>
                    <input id="p_medicamentos_detalle" class="p-input" placeholder="Indique medicamentos y dosis..." style="display:none;">
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_cirugias_check" data-toggle="p_cirugias_detalle">
                        <label for="p_cirugias_check">¿Ha tenido cirugías previas?</label>
                    </div>
                    <input id="p_cirugias_detalle" class="p-input" placeholder="Especifique cirugías y año..." style="display:none;">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">4. Antecedentes Familiares</div>
            <div class="p-form-grid">
                <div class="p-span-4" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="p-check-group"><input type="checkbox" id="p_fam_diabetes"><label for="p_fam_diabetes">Diabetes</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_fam_hipertension"><label for="p_fam_hipertension">Hipertensión</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_fam_cancer"><label for="p_fam_cancer">Cáncer</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_fam_cardio"><label for="p_fam_cardio">Cardiopatías</label></div>
                </div>
                <div class="p-span-4">
                    <label class="p-label">Otros Antecedentes Relevantes</label>
                    <input id="p_otros_antecedentes" class="p-input" placeholder="Describa otros antecedentes...">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">5. Administrativo</div>
            <div class="p-form-grid">
                <div class="p-span-2">
                    <label class="p-label">Seguro Médico</label>
                    <input id="p_aseguradora" class="p-input" placeholder="Nombre de la aseguradora">
                </div>
                <div class="p-span-2">
                    <label class="p-label">Número de Póliza</label>
                    <input id="p_poliza" class="p-input">
                </div>
                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_tratamiento_datos">
                        <label for="p_tratamiento_datos" style="font-size:0.85rem; opacity:0.8;">
                            Acepto el uso de mis datos personales para fines médicos estrictamente confidenciales.
                        </label>
                    </div>
                </div>
            </div>
        </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        // 1. Validadores (Máscaras)
        const selectors = this._getSelectors();
        
        // Máscaras de Texto (Capitalize)
        ['p_primer_nombre','p_segundo_nombre','p_primer_apellido','p_segundo_apellido', 'p_dir_ciudad'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('blur', () => el.value = el.value.replace(/\b\w/g, l => l.toUpperCase()));
        });

        // Teléfono
        const elPhone = document.getElementById('p_tel_principal');
        if(elPhone) {
            elPhone.addEventListener('blur', () => {
                let v = elPhone.value.replace(/\D/g, '');
                if(v.length > 0 && elPhone.value.startsWith('0')) elPhone.value = '+58 ' + elPhone.value.substring(1);
            });
        }

        // Email
        const elEmail = document.getElementById('p_email_principal');
        if(elEmail) {
            elEmail.addEventListener('blur', () => {
                if(elEmail.value && !elEmail.value.includes('@')) elEmail.classList.add('input-error');
                else elEmail.classList.remove('input-error');
            });
        }

        // 2. Lógica Toggle (Mostrar/Ocultar campos)
        document.querySelectorAll('[data-toggle]').forEach(chk => {
            chk.addEventListener('change', () => {
                const target = document.getElementById(chk.dataset.toggle);
                if(target) target.style.display = chk.checked ? 'block' : 'none';
            });
        });

        // 3. Preview de Foto
        const photoInput = document.getElementById('portal-photo');
        if(photoInput) {
            photoInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.getElementById('portal-photo-preview');
                        const icon = document.getElementById('portal-photo-icon');
                        img.src = e.target.result;
                        img.style.display = 'block';
                        if(icon) icon.style.display = 'none';
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    },

    // Recolector de Datos (Mapea los IDs del portal a los IDs del sistema CIMA)
    getData() {
        const getVal = (id) => document.getElementById(id)?.value || '';
        const getChk = (id) => document.getElementById(id)?.checked || false;
        
        // Foto
        const img = document.getElementById('portal-photo-preview');
        const photoSrc = (img && img.style.display !== 'none') ? img.src : null;

        return {
            // IDs Básicos
            documento_tipo: getVal('p_documento_tipo'),
            documento_numero: getVal('p_documento_numero'),
            primer_nombre: getVal('p_primer_nombre'),
            segundo_nombre: getVal('p_segundo_nombre'),
            primer_apellido: getVal('p_primer_apellido'),
            segundo_apellido: getVal('p_segundo_apellido'),
            fecha_nacimiento: getVal('p_fecha_nacimiento'),
            genero: getVal('p_genero'),
            
            // Contacto
            tel_principal: getVal('p_tel_principal'),
            email_principal: getVal('p_email_principal'),
            dir_calle_num: getVal('p_dir_calle_num'),
            dir_ciudad: getVal('p_dir_ciudad'),
            instagram: getVal('p_instagram'),

            // Antecedentes Personales (Booleanos)
            diabetes_check: getChk('p_diabetes'),
            hipertension_check: getChk('p_hipertension'), // Ojo: mapping
            asma_check: getChk('p_asma'),
            tiroideos_check: getChk('p_tiroides'),
            
            // Antecedentes con detalle
            alergias_check: getChk('p_alergias_check'),
            alergias_detalle: getVal('p_alergias_detalle'),
            medicamentos_check: getChk('p_medicamentos_check'),
            medicamentos_detalle: getVal('p_medicamentos_detalle'),
            tiene_cirugias: getChk('p_cirugias_check'),
            cirugia_descripcion: getVal('p_cirugias_detalle'),

            // Familiares
            familia_diabetes: getChk('p_fam_diabetes'),
            familia_hipertension: getChk('p_fam_hipertension'),
            familia_cancer: getChk('p_fam_cancer'),
            familia_cardiopatias: getChk('p_fam_cardio'),
            otros_antecedentes: getVal('p_otros_antecedentes'), // Usamos este campo para texto libre

            // Admin
            aseguradora: getVal('p_aseguradora'),
            numero_poliza: getVal('p_poliza'),
            tratamiento_datos: getChk('p_tratamiento_datos'),
            
            // Extra
            photo: photoSrc
        };
    },

    _getSelectors() {
        return {}; // Helper placeholder
    }
};
