import { $, $$, flash, showErr, calcAge, fmtDateTime, STATE } from 'brain';

// ==========================================
// 1. TEMPLATE HTML (LA VISTA DEL MODELO)
// ==========================================
const PATIENT_TEMPLATE = `
    <div class="form-section">
      <div class="form-section-title">A. Identificación</div>
      <div class="form-grid">
        <div class="span-2">
          <label class="form-label">Tipo Doc *</label>
          <select id="documento_tipo" class="form-select"><option value="C.I.">Cédula</option><option value="Pasaporte">Pasaporte</option><option value="RIF">RIF</option></select>
        </div>
        <div class="span-2"><label class="form-label">Número Doc *</label><input id="documento_numero" class="form-input" placeholder="Ej: V-12345678"></div>
        <div class="span-2"><label class="form-label">UUID</label><input id="uuid" class="form-input calculated-field" readonly></div>
        <div class="span-2"><label class="form-label">ID Interno</label><input id="internal_id" class="form-input calculated-field" readonly></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">B. Nombres Completos</div>
      <div class="form-grid">
        <div class="span-1"><label class="form-label">1er Nombre *</label><input id="primer_nombre" class="form-input"></div>
        <div class="span-1"><label class="form-label">2do Nombre</label><input id="segundo_nombre" class="form-input"></div>
        <div class="span-1"><label class="form-label">1er Apellido *</label><input id="primer_apellido" class="form-input"></div>
        <div class="span-1"><label class="form-label">2do Apellido</label><input id="segundo_apellido" class="form-input"></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">C. Demografía</div>
      <div class="form-grid" style="grid-template-columns: repeat(6, 1fr);">
        <div class="span-2"><label class="form-label">Nacimiento *</label><input id="fecha_nacimiento" type="date" class="form-input"></div>
        <div class="span-1"><label class="form-label">Edad</label><input id="edad_auto" class="form-input calculated-field" readonly style="text-align:center;"></div>
        <div class="span-1"><label class="form-label">Género</label><select id="genero" class="form-select"><option value="M">M</option><option value="F">F</option></select></div>
        <div class="span-1"><label class="form-label">Id. Género</label><select id="identidad_genero" class="form-select"><option value="Cis">Cis</option><option value="Trans">Trans</option><option value="Otro">Otro</option></select></div>
        <div class="span-1"><label class="form-label">E. Civil</label><select id="estado_civil" class="form-select"><option value="Soltero">Soltero</option><option value="Casado">Casado</option></select></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">D. Biológicos</div>
      <div class="form-grid" style="grid-template-columns: repeat(5, 1fr);">
        <div class="span-1" style="display:flex; gap:2px;">
           <select id="grupo_sanguineo" class="form-select" style="padding:0 2px;"><option value="O">O</option><option value="A">A</option><option value="B">B</option></select>
           <select id="factor_rh" class="form-select" style="padding:0 2px;"><option value="+">+</option><option value="-">-</option></select>
        </div>
        <div class="span-1"><label class="form-label">Peso (kg)</label><input id="peso_kg" type="number" step="0.1" class="form-input"></div>
        <div class="span-1"><label class="form-label">Talla (cm)</label><input id="talla_cm" type="number" step="1" class="form-input"></div>
        <div class="span-1"><label class="form-label">IMC</label><input id="imc_auto" class="form-input calculated-field" readonly></div>
        <div class="span-1"><label class="form-label">Lat.</label><select id="lateralidad" class="form-select"><option value="D">D</option><option value="I">I</option></select></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">E. Contacto</div>
      <div class="form-grid">
        <div class="span-2"><label class="form-label">Móvil *</label><input id="tel_principal" class="form-input" placeholder="+58 (412) 123-4567"></div>
        <div class="span-2"><label class="form-label">Otro Tlf</label><input id="tel_secundario" class="form-input" placeholder="+58 (212) ..."></div>
        <div class="span-2"><label class="form-label">Email Principal</label><input id="email_principal" type="email" class="form-input" placeholder="usuario@dominio.com"></div>
        <div class="span-2"><label class="form-label">Email Secundario</label><input id="email_secundario" type="email" class="form-input" placeholder="usuario@dominio.com"></div>
        <div class="span-4"><label class="form-label">Dirección</label><input id="dir_calle_num" class="form-input"></div>
        <div class="span-1"><label class="form-label">Ciudad</label><input id="dir_ciudad" class="form-input" value="Caracas"></div>
        <div class="span-1"><label class="form-label">Estado</label><input id="dir_estado" class="form-input" value="Miranda"></div>
        <div class="span-1"><label class="form-label">País</label><input id="dir_pais" class="form-input" value="Venezuela"></div>
        <div class="span-1"><label class="form-label">Postal</label><input id="dir_postal" class="form-input"></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">F. Redes Sociales</div>
      <div class="form-grid">
        <div class="span-1"><label class="form-label">Instagram</label><input id="instagram" class="form-input"></div>
        <div class="span-1"><label class="form-label">Twitter/X</label><input id="x_twitter" class="form-input"></div>
        <div class="span-1"><label class="form-label">LinkedIn</label><input id="linkedin" class="form-input"></div>
        <div class="span-1"><label class="form-label">Facebook</label><input id="facebook" class="form-input"></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">G. Contacto Emergencia</div>
      <div class="form-grid">
        <div class="span-1"><label class="form-label">Nombre</label><input id="emergencia_nombre" class="form-input"></div>
        <div class="span-1"><label class="form-label">Relación</label><select id="emergencia_parentesco" class="form-select"><option value="Familiar">Familiar</option><option value="Pareja">Pareja</option></select></div>
        <div class="span-1"><label class="form-label">Teléfono</label><input id="emergencia_telefono" class="form-input" placeholder="+58..."></div>
        <div class="span-1"><label class="form-label">Email</label><input id="emergencia_email" class="form-input"></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">H. Administrativo</div>
      <div class="form-grid">
        <div class="span-1"><label class="form-label">Seguro</label><input id="aseguradora" class="form-input"></div>
        <div class="span-1"><label class="form-label">Póliza</label><input id="numero_poliza" class="form-input"></div>
        <div class="span-1"><label class="form-label">Admisión</label><input id="fecha_admision" type="date" class="form-input"></div>
        <div class="span-1"><label class="form-label">Alta</label><input id="fecha_alta" type="date" class="form-input"></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">I. Alertas Médicas</div>
      <div class="form-grid">
        <div class="span-4" style="display:grid; grid-template-columns: auto 1fr; gap:10px; align-items:center;">
           <div class="checkbox-group"><input type="checkbox" id="alergias_check"><label for="alergias_check" class="text-danger">Alergias</label></div>
           <input id="alergias_detalle" class="form-input alert-field" placeholder="Especifique..." style="display:none;">
        </div>
        <div class="span-4" style="display:grid; grid-template-columns: auto 1fr; gap:10px; align-items:center;">
           <div class="checkbox-group"><input type="checkbox" id="cronicas_check"><label for="cronicas_check" class="text-danger">Crónicas</label></div>
           <input id="cronicas_detalle" class="form-input alert-field" placeholder="Especifique..." style="display:none;">
        </div>
        <div class="span-4" style="display:grid; grid-template-columns: auto 1fr; gap:10px; align-items:center;">
           <div class="checkbox-group"><input type="checkbox" id="medicamentos_check"><label for="medicamentos_check" class="text-danger">Medicamentos Activos</label></div>
           <input id="medicamentos_detalle" class="form-input alert-field" placeholder="Especifique..." style="display:none;">
        </div>
      </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">J. Seguridad</div>
        <div class="form-grid">
           <div class="span-2"><label class="form-label">Riesgo Caídas</label><select id="riesgo_caidas" class="form-select"><option value="Bajo">Bajo</option><option value="Alto">Alto</option></select></div>
           <div class="span-2"><label class="form-label">Voluntad Anticipada</label><select id="voluntad_anticipada" class="form-select"><option value="No">No</option><option value="Si">Si</option></select></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">K. Antecedentes Personales</div>
        <div class="form-grid" style="grid-template-columns: repeat(6, 1fr);">
          <div class="checkbox-group"><input type="checkbox" id="hipertension_check"><label for="hipertension_check">HTA</label></div>
          <div class="checkbox-group"><input type="checkbox" id="diabetes_check"><label for="diabetes_check">DM</label></div>
          <div class="checkbox-group"><input type="checkbox" id="asma_check"><label for="asma_check">Asma</label></div>
          <div class="checkbox-group"><input type="checkbox" id="cardiopatias_check"><label for="cardiopatias_check">Cardio</label></div>
          <div class="checkbox-group"><input type="checkbox" id="epilepsia_check"><label for="epilepsia_check">Epilepsia</label></div>
          <div class="checkbox-group"><input type="checkbox" id="tiroideos_check"><label for="tiroideos_check">Tiroides</label></div>
          <div class="span-6" style="grid-column: span 6;"><input id="otros_antecedentes" class="form-input" placeholder="Otros antecedentes..."></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">L. Historial Quirúrgico</div>
        <div class="form-grid">
          <div class="span-1 checkbox-group"><input type="checkbox" id="tiene_cirugias"><label for="tiene_cirugias">¿Cirugías?</label></div>
          <div class="span-2"><label class="form-label">Descripción</label><input id="cirugia_descripcion" class="form-input" disabled></div>
          <div class="span-1"><label class="form-label">Año</label><input id="cirugia_anio" type="number" class="form-input" disabled></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">M. Hospitalizaciones</div>
        <div class="form-grid">
           <div class="span-1 checkbox-group"><input type="checkbox" id="ha_sido_hospitalizado"><label for="ha_sido_hospitalizado">¿Hospitalizado?</label></div>
           <div class="span-2"><label class="form-label">Motivo</label><input id="hospitalizacion_motivo" class="form-input" disabled></div>
           <div class="span-1"><label class="form-label">Año</label><input id="hospitalizacion_anio" type="number" class="form-input" disabled></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">N. Lesiones y Fracturas</div>
        <div class="form-grid">
          <div class="span-2"><label class="form-label">Lesión Desc.</label><input id="lesion_desc" class="form-input"></div>
          <div class="span-1"><label class="form-label">Tipo</label><select id="lesion_tipo" class="form-select"><option value="">Sel</option><option value="Golpe">Golpe</option></select></div>
          <div class="span-1 checkbox-group"><input type="checkbox" id="fractura_bool"><label for="fractura_bool">¿Fractura?</label></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">O. Familiares</div>
        <div class="form-grid" style="grid-template-columns: repeat(4, 1fr);">
           <div class="checkbox-group"><input type="checkbox" id="familia_hipertension"><label>HTA</label></div>
           <div class="checkbox-group"><input type="checkbox" id="familia_diabetes"><label>DM</label></div>
           <div class="checkbox-group"><input type="checkbox" id="familia_cancer"><label>CA</label></div>
           <div class="checkbox-group"><input type="checkbox" id="familia_cardiopatias"><label>Cardio</label></div>
           <div class="span-4" style="grid-column: span 4;"><input id="familia_geneticas" class="form-input" placeholder="Genéticas..."></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">P. Hábitos</div>
        <div class="form-grid">
           <div class="span-1"><label class="form-label">Tabaco</label><select id="tabaquismo" class="form-select"><option value="No">No</option><option value="Si">Si</option></select></div>
           <div class="span-1"><label class="form-label">Alcohol</label><select id="alcohol" class="form-select"><option value="No">No</option><option value="Si">Si</option></select></div>
           <div class="span-2"><label class="form-label">Sustancias</label><input id="sustancias" class="form-input"></div>
        </div>
    </div>

    <div class="form-section">
        <div class="form-section-title">Q. Social</div>
        <div class="form-grid">
           <div class="span-2"><label class="form-label">Ocupación</label><input id="ocupacion" class="form-input"></div>
           <div class="span-2"><label class="form-label">Educación</label><select id="educacion" class="form-select"><option value="">Sel</option><option value="Uni">Uni</option></select></div>
        </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">R. Consentimiento de Datos</div>
      <div class="form-grid">
        <div class="span-4 checkbox-group">
            <input type="checkbox" id="tratamiento_datos">
            <label for="tratamiento_datos">Paciente acepta política de tratamiento de datos</label>
            <span id="label_fecha_firma" style="margin-left:auto; font-size:0.8em; color:#93c5fd; font-family:monospace;"></span>
            <input id="fecha_firma" type="hidden">
        </div>
      </div>
    </div>

    <div style="display:flex; justify-content:center; gap:20px; padding:20px 0; border-top:1px dashed #334155;">
        <button type="button" class="btn btn-ghost" onclick="document.querySelector('.patient-header').scrollIntoView({behavior: 'smooth'})">
            <i class="bi bi-arrow-up-circle"></i> Ir al Inicio
        </button>
        <button type="button" class="btn btn-ghost" onclick="window.togglePatientDetailsGlobal()">
            <i class="bi bi-box-arrow-in-up"></i> Colapsar Ficha
        </button>
    </div>
`;

