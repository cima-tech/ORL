import { $, $$, flash, showErr, calcAge, fmtDateTime, STATE } from 'brain';

// --- GENERADORES DE ID ---
export function generateUUID() {
    return STATE.patientUUID++;
}

export function generatePatientInternalId() {
    const id = STATE.patientIdCounter++;
    return `p${String(id).padStart(7, '0')}u001`; 
}

// --- VALIDACIÓN DE FORMULARIO (NUEVO) ---
export function validatePatientForm() {
    let isValid = true;
    // Campos obligatorios básicos
    const required = ['documento_numero', 'primer_nombre', 'primer_apellido', 'fecha_nacimiento'];
    
    required.forEach(id => {
        const el = $(`#${id}`);
        if (el && !el.value.trim()) {
            el.classList.add('input-error');
            // Remover el efecto después de 500ms para poder activarlo de nuevo si se vuelve a intentar
            setTimeout(() => el.classList.remove('input-error'), 500);
            isValid = false;
        }
    });
    
    if (!isValid) showErr("Faltan datos obligatorios del paciente (marcados en rojo)");
    return isValid;
}

// --- LÓGICA UI DEL HEADER Y PESTAÑA PACIENTE ---
export function togglePatientDetails() {
    const details = $(".patient-details");
    const toggleBtn = $(".patient-toggle-btn i");
    
    details.classList.toggle('hidden');
    if (details.classList.contains('hidden')) {
        toggleBtn.className = 'bi bi-chevron-right';
    } else {
        toggleBtn.className = 'bi bi-chevron-down';
        // Generar IDs si están vacíos al abrir
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
    // 1. Auto-corrección de Cédula (V-)
    const docInput = $("#documento_numero");
    const docType = $("#documento_tipo");
    
    // Si el tipo es C.I. o está vacío, y el usuario metió solo números, agregamos V-
    if (docInput && /^\d+$/.test(docInput.value)) { 
        if (!docType.value || docType.value === 'C.I.') {
            docInput.value = "V-" + docInput.value;
        }
    }

    // 2. Construcción robusta del nombre completo
    const nombreCompleto = [
        $("#primer_nombre")?.value, 
        $("#segundo_nombre")?.value, 
        $("#primer_apellido")?.value, 
        $("#segundo_apellido")?.value
    ].filter(Boolean).join(' '); // Elimina vacíos y une con espacio
    
    const nombreDisplay = nombreCompleto || 'Nuevo Paciente';
    
    const docInfo = ($("#documento_tipo")?.value && $("#documento_numero")?.value) 
        ? `${$("#documento_tipo").value}: ${$("#documento_numero").value}` 
        : 'Documento: ---';
    
    const edadDisplay = $("#edad_auto")?.value ? `${$("#edad_auto").value} años` : '-- años';
    
    // Actualizar DOM del Header
    $("#patient-header-name").textContent = nombreDisplay;
    $("#patient-doc-info").textContent = docInfo;
    $("#patient-age-display").textContent = edadDisplay;
    
    updatePatientTimestamps();
    updateAlertsBadge(); 
}

// Actualiza los timestamps visibles con lógica de creador/modificador
function updatePatientTimestamps() {
    if (!STATE.patientCreatedTime) STATE.patientCreatedTime = new Date().toISOString();
    
    // Usamos el usuario actual o un fallback
    const currentUser = STATE.currentUser?.profile?.name || 'Usuario';
    const creator = STATE.patientCreator || currentUser; 
    
    $("#patient-meta-created").textContent = `Creado: ${fmtDateTime(STATE.patientCreatedTime)} por ${creator}`;
    $("#patient-meta-modified").textContent = `Editado: ${fmtDateTime(new Date().toISOString())} por ${currentUser}`;
}

// Muestra badges de alerta en el header del paciente
function updateAlertsBadge() {
    const container = $("#patient-alerts-container");
    if(!container) return;
    container.innerHTML = '';

    const addBadge = (text, priority = 'medium') => {
        const tag = document.createElement('span');
        tag.className = 'alert-tag';
        tag.textContent = text;
        
        // Estilos inline básicos para asegurar visualización si falla el CSS
        tag.style.padding = "2px 6px";
        tag.style.borderRadius = "4px";
        tag.style.fontSize = "10px";
        tag.style.fontWeight = "bold";
        tag.style.marginRight = "4px";
        
        if (priority === 'critical' || priority === 'high') {
            tag.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            tag.style.color = '#ef4444';
            tag.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        } else {
            tag.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            tag.style.color = '#3b82f6';
            tag.style.border = '1px solid rgba(59, 130, 246, 0.2)';
        }
        container.appendChild(tag);
    };

    // Lógica de alertas
    if ($("#alergias_check")?.checked) addBadge("ALERGIAS", "high");
    if ($("#riesgo_caidas")?.value === "Alto") addBadge("RIESGO CAÍDA", "critical");
    if ($("#medicamentos_check")?.checked) addBadge("MEDICAMENTOS", "medium");
    if ($("#cronicas_check")?.checked) addBadge("CRÓNICAS", "high");
    
    if ($("#diabetes_check")?.checked) addBadge("DIABETES", "high");
    if ($("#hipertension_check")?.checked) addBadge("HTA", "high");
    if ($("#cardiopatias_check")?.checked) addBadge("CARDIO", "high");
}

// --- CÁLCULOS AUTOMÁTICOS ---
export function calcularCampos() {
    // 1. Edad
    const fechaNacimiento = $("#fecha_nacimiento")?.value;
    $("#edad_auto").value = fechaNacimiento ? calcAge(fechaNacimiento) : '';
    
    // 2. IMC
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

// --- INICIALIZACIÓN Y RESET ---
export function initializeNewPatient() {
    const form = $("#patientForm");
    form.classList.remove('hidden');
    
    // Limpieza profunda de todos los campos
    const inputs = $$("#patientForm input, #patientForm select, #patientForm textarea");
    inputs.forEach(el => {
        if(el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else el.value = '';
    });

    // Valores por defecto obligatorios
    $("#dir_pais").value = "Venezuela";
    $("#uuid").value = generateUUID();
    const newId = generatePatientInternalId();
    $("#internal_id").value = newId;
    $("#patient-internal-id").textContent = newId;

    STATE.patientCreatedTime = new Date().toISOString();
    STATE.patientCreator = STATE.currentUser?.profile?.name; // Guardar creador original
    STATE.patientModifiedTime = STATE.patientCreatedTime;
    
    // Reiniciar visibilidad de campos condicionales
    toggleConditionalFields();
    calcularCampos();
    updatePatientHeader();
}

// Maneja la lógica visual de mostrar/ocultar textareas al hacer check
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

// --- EXTRACTOR DE DATOS (SERIALIZACIÓN) ---
export function getPatientData() {
    // Primero validamos
    if (!validatePatientForm()) return null;

    return {
        // A. Identificación
        uuid: $('#uuid')?.value,
        internal_id: $('#internal_id')?.value,
        documento_tipo: $('#documento_tipo')?.value,
        documento_numero: $('#documento_numero')?.value,
        
        // B. Nombres
        primer_nombre: $('#primer_nombre')?.value,
        segundo_nombre: $('#segundo_nombre')?.value,
        primer_apellido: $('#primer_apellido')?.value,
        segundo_apellido: $('#segundo_apellido')?.value,
        
        // C. Demografía
        fecha_nacimiento: $('#fecha_nacimiento')?.value,
        edad_auto: $('#edad_auto')?.value,
        genero: $('#genero')?.value,
        identidad_genero: $('#identidad_genero')?.value,
        estado_civil: $('#estado_civil')?.value,
        
        // D. Biológicos
        grupo_sanguineo: $('#grupo_sanguineo')?.value,
        factor_rh: $('#factor_rh')?.value,
        peso_kg: $('#peso_kg')?.value,
        talla_cm: $('#talla_cm')?.value,
        imc_auto: $('#imc_auto')?.value,
        lateralidad: $('#lateralidad')?.value,
        
        // E. Contacto
        tel_principal: $('#tel_principal')?.value,
        tel_secundario: $('#tel_secundario')?.value,
        email_principal: $('#email_principal')?.value,
        email_secundario: $('#email_secundario')?.value,
        dir_calle_num: $('#dir_calle_num')?.value,
        dir_ciudad: $('#dir_ciudad')?.value,
        dir_estado: $('#dir_estado')?.value,
        dir_pais: $('#dir_pais')?.value,
        dir_postal: $('#dir_postal')?.value,
        
        // F. Redes
        instagram: $('#instagram')?.value,
        x_twitter: $('#x_twitter')?.value,
        linkedin: $('#linkedin')?.value,
        facebook: $('#facebook')?.value,
        
        // G. Emergencia
        emergencia_nombre: $('#emergencia_nombre')?.value,
        emergencia_parentesco: $('#emergencia_parentesco')?.value,
        emergencia_telefono: $('#emergencia_telefono')?.value,
        emergencia_email: $('#emergencia_email')?.value,
        
        // H. Administrativos
        aseguradora: $('#aseguradora')?.value,
        numero_poliza: $('#numero_poliza')?.value,
        referido_por: $('#referido_por')?.value,
        fecha_admision: $('#fecha_admision')?.value,
        fecha_alta: $('#fecha_alta')?.value,
        
        // I. Alertas Clínicas
        alergias_check: $('#alergias_check')?.checked,
        alergias_detalle: $('#alergias_detalle')?.value,
        cronicas_check: $('#cronicas_check')?.checked,
        cronicas_detalle: $('#cronicas_detalle')?.value,
        medicamentos_check: $('#medicamentos_check')?.checked,
        medicamentos_detalle: $('#medicamentos_detalle')?.value,
        
        // J. Seguridad
        riesgo_caidas: $('#riesgo_caidas')?.value,
        voluntad_anticipada: $('#voluntad_anticipada')?.value,
        
        // K. Antecedentes Personales
        hipertension_check: $('#hipertension_check')?.checked,
        diabetes_check: $('#diabetes_check')?.checked,
        asma_check: $('#asma_check')?.checked,
        cardiopatias_check: $('#cardiopatias_check')?.checked,
        epilepsia_check: $('#epilepsia_check')?.checked,
        tiroideos_check: $('#tiroideos_check')?.checked,
        otros_antecedentes: $('#otros_antecedentes')?.value,
        
        // L. Quirúrgico
        tiene_cirugias: $('#tiene_cirugias')?.checked,
        cirugia_descripcion: $('#cirugia_descripcion')?.value,
        cirugia_anio: $('#cirugia_anio')?.value,
        cirugia_complicaciones: $('#cirugia_complicaciones')?.value,
        
        // M. Hospitalizaciones
        ha_sido_hospitalizado: $('#ha_sido_hospitalizado')?.checked,
        hospitalizacion_motivo: $('#hospitalizacion_motivo')?.value,
        hospitalizacion_anio: $('#hospitalizacion_anio')?.value,
        transfusiones_check: $('#transfusiones_check')?.checked,
        
        // N. Lesiones
        lesion_desc: $('#lesion_desc')?.value,
        lesion_tipo: $('#lesion_tipo')?.value,
        fractura_bool: $('#fractura_bool')?.checked,
        fractura_hueso: $('#fractura_hueso')?.value,
        
        // O. Familiares
        familia_hipertension: $('#familia_hipertension')?.checked,
        familia_diabetes: $('#familia_diabetes')?.checked,
        familia_cancer: $('#familia_cancer')?.checked,
        familia_cardiopatias: $('#familia_cardiopatias')?.checked,
        familia_geneticas: $('#familia_geneticas')?.value,
        
        // P. Hábitos
        tabaquismo: $('#tabaquismo')?.value,
        alcohol: $('#alcohol')?.value,
        sustancias: $('#sustancias')?.value,
        actividad_fisica: $('#actividad_fisica')?.value,
        alimentacion: $('#alimentacion')?.value,
        
        // Q. Contexto Social
        ocupacion: $('#ocupacion')?.value,
        educacion: $('#educacion')?.value,
        vivienda: $('#vivienda')?.value,
        cuidador_check: $('#cuidador_check')?.checked,
        barreras_comunicacion: $('#barreras_comunicacion')?.value,
        contacto_digital: $('#contacto_digital')?.value,
        
        // R. Consentimientos y Metadatos
        tratamiento_datos: $('#tratamiento_datos')?.checked,
        fecha_firma: $('#fecha_firma')?.value,
        
        created: STATE.patientCreatedTime,
        modified: new Date().toISOString(),
        creator: STATE.patientCreator, // Preservar creador
        modifier: STATE.currentUser?.profile?.id
    };
}

// --- CARGADOR DE DATOS (Mapeo Inverso JSON -> DOM) ---
export function loadPatientDataToDOM(data) {
    if (!data) return;

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

    // Restaurar estado global y metadatos
    STATE.patientCreatedTime = data.created;
    STATE.patientModifiedTime = data.modified;
    STATE.patientCreator = data.creator; // Restaurar creador original
    
    if(data.uuid) STATE.patientUUID = Math.max(STATE.patientUUID, parseInt(data.uuid) + 1);

    // Refrescar UI dependiente de datos
    toggleConditionalFields();
    calcularCampos();
    updatePatientHeader();
}
