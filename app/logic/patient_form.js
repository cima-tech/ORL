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

    .p-section { margin-bottom: 30px; background: rgba(255,255,255,0.03); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .p-title { font-size: 1.2rem; color: #22d3ee; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    
    .p-label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: #cbd5e1; font-weight: 500; }
    
    .p-input, .p-select { 
        width: 100%; padding: 12px 15px; 
        background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); 
        border-radius: 8px; color: white; font-family: 'Roboto Condensed', sans-serif; font-size: 1rem;
        transition: border-color 0.2s;
    }
    .p-input:focus, .p-select:focus { border-color: #0ea5e9; outline: none; background: rgba(0,0,0,0.5); }
    
    /* Checkboxes Estilizados */
    .p-check-group { 
        display: flex; align-items: center; gap: 12px; margin-bottom: 12px; 
        padding: 8px; border-radius: 6px; transition: background 0.2s;
    }
    .p-check-group:hover { background: rgba(255,255,255,0.05); }
    .p-check-group input { width: 20px; height: 20px; accent-color: #0ea5e9; cursor: pointer; }
    .p-check-group label { cursor: pointer; font-size: 1rem; color: #e2e8f0; }

    /* Foto */
    .p-avatar-box {
        width: 140px; height: 140px; margin: 0 auto 25px auto;
        border-radius: 50%; border: 3px dashed rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; overflow: hidden; position: relative;
        background: rgba(0,0,0,0.2); transition: all 0.3s;
    }
    .p-avatar-box:hover { border-color: #0ea5e9; background: rgba(255,255,255,0.05); }
    .p-avatar-box img { width: 100%; height: 100%; object-fit: cover; }
    .p-avatar-label { position: absolute; bottom: 15px; width: 100%; text-align: center; font-size: 0.75rem; background: rgba(0,0,0,0.7); padding: 2px 0; }
    
    .input-error { border-color: #ef4444 !important; }
    .text-muted { color: #94a3b8; font-size: 0.85rem; margin-top: -5px; margin-bottom: 10px; display: block; }
</style>
`;

export const StandardPatientForm = {
    render(containerId) {
        const container = document.getElementById(containerId);
        if(!container) return;

        container.innerHTML = `
        ${STYLES}
        
        <div style="text-align:center;">
            <div class="p-avatar-box" onclick="document.getElementById('portal-photo').click()">
                <img id="portal-photo-preview" style="display:none;">
                <i class="bi bi-camera-fill" style="font-size:2.5rem; color:#64748b;" id="portal-photo-icon"></i>
                <div class="p-avatar-label">TOMAR / SUBIR FOTO</div>
            </div>
            <input type="file" id="portal-photo" hidden accept="image/*;capture=camera">
        </div>

        <div class="p-section">
            <div class="p-title">1. Identificación Personal</div>
            <div class="p-form-grid">
                <div class="p-span-1">
                    <label class="p-label">Tipo de Documento *</label>
                    <select id="p_documento_tipo" class="p-select">
                        <option value="C.I.">Cédula</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="RIF">RIF</option>
                    </select>
                </div>
                <div class="p-span-1">
                    <label class="p-label">Número de Documento *</label>
                    <input id="p_documento_numero" class="p-input" data-mask="cedula" placeholder="Ej: 12345678">
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
                    <label class="p-label">Fecha de Nacimiento *</label>
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
                <div class="p-span-1">
                    <label class="p-label">Estado Civil</label>
                    <select id="p_estado_civil" class="p-select">
                        <option value="" disabled selected>Seleccione...</option>
                        <option value="Soltero">Soltero</option>
                        <option value="Casado">Casado</option>
                        <option value="Divorciado">Divorciado</option>
                        <option value="Viudo">Viudo</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">2. Datos de Contacto</div>
            <div class="p-form-grid">
                <div class="p-span-1">
                    <label class="p-label">Teléfono Móvil *</label>
                    <input id="p_tel_principal" class="p-input" data-mask="phone" placeholder="+58 412...">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Otro Teléfono</label>
                    <input id="p_tel_secundario" class="p-input" data-mask="phone">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Correo Electrónico</label>
                    <input id="p_email_principal" type="email" class="p-input" data-mask="email">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Usuario Instagram</label>
                    <input id="p_instagram" class="p-input" placeholder="@usuario">
                </div>
                <div class="p-span-2">
                    <label class="p-label">Dirección de Habitación</label>
                    <input id="p_dir_calle_num" class="p-input" placeholder="Calle, Edificio, Casa...">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Ciudad</label>
                    <input id="p_dir_ciudad" class="p-input" value="Caracas">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Estado</label>
                    <input id="p_dir_estado" class="p-input" value="Miranda">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">3. En Caso de Emergencia</div>
            <div class="p-form-grid">
                <div class="p-span-2">
                    <label class="p-label">Nombre del Contacto</label>
                    <input id="p_emergencia_nombre" class="p-input" data-mask="capital">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Parentesco</label>
                    <select id="p_emergencia_parentesco" class="p-select">
                        <option value="" disabled selected>Seleccione...</option>
                        <option value="Familiar">Familiar</option>
                        <option value="Pareja">Pareja</option>
                        <option value="Amistad">Amistad</option>
                    </select>
                </div>
                <div class="p-span-1">
                    <label class="p-label">Teléfono</label>
                    <input id="p_emergencia_telefono" class="p-input" data-mask="phone">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">4. Datos Biométricos (Opcional)</div>
            <div class="p-form-grid">
                <div class="p-span-1">
                    <label class="p-label">Tipo de Sangre</label>
                    <div style="display:flex; gap:5px;">
                        <select id="p_grupo_sanguineo" class="p-select">
                            <option value="" disabled selected>Grupo</option>
                            <option value="O">O</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option>
                        </select>
                        <select id="p_factor_rh" class="p-select" style="width:70px;">
                            <option value="" disabled selected>Rh</option>
                            <option value="+">+</option><option value="-">-</option>
                        </select>
                    </div>
                </div>
                <div class="p-span-1">
                    <label class="p-label">Peso Aprox (kg)</label>
                    <input id="p_peso_kg" type="number" class="p-input">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Estatura (cm)</label>
                    <input id="p_talla_cm" type="number" class="p-input" placeholder="Ej: 170">
                </div>
                <div class="p-span-1">
                    <label class="p-label">Mano Dominante</label>
                    <select id="p_lateralidad" class="p-select">
                        <option value="" disabled selected>Seleccione...</option>
                        <option value="Diestro">Derecha</option>
                        <option value="Zurdo">Izquierda</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">5. Hábitos y Estilo de Vida</div>
            <div class="p-form-grid">
                <div class="p-span-1">
                    <label class="p-label">¿Fuma actualmente?</label>
                    <select id="p_tabaquismo" class="p-select">
                        <option value="No">No</option>
                        <option value="Si">Sí</option>
                        <option value="Ex-fumador">Ex-fumador</option>
                    </select>
                </div>
                <div class="p-span-1">
                    <label class="p-label">¿Consume Alcohol?</label>
                    <select id="p_alcohol" class="p-select">
                        <option value="Nunca">Nunca</option>
                        <option value="Social">Ocasional / Social</option>
                        <option value="Frecuente">Frecuente</option>
                    </select>
                </div>
                <div class="p-span-1">
                    <label class="p-label">Actividad Física</label>
                    <select id="p_estadofisico" class="p-select">
                        <option value="Sedentario">Poca / Ninguna</option>
                        <option value="Esporádico">Ocasional</option>
                        <option value="Deportista">Regular / Deportista</option>
                    </select>
                </div>
                <div class="p-span-1">
                    <label class="p-label">Horas de Sueño (Promedio)</label>
                    <select id="p_Sueno" class="p-select">
                        <option value="≥ 7 horas">Más de 7 horas</option>
                        <option value="≤ 6 horas">Menos de 6 horas</option>
                        <option value="Insuficiente">Muy poco / Insomnio</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">6. Antecedentes Médicos Personales</div>
            <div class="p-form-grid">
                <div class="p-span-4" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="p-check-group"><input type="checkbox" id="p_diabetes"><label for="p_diabetes">Diabetes (Azúcar)</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_hipertension"><label for="p_hipertension">Hipertensión (Tensión Alta)</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_asma"><label for="p_asma">Asma / Problemas Respiratorios</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_tiroides"><label for="p_tiroides">Problemas de Tiroides</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_cardiopatias"><label for="p_cardiopatias">Problemas del Corazón</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_epilepsia"><label for="p_epilepsia">Epilepsia / Convulsiones</label></div>
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_alergias_check" data-toggle="p_alergias_detalle">
                        <label for="p_alergias_check" style="color:#f87171; font-weight:bold;">¿Es alérgico a algún medicamento o alimento?</label>
                    </div>
                    <input id="p_alergias_detalle" class="p-input" placeholder="Especifique a qué es alérgico..." style="display:none;">
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_medicamentos_check" data-toggle="p_medicamentos_detalle">
                        <label for="p_medicamentos_check">¿Toma medicamentos actualmente?</label>
                    </div>
                    <input id="p_medicamentos_detalle" class="p-input" placeholder="Indique nombre y dosis..." style="display:none;">
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_cirugias_check" data-toggle="p_cirugias_detalle">
                        <label for="p_cirugias_check">¿Ha tenido cirugías previas?</label>
                    </div>
                    <input id="p_cirugias_detalle" class="p-input" placeholder="Especifique qué operación y el año aproximado..." style="display:none;">
                </div>

                <div class="p-span-4">
                    <div class="p-check-group">
                        <input type="checkbox" id="p_hospitalizado_check" data-toggle="p_hospitalizado_detalle">
                        <label for="p_hospitalizado_check">¿Ha estado hospitalizado recientemente?</label>
                    </div>
                    <input id="p_hospitalizado_detalle" class="p-input" placeholder="Motivo y fecha..." style="display:none;">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">7. Vacunación (Inmunizaciones)</div>
            <div class="p-form-grid">
                <div class="p-span-2">
                    <label class="p-label">Vacunación COVID-19</label>
                    <select id="p_covid_estado" class="p-select">
                        <option value="No Vacunado">No Vacunado</option>
                        <option value="Esquema Básico">Esquema Básico (1-2 dosis)</option>
                        <option value="Refuerzos">Esquema Completo + Refuerzos</option>
                    </select>
                </div>
                <div class="p-span-2">
                    <label class="p-label">Otras Vacunas Recientes</label>
                    <input id="p_otras_vacunas" class="p-input" placeholder="Influenza, Fiebre Amarilla...">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">8. Antecedentes Familiares</div>
            <p class="text-muted">Marque si sus padres o hermanos sufren de:</p>
            <div class="p-form-grid">
                <div class="p-span-4" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="p-check-group"><input type="checkbox" id="p_fam_diabetes"><label for="p_fam_diabetes">Diabetes</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_fam_hipertension"><label for="p_fam_hipertension">Hipertensión</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_fam_cancer"><label for="p_fam_cancer">Cáncer</label></div>
                    <div class="p-check-group"><input type="checkbox" id="p_fam_cardio"><label for="p_fam_cardio">Problemas Cardíacos</label></div>
                </div>
                <div class="p-span-4">
                    <label class="p-label">Otros Antecedentes Familiares Importantes</label>
                    <input id="p_familia_geneticas" class="p-input" placeholder="Describa...">
                </div>
            </div>
        </div>

        <div class="p-section">
            <div class="p-title">9. Información Administrativa</div>
            <div class="p-form-grid">
                <div class="p-span-2">
                    <label class="p-label">Profesión / Ocupación</label>
                    <input id="p_ocupacion" class="p-input">
                </div>
                <div class="p-span-2">
                    <label class="p-label">Nivel Educativo</label>
                    <select id="p_educacion" class="p-select">
                        <option value="" disabled selected>Seleccione...</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Bachillerato</option>
                        <option value="Universitario">Universitario</option>
                        <option value="Postgrado">Postgrado</option>
                    </select>
                </div>
                <div class="p-span-2">
                    <label class="p-label">Seguro Médico (Si aplica)</label>
                    <input id="p_aseguradora" class="p-input" placeholder="Nombre de la aseguradora">
                </div>
                <div class="p-span-2">
                    <label class="p-label">Número de Póliza</label>
                    <input id="p_poliza" class="p-input">
                </div>
            </div>
        </div>

        <div class="p-section" style="border-color: #0ea5e9;">
            <div class="p-check-group">
                <input type="checkbox" id="p_tratamiento_datos">
                <label for="p_tratamiento_datos" style="font-size:0.9rem; opacity:0.9;">
                    He leído y acepto que mis datos personales sean utilizados para la creación de mi historia médica bajo estricta confidencialidad.
                </label>
            </div>
        </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        // 1. Validadores (Máscaras)
        ['p_primer_nombre','p_segundo_nombre','p_primer_apellido','p_segundo_apellido', 'p_dir_ciudad', 'p_ocupacion', 'p_emergencia_nombre'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('blur', () => el.value = el.value.replace(/\b\w/g, l => l.toUpperCase()));
        });

        const elPhone = document.getElementById('p_tel_principal');
        if(elPhone) {
            elPhone.addEventListener('blur', () => {
                let v = elPhone.value.replace(/\D/g, '');
                if(v.length > 0 && elPhone.value.startsWith('0')) elPhone.value = '+58 ' + elPhone.value.substring(1);
            });
        }

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
                        const label = document.querySelector('.p-avatar-label');
                        img.src = e.target.result;
                        img.style.display = 'block';
                        if(icon) icon.style.display = 'none';
                        if(label) label.textContent = 'CAMBIAR FOTO';
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
            estado_civil: getVal('p_estado_civil'),
            
            // Contacto
            tel_principal: getVal('p_tel_principal'),
            tel_secundario: getVal('p_tel_secundario'),
            email_principal: getVal('p_email_principal'),
            dir_calle_num: getVal('p_dir_calle_num'),
            dir_ciudad: getVal('p_dir_ciudad'),
            dir_estado: getVal('p_dir_estado'),
            instagram: getVal('p_instagram'),

            // Emergencia
            emergencia_nombre: getVal('p_emergencia_nombre'),
            emergencia_parentesco: getVal('p_emergencia_parentesco'),
            emergencia_telefono: getVal('p_emergencia_telefono'),
            emergencia_email: getVal('p_emergencia_email'),

            // Biometria
            grupo_sanguineo: getVal('p_grupo_sanguineo'),
            factor_rh: getVal('p_factor_rh'),
            peso_kg: getVal('p_peso_kg'),
            talla_cm: getVal('p_talla_cm'),
            lateralidad: getVal('p_lateralidad'),

            // Hábitos
            tabaquismo: getVal('p_tabaquismo'),
            alcohol: getVal('p_alcohol'),
            estadofisico: getVal('p_estadofisico'),
            sueno: getVal('p_Sueno'),

            // Antecedentes Personales (Booleanos)
            diabetes_check: getChk('p_diabetes'),
            hipertension_check: getChk('p_hipertension'),
            asma_check: getChk('p_asma'),
            tiroideos_check: getChk('p_tiroides'),
            cardiopatias_check: getChk('p_cardiopatias'),
            epilepsia_check: getChk('p_epilepsia'),
            
            // Antecedentes con detalle
            alergias_check: getChk('p_alergias_check'),
            alergias_detalle: getVal('p_alergias_detalle'),
            medicamentos_check: getChk('p_medicamentos_check'),
            medicamentos_detalle: getVal('p_medicamentos_detalle'),
            tiene_cirugias: getChk('p_cirugias_check'),
            cirugia_descripcion: getVal('p_cirugias_detalle'),
            ha_sido_hospitalizado: getChk('p_hospitalizado_check'),
            hospitalizacion_motivo: getVal('p_hospitalizado_detalle'),

            // Familiares
            familia_diabetes: getChk('p_fam_diabetes'),
            familia_hipertension: getChk('p_fam_hipertension'),
            familia_cancer: getChk('p_fam_cancer'),
            familia_cardiopatias: getChk('p_fam_cardio'),
            familia_geneticas: getVal('p_familia_geneticas'), // Campo "Otros antecedentes"

            // Admin
            ocupacion: getVal('p_ocupacion'),
            educacion: getVal('p_educacion'),
            aseguradora: getVal('p_aseguradora'),
            numero_poliza: getVal('p_poliza'),
            
            // Vacunas
            covid_estado: getVal('p_covid_estado'),
            otras_vacunas: getVal('p_otras_vacunas'),

            tratamiento_datos: getChk('p_tratamiento_datos'),
            
            // Extra
            photo: photoSrc
        };
    }
};