// ==========================================
// 2. FUNCIONES DEL MODELO (RENDERIZADO)
// ==========================================

function renderPatientForm() {
    const container = $("#patient-form-container");
    if (container) {
        container.innerHTML = PATIENT_TEMPLATE;
        initPatientValidators();
    } else {
        console.error("No se encontró el contenedor #patient-form-container");
    }
}

// --- GENERADORES DE ID ---
export function generateUUID() {
    return STATE.patientUUID++;
}

export function generatePatientInternalId() {
    const id = STATE.patientIdCounter++;
    return `p${String(id).padStart(7, '0')}u001`; 
}

// --- LÓGICA UI ---
export function togglePatientDetails() {
    const details = $(".patient-details");
    const toggleBtn = $(".patient-toggle-btn i");
    
    // Safety check
    if(!details || !toggleBtn) return;

    details.classList.toggle('hidden');
    if (details.classList.contains('hidden')) {
        toggleBtn.className = 'bi bi-chevron-right';
    } else {
        toggleBtn.className = 'bi bi-chevron-down';
        if (!$("#patient-internal-id").textContent || $("#patient-internal-id").textContent === 'p0000001u001') {
            const newId = generatePatientInternalId();
            $("#patient-internal-id").textContent = newId;
            $("#internal_id").value = newId;
        }
        if (!$("#uuid").value || $("#uuid").value === 'Generando...') {
            $("#uuid").value = generateUUID();
        }
    }
}

export function updatePatientHeader() {
    // Corrección Cédula (V-)
    const docInput = $("#documento_numero");
    if (docInput && /^\d+$/.test(docInput.value)) { 
        docInput.value = "V-" + docInput.value;
    }

    const nombreCompleto = [
        $("#primer_nombre")?.value, 
        $("#segundo_nombre")?.value, 
        $("#primer_apellido")?.value, 
        $("#segundo_apellido")?.value
    ].filter(Boolean).join(' ');
    
    const nombreDisplay = nombreCompleto || 'Nuevo Paciente';
    const docInfo = ($("#documento_tipo")?.value && docInput?.value) 
        ? `${$("#documento_tipo").value}: ${docInput.value}` 
        : 'Doc: ---';
    const edadDisplay = $("#edad_auto")?.value ? `${$("#edad_auto").value} años` : '-- años';
    
    const elName = $("#patient-header-name");
    const elDoc = $("#patient-doc-info");
    const elAge = $("#patient-age-display");

    if(elName) elName.textContent = nombreDisplay;
    if(elDoc) elDoc.textContent = docInfo;
    if(elAge) elAge.textContent = edadDisplay;
    
    updatePatientTimestamps();
    updateAlertsBadge();
}

// AQUÍ ESTÁ EL ARREGLO PRINCIPAL DEL CRASH:
function updatePatientTimestamps() {
    if (!STATE.patientCreatedTime) STATE.patientCreatedTime = new Date().toISOString();
    STATE.patientModifiedTime = new Date().toISOString();
    
    const user = STATE.currentUser?.profile?.id || 'u-001';
    
    const elCreated = $("#patient-meta-created");
    const elModified = $("#patient-meta-modified");

    // Verificar si existen antes de escribir (Defensivo)
    if(elCreated) elCreated.textContent = `Creado: ${fmtDateTime(STATE.patientCreatedTime)} por ${user}`;
    if(elModified) elModified.textContent = ` | Modificado: ${fmtDateTime(STATE.patientModifiedTime)}`;
}

function updateAlertsBadge() {
    const container = $("#patient-alerts-container");
    if(!container) return;
    container.innerHTML = '';

    const addBadge = (text, priority = 'medium') => {
        const tag = document.createElement('span');
        tag.className = 'alert-tag';
        tag.textContent = text;
        tag.style.fontSize = "0.7rem";
        tag.style.padding = "2px 6px";
        tag.style.borderRadius = "8px";
        
        if (priority === 'high' || priority === 'critical') {
            tag.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            tag.style.color = '#f87171';
            tag.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        } else {
            tag.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
            tag.style.color = '#60a5fa';
        }
        container.appendChild(tag);
    };

    if ($("#alergias_check")?.checked) addBadge("Alergias", "high");
    if ($("#riesgo_caidas")?.value === "Alto") addBadge("Riesgo Caída", "critical");
    if ($("#medicamentos_check")?.checked) addBadge("Medicamentos", "high");
    if ($("#cronicas_check")?.checked) addBadge("Crónicas", "high");
}

// --- CÁLCULOS ---
export function calcularCampos() {
    const fechaNacimiento = $("#fecha_nacimiento")?.value;
    $("#edad_auto").value = fechaNacimiento ? calcAge(fechaNacimiento) : '';
    
    const peso = parseFloat($("#peso_kg")?.value);
    const talla = parseFloat($("#talla_cm")?.value);
    
    if (peso && talla && talla > 0) {
        const alturaMetros = talla / 100;
        const imc = peso / (alturaMetros * alturaMetros);
        $("#imc_auto").value = imc.toFixed(2);
    } else {
        $("#imc_auto").value = '';
    }
    updatePatientHeader();
}

// --- INICIALIZACIÓN ---
export function initializeNewPatient() {
    renderPatientForm();

    const form = $("#patientForm");
    if(form) form.classList.remove('hidden');
    
    const inputs = $$("#patientForm input, #patientForm select, #patientForm textarea");
    inputs.forEach(el => {
        if(el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else el.value = '';
    });

    const elPais = $("#dir_pais"); if(elPais) elPais.value = "Venezuela";
    const elUuid = $("#uuid"); if(elUuid) elUuid.value = generateUUID();
    
    const newId = generatePatientInternalId();
    const elIntId = $("#internal_id"); if(elIntId) elIntId.value = newId;
    const elIntIdHead = $("#patient-internal-id"); if(elIntIdHead) elIntIdHead.textContent = `ID: ${newId}`;

    STATE.patientCreatedTime = new Date().toISOString();
    STATE.patientModifiedTime = STATE.patientCreatedTime;
    
    toggleConditionalFields();
    calcularCampos();
    updatePatientHeader();
}

export function toggleConditionalFields() {
    const map = [
        { check: 'alergias_check', area: 'alergias_detalle' },
        { check: 'cronicas_check', area: 'cronicas_detalle' },
        { check: 'medicamentos_check', area: 'medicamentos_detalle' },
        { check: 'tiene_cirugias', fields: ['cirugia_descripcion', 'cirugia_anio', 'cirugia_complicaciones'] },
        { check: 'ha_sido_hospitalizado', fields: ['hospitalizacion_motivo', 'hospitalizacion_anio'] },
        { check: 'fractura_bool', fields: ['fractura_hueso'] }
    ];

    map.forEach(item => {
        const checkbox = $(`#${item.check}`);
        if(!checkbox) return;

        if (item.area) {
            const area = $(`#${item.area}`);
            if (area) {
                area.style.display = checkbox.checked ? 'block' : 'none';
                if(area.parentElement) area.parentElement.style.gridColumn = checkbox.checked ? 'span 3' : 'span 1'; 
            }
        }
        
        if (item.fields) {
            item.fields.forEach(fieldId => {
                const el = $(`#${fieldId}`);
                if (el) {
                    el.disabled = !checkbox.checked;
                    if(el.parentElement) el.parentElement.style.opacity = checkbox.checked ? '1' : '0.5';
                }
            });
        }
    });
}

// --- VALIDACIONES ---
export function initPatientValidators() {
    const validateField = (id, regex) => {
        const el = $(`#${id}`);
        if(!el) return;
        
        el.addEventListener('blur', () => {
            const val = el.value.trim();
            if (val && !regex.test(val)) {
                el.classList.add('input-error');
                showErr(`Formato inválido en ${id.replace('_',' ')}`);
                el.addEventListener('input', () => el.classList.remove('input-error'), {once:true});
            }
        });
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\(\)\-\s\+]+$/; 

    validateField('email_principal', emailRegex);
    validateField('email_secundario', emailRegex);
    validateField('tel_principal', phoneRegex);
    validateField('tel_secundario', phoneRegex);

    // Consentimiento
    const checkConsent = $("#tratamiento_datos");
    const inputFirma = $("#fecha_firma");
    const labelFirma = $("#label_fecha_firma");
    
    if(checkConsent) {
        checkConsent.addEventListener('change', () => {
            if (checkConsent.checked) {
                const now = new Date().toLocaleString('es-VE'); 
                inputFirma.value = new Date().toISOString(); 
                labelFirma.textContent = `Aceptado: ${now}`;
            } else {
                inputFirma.value = "";
                labelFirma.textContent = "";
            }
        });
        if(inputFirma.value) {
             const d = new Date(inputFirma.value).toLocaleString('es-VE');
             labelFirma.textContent = `Aceptado: ${d}`;
        }
    }
}

// --- DATA EXTRACTOR ---
export function getPatientData() {
    const data = {
        uuid: $('#uuid')?.value,
        internal_id: $('#internal_id')?.value,
        documento_tipo: $('#documento_tipo')?.value,
        documento_numero: $('#documento_numero')?.value,
        primer_nombre: $('#primer_nombre')?.value,
        segundo_nombre: $('#segundo_nombre')?.value,
        primer_apellido: $('#primer_apellido')?.value,
        segundo_apellido: $('#segundo_apellido')?.value,
        fecha_nacimiento: $('#fecha_nacimiento')?.value,
        edad_auto: $('#edad_auto')?.value,
        genero: $('#genero')?.value,
        identidad_genero: $('#identidad_genero')?.value,
        estado_civil: $('#estado_civil')?.value,
        grupo_sanguineo: $('#grupo_sanguineo')?.value,
        factor_rh: $('#factor_rh')?.value,
        peso_kg: $('#peso_kg')?.value,
        talla_cm: $('#talla_cm')?.value,
        imc_auto: $('#imc_auto')?.value,
        lateralidad: $('#lateralidad')?.value,
        tel_principal: $('#tel_principal')?.value,
        tel_secundario: $('#tel_secundario')?.value,
        email_principal: $('#email_principal')?.value,
        email_secundario: $('#email_secundario')?.value,
        dir_calle_num: $('#dir_calle_num')?.value,
        dir_ciudad: $('#dir_ciudad')?.value,
        dir_estado: $('#dir_estado')?.value,
        dir_pais: $('#dir_pais')?.value,
        dir_postal: $('#dir_postal')?.value,
        instagram: $('#instagram')?.value,
        x_twitter: $('#x_twitter')?.value,
        linkedin: $('#linkedin')?.value,
        facebook: $('#facebook')?.value,
        emergencia_nombre: $('#emergencia_nombre')?.value,
        emergencia_parentesco: $('#emergencia_parentesco')?.value,
        emergencia_telefono: $('#emergencia_telefono')?.value,
        emergencia_email: $('#emergencia_email')?.value,
        aseguradora: $('#aseguradora')?.value,
        numero_poliza: $('#numero_poliza')?.value,
        referido_por: $('#referido_por')?.value,
        fecha_admision: $('#fecha_admision')?.value,
        fecha_alta: $('#fecha_alta')?.value,
        alergias_check: $('#alergias_check')?.checked,
        alergias_detalle: $('#alergias_detalle')?.value,
        cronicas_check: $('#cronicas_check')?.checked,
        cronicas_detalle: $('#cronicas_detalle')?.value,
        medicamentos_check: $('#medicamentos_check')?.checked,
        medicamentos_detalle: $('#medicamentos_detalle')?.value,
        riesgo_caidas: $('#riesgo_caidas')?.value,
        voluntad_anticipada: $('#voluntad_anticipada')?.value,
        hipertension_check: $('#hipertension_check')?.checked,
        diabetes_check: $('#diabetes_check')?.checked,
        asma_check: $('#asma_check')?.checked,
        cardiopatias_check: $('#cardiopatias_check')?.checked,
        epilepsia_check: $('#epilepsia_check')?.checked,
        tiroideos_check: $('#tiroideos_check')?.checked,
        otros_antecedentes: $('#otros_antecedentes')?.value,
        tiene_cirugias: $('#tiene_cirugias')?.checked,
        cirugia_descripcion: $('#cirugia_descripcion')?.value,
        cirugia_anio: $('#cirugia_anio')?.value,
        cirugia_complicaciones: $('#cirugia_complicaciones')?.value,
        ha_sido_hospitalizado: $('#ha_sido_hospitalizado')?.checked,
        hospitalizacion_motivo: $('#hospitalizacion_motivo')?.value,
        hospitalizacion_anio: $('#hospitalizacion_anio')?.value,
        lesion_desc: $('#lesion_desc')?.value,
        lesion_tipo: $('#lesion_tipo')?.value,
        fractura_bool: $('#fractura_bool')?.checked,
        fractura_hueso: $('#fractura_hueso')?.value,
        familia_hipertension: $('#familia_hipertension')?.checked,
        familia_diabetes: $('#familia_diabetes')?.checked,
        familia_cancer: $('#familia_cancer')?.checked,
        familia_cardiopatias: $('#familia_cardiopatias')?.checked,
        familia_geneticas: $('#familia_geneticas')?.value,
        tabaquismo: $('#tabaquismo')?.value,
        alcohol: $('#alcohol')?.value,
        sustancias: $('#sustancias')?.value,
        actividad_fisica: $('#actividad_fisica')?.value,
        alimentacion: $('#alimentacion')?.value,
        ocupacion: $('#ocupacion')?.value,
        educacion: $('#educacion')?.value,
        vivienda: $('#vivienda')?.value,
        cuidador_check: $('#cuidador_check')?.checked,
        barreras_comunicacion: $('#barreras_comunicacion')?.value,
        contacto_digital: $('#contacto_digital')?.value,
        tratamiento_datos: $('#tratamiento_datos')?.checked,
        fecha_firma: $('#fecha_firma')?.value,
        created: STATE.patientCreatedTime,
        modified: new Date().toISOString(),
        creator: STATE.currentUser?.profile?.id,
        modifier: STATE.currentUser?.profile?.id
    };
    return data;
}

export function loadPatientDataToDOM(data) {
    if (!data) return;
    
    if(!$("#documento_numero")) renderPatientForm();

    Object.keys(data).forEach(key => {
        const el = $(`#${key}`);
        if (el) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = data[key];
            } else {
                el.value = data[key] || '';
            }
        }
    });

    STATE.patientCreatedTime = data.created;
    STATE.patientModifiedTime = data.modified;
    if(data.uuid) STATE.patientUUID = Math.max(STATE.patientUUID, parseInt(data.uuid) + 1);

    toggleConditionalFields();
    calcularCampos();
    updatePatientHeader();
    
    if(data.fecha_firma) {
         const labelFirma = $("#label_fecha_firma");
         if(labelFirma) {
             const d = new Date(data.fecha_firma).toLocaleString('es-VE');
             labelFirma.textContent = `Aceptado: ${d}`;
         }
    }
}
