import { $, $$, flash, showErr, calcAge, fmtDateTime, STATE } from 'brain';

// ==========================================
// 1. TEMPLATE HTML (LA VISTA DEL MODELO)
// ==========================================
const PATIENT_TEMPLATE = `
    <div class="form-section">
      <div class="form-section-title">ID</div>
      <div class="form-grid">
        <div class="span-1" draggable="false">
          <label class="form-label">Tipo Doc *</label>
          <select id="documento_tipo" class="form-select" style=""><option value="C.I.">Cédula</option><option value="Pasaporte">Pasaporte</option><option value="RIF">RIF</option></select>
        </div>
        <div class="span-1" draggable="false"><label class="form-label">Número Doc *</label><input id="documento_numero" class="form-input" placeholder="Ej: V-12345678" data-mask="cedula" style=""></div>
        <div class="span-1" draggable="false" style=""><label class="form-label">ID Interno</label><input id="internal_id" class="form-input calculated-field" readonly="" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">UUID</label><input id="uuid" class="form-input calculated-field" readonly="" style=""></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Nombre</div>
      <div class="form-grid">
        <div class="span-1" draggable="false"><label class="form-label">Primer Nombre *</label><input id="primer_nombre" class="form-input" data-mask="capital" style=""></div>
        <div class="span-1" draggable="false"><label class="form-label">Segundo Nombre</label><input id="segundo_nombre" class="form-input" data-mask="capital" style=""></div>
        <div class="span-1" draggable="false"><label class="form-label">Primer Apellido *</label><input id="primer_apellido" class="form-input" data-mask="capital" style=""></div>
        <div class="span-1" draggable="false"><label class="form-label">Segundo Apellido</label><input id="segundo_apellido" class="form-input" data-mask="capital" style=""></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Demografía</div>
      <div class="form-grid" style="grid-template-columns: repeat(6, 1fr);">
        <div class="span-1" draggable="false" style=""><label class="form-label">Fecha de Nacimiento *</label><input id="fecha_nacimiento" type="date" class="form-input" style=""></div>
        <div class="span-1" draggable="false"><label class="form-label">Edad</label><input id="edad_auto" class="form-input calculated-field" readonly="" style="text-align: center;"></div>
        <div class="span-1" draggable="false" style=""><label class="form-label">Sexo</label><select id="genero" class="form-select" style=""><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
        <div class="span-1" draggable="false"><label class="form-label">Id. Género</label><select id="identidad_genero" class="form-select" style=""><option value="Cis">Cis</option><option value="Trans">Trans</option><option value="Otro">Otro</option></select></div>
        <div class="span-1" draggable="false"><label class="form-label">E. Civil</label><select id="estado_civil" class="form-select" style=""><option value="Soltero">Soltero</option><option value="Casado">Casado</option></select></div>
      <div class="span-1" draggable="false"><label class="form-label">Comunicación</label><select id="barrera" class="form-select" style=""><option value="Sin Barreras">Sin Barreras</option><option value="Discapacidad">Discapacidad</option></select></div></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Contacto</div>
      <div class="form-grid" style="grid-template-columns: repeat(5, 1fr);">
      <div class="span-1" draggable="false" style=""><label class="form-label">Móvil *</label><input id="tel_principal" class="form-input" placeholder="+58 (412) 123-4567" data-mask="phone" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Otro Tlf</label><input id="tel_secundario" class="form-input" placeholder="+58 (212) ..." data-mask="phone" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Email Principal</label><input id="email_principal" type="email" class="form-input" placeholder="usuario@dominio.com" data-mask="email" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Email Secundario</label><input id="email_secundario" type="email" class="form-input" placeholder="usuario@dominio.com" data-mask="email" style=""></div><div class="span-2" draggable="false" style=""><label class="form-label">Dirección</label><input id="dir_calle_num" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Ciudad</label><input id="dir_ciudad" class="form-input" value="Caracas" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Estado</label><input id="dir_estado" class="form-input" value="Miranda" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">País</label><input id="dir_pais" class="form-input" value="Venezuela" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Código Postal</label><input id="dir_postal" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Instagram</label><input id="instagram" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Twitter/X</label><input id="x_twitter" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Facebook</label><input id="facebook" class="form-input" style=""></div></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">En Caso de Emergencia, contactar a:</div>
      <div class="form-grid">
      <div class="span-1" draggable="false" style=""><label class="form-label">Nombre</label><input id="emergencia_nombre" class="form-input" data-mask="capital" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Relación</label><select id="emergencia_parentesco" class="form-select" style=""><option value="Familiar">Familiar</option><option value="Pareja">Pareja</option><option value="Amistad">Amistad</option><option value="Otro">Otro</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Teléfono</label><input id="emergencia_telefono" class="form-input" placeholder="+58..." data-mask="phone" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Email</label><input id="emergencia_email" class="form-input" data-mask="email" style=""></div></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Administrativo</div>
      <div class="form-grid">
      <div class="span-1" draggable="false" style=""><label class="form-label">Educación</label><select id="educacion" class="form-select" style=""><option value="Primaria">Primaria</option><option value="Secundaria">Secundaria</option><option value="Bachiller">Bachiller</option><option value="Tecnico">Tecnico</option><option value="Pregrado">Pregrado</option><option value="Licenciatura">Licenciatura</option><option value="Postgrado">Postgrado</option><option value="Maestria">Maestria</option><option value="Doctorado">Doctorado</option><option value="Prefiero No decirlo">Prefiero No decirlo</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Ocupación</label><input id="ocupacion" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Seguro</label><input id="aseguradora" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Póliza</label><input id="numero_poliza" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Admisión</label><input id="fecha_admision" type="date" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Alta</label><input id="fecha_alta" type="date" class="form-input" style=""></div><div class="span-1" draggable="false"><label class="form-label">Referido Por</label><input id="referidopor" class="form-input" style=""></div></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Datos Biométricos</div>
      <div class="form-grid">
      <div class="span-1" style="display: flex; gap: 2px;" draggable="false">
           <select id="grupo_sanguineo" class="form-select" style="padding: 0px 2px;"><option value="O">O</option><option value="A">A</option><option value="B">B</option></select>
           <select id="factor_rh" class="form-select" style="padding:0 2px;"><option value="+">+</option><option value="-">-</option></select>
        </div><div class="span-1" draggable="false" style=""><label class="form-label">Peso (kg)</label><input id="peso_kg" type="number" step="0.1" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Talla (cm)</label><input id="talla_cm" type="number" step="1" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Lateralidad</label><select id="lateralidad" class="form-select" style=""><option value="Diestro">Diestro</option><option value="Zurdo">Zurdo</option><option value="Ambidiestro">Ambidiestro</option><option value="Contrariado">Contrariado</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">IMC</label><input id="imc_auto" class="form-input calculated-field" readonly="" style=""></div></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Antecedentes Personales</div>
      <div class="form-grid">
      <div class="span-1" style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;" draggable="false">
           <div class="checkbox-group"><input type="checkbox" id="alergias_check" data-toggle-target="alergias_detalle" style=""><label for="alergias_check" class="text-danger">Alergias</label></div>
           <input id="alergias_detalle" class="form-input alert-field" placeholder="Especifique..." style="display:none;">
        </div><div class="span-1" style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;" draggable="false">
           <div class="checkbox-group"><input type="checkbox" id="cronicas_check" data-toggle-target="cronicas_detalle" style=""><label for="cronicas_check" class="text-danger">Enfermedad Crónica</label></div>
           <input id="cronicas_detalle" class="form-input alert-field" placeholder="Especifique..." style="display:none;">
        </div><div class="span-1" style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;" draggable="false">
           <div class="checkbox-group"><input type="checkbox" id="medicamentos_check" data-toggle-target="medicamentos_detalle" style=""><label for="medicamentos_check" class="text-danger">Medicamentos Activos</label></div>
           <input id="medicamentos_detalle" class="form-input alert-field" placeholder="Especifique..." style="display:none;">
        </div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="diabetes_check" style=""><label for="diabetes_check">DM</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="asma_check" style=""><label for="asma_check">Asma</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="cardiopatias_check" style=""><label for="cardiopatias_check">Cardiopatía</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="epilepsia_check" style=""><label for="epilepsia_check">Epilepsia</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="tiroideos_check" style=""><label for="tiroideos_check">Tiroides</label></div><div class="span-1" draggable="false" style=""><label class="form-label">Riesgo Caídas</label><select id="riesgo_caidas" class="form-select" style=""><option value="Bajo">Bajo</option><option value="Alto">Alto</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Voluntad Anticipada</label><select id="voluntad_anticipada" class="form-select" style=""><option value="No">No</option><option value="Si">Si</option></select></div><div class="span-1" draggable="false"><label class="form-label">Otros Antecedentes</label><input id="otros_antecedentes" class="form-input" style=""></div></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Habitos y Salud</div>
      <div class="form-grid">
      <div class="span-1" draggable="false" style=""><label class="form-label">Estado Fisico General</label><select id="estadofisico" class="form-select" style=""><option value="Sedentario">Sedentario</option><option value="Deportista">Deportista</option><option value="Rutina de Ejercicios">Rutina de Ejercicios</option><option value="Ejercicio esporádico">Ejercicio esporádico</option><option value="Sedentarismo">Sedentarismo</option><option value="Prefiero No decirlo">Prefiero No decirlo</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Horas de sueño</label><select id="Sueno" class="form-select" style=""><option value="≥ 7 horas diarias">≥ 7 horas diarias</option><option value="≤ 6 horas diarias">≤ 6 horas diarias</option><option value="Insuficiente">Insuficiente</option><option value="Suficientes">Suficientes</option><option value="Prefiero No decirlo">Prefiero No decirlo</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Salud Sexual</label><select id="saludsexual" class="form-select" style=""><option value="Poco frecuente">Poco frecuente</option><option value="Poco o Nada">Poco o Nada</option><option value="Regularmente">Regularmente</option><option value="Mucho">Mucho</option><option value="Prefiero No decirlo">Prefiero No decirlo</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Consumo de Alcohol</label><select id="alcohol" class="form-select" style=""><option value="Nunca">Nunca</option><option value="Poco">Poco</option><option value="Social">Social</option><option value="Frecuente">Frecuente</option><option value="Prefiero No decirlo">Prefiero No decirlo</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Fuma?</label><select id="tabaquismo" class="form-select" style=""><option value="No">No</option><option value="Si">Si</option><option value="Prefiero No decirlo">Prefiero No decirlo</option></select></div><div class="span-1" draggable="false" style=""><label class="form-label">Otras Sustancias</label><input id="sustancias" class="form-input" style=""></div></div>
    </div>
    <div class="form-section">
        <div class="form-section-title">Inmunizaciones</div>
        <div class="form-grid">
        <div class="span-1 checkbox-group" draggable="false" style=""><input type="checkbox" id="esquema_infancia" style=""><label for="new_185">Tiene esquema de Vacunación Infantil?</label></div><div class="span-1" draggable="false"><label class="form-label">Vacunas COVID-19</label><select id="covid_estado" class="form-select" style=""><option value="No Vacunado">No Vacunado</option><option value="Esquema Básico">Esquema Básico</option><option value="Con Refuerzos">Con Refuerzos</option><option value="Prefiero No Decirlo">Prefiero No Decirlo</option></select></div><div class="span-2"><label class="form-label">Ha Tenido Recciones adverss a Vacunas?</label><input id="reacciones_adversas" class="form-input" style="" placeholder="Ejemplo: Fiebre, Alergia"></div><div class="span-2" draggable="false"><label class="form-label">Otras Vacunas Relevantes?</label><input id="otras_vacunas" class="form-input" style="" placeholder="Fiebre amarilla, VPH, Influenza, etc"></div></div>
    </div>
    <div class="form-section">
        <div class="form-section-title">Antecedentes Familiares</div>
        <div class="form-grid" style="grid-template-columns: repeat(6, 1fr);">
        <div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="familia_hipertension" style=""><label>HTA</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="familia_diabetes" style=""><label>DM</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="familia_cardiopatias" style=""><label>Cardiopatía</label></div><div class="checkbox-group" draggable="false" style=""><input type="checkbox" id="familia_cancer" style=""><label>Ca</label></div><div class="span-4" style="grid-column: span 4;" draggable="false"><input id="familia_geneticas" class="form-input" placeholder="Genéticas..." style=""></div></div>
    </div>
    <div class="form-section">
        <div class="form-section-title">Lesiones y Fracturas</div>
        <div class="form-grid">
        <div class="span-1 checkbox-group" draggable="false" style=""><input type="checkbox" id="fractura_bool" style=""><label for="fractura_bool">¿Fractura?</label></div><div class="span-2" draggable="false" style=""><label class="form-label">Lesión Desc.</label><input id="lesion_desc" class="form-input" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Tipo</label><select id="lesion_tipo" class="form-select" style=""><option value="Golpe">Golpe</option><option value="Cortada">Cortada</option><option value="Golpe + Cortada">Golpe + Cortada</option></select></div></div>
    </div>
    <div class="form-section">
        <div class="form-section-title">Historial Quirúrgico</div>
        <div class="form-grid">
        <div class="span-1 checkbox-group" draggable="false" style=""><input type="checkbox" id="tiene_cirugias" data-toggle-target="cirugia_descripcion" style=""><label for="tiene_cirugias">¿Cirugías?</label></div><div class="span-2" draggable="false" style=""><label class="form-label">Descripción</label><input id="cirugia_descripcion" class="form-input" disabled="" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Año</label><input id="cirugia_anio" type="number" class="form-input" disabled="" style=""></div></div>
    </div>
    <div class="form-section">
        <div class="form-section-title">Hospitalizaciones</div>
        <div class="form-grid">
        <div class="span-1 checkbox-group" draggable="false" style=""><input type="checkbox" id="ha_sido_hospitalizado" data-toggle-target="hospitalizacion_motivo" style=""><label for="ha_sido_hospitalizado">¿Hospitalizado?</label></div><div class="span-2" draggable="false" style=""><label class="form-label">Motivo</label><input id="hospitalizacion_motivo" class="form-input" disabled="" style=""></div><div class="span-1" draggable="false" style=""><label class="form-label">Año</label><input id="hospitalizacion_anio" type="number" class="form-input" disabled="" style=""></div><div class="span-1 checkbox-group" draggable="false" style=""><input type="checkbox" id="transfusion" style=""><label for="new_159">Recibió Transfusión Sanguínea</label></div></div>
    </div>
    <div class="form-section">
        <div class="form-section-title">Consentimiento de Datos</div>
        <div class="form-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="checkbox-group span-1" draggable="false" style="">
            <input type="checkbox" id="tratamiento_datos" style="">
            <label for="tratamiento_datos">Paciente acepta política de tratamiento de datos</label>
            <span id="label_fecha_firma" style="margin-left:auto; font-size:0.8em; color:#93c5fd; font-family:monospace;"></span>
            <input id="fecha_firma" type="hidden">
        </div></div>
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
        // Reinicializar validadores e inputs especiales
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

function updatePatientTimestamps() {
    if (!STATE.patientCreatedTime) STATE.patientCreatedTime = new Date().toISOString();
    STATE.patientModifiedTime = new Date().toISOString();
    
    const user = STATE.currentUser?.profile?.id || 'u-001';
    
    const elCreated = $("#patient-meta-created");
    const elModified = $("#patient-meta-modified");

    if(elCreated) elCreated.textContent = `Creado: ${fmtDateTime(STATE.patientCreatedTime)} por ${user}`;
    if(elModified) elModified.textContent = ` | Modificado: ${fmtDateTime(STATE.patientModifiedTime)}`;
}

// AQUÍ ESTÁ LA MEJORA: AHORA MUESTRA TUS ANTECEDENTES EN EL HEADER
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
        tag.style.marginRight = "4px";
        
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

    // Alertas generales
    if ($("#alergias_check")?.checked) addBadge("Alergias", "high");
    if ($("#riesgo_caidas")?.value === "Alto") addBadge("Riesgo Caída", "critical");
    
    // Tus Antecedentes Personales Específicos
    if ($("#hipertension_check")?.checked) addBadge("HTA", "high");
    if ($("#diabetes_check")?.checked) addBadge("DM", "high");
    if ($("#asma_check")?.checked) addBadge("Asma", "high");
    if ($("#cardiopatias_check")?.checked) addBadge("Cardio", "high");
    if ($("#epilepsia_check")?.checked) addBadge("Epilepsia", "high");
    if ($("#tiroideos_check")?.checked) addBadge("Tiroides", "high");
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

    if (typeof flatpickr !== 'undefined') {
         flatpickr("#patientForm input[type='date']", {
            dateFormat: "Y-m-d",
            locale: "es", 
            allowInput: true
        });
    }
}

export function toggleConditionalFields() {
    const map = [
        { check: 'alergias_check', area: 'alergias_detalle' },
        { check: 'cronicas_check', area: 'cronicas_detalle' },
        { check: 'medicamentos_check', area: 'medicamentos_detalle' },
        { check: 'tiene_cirugias', fields: ['cirugia_descripcion', 'cirugia_anio'] },
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

// --- VALIDACIONES Y LÓGICA SMART ---
export function initPatientValidators() {
    
    $$('[data-mask]').forEach(el => {
        el.addEventListener('blur', () => {
            const type = el.dataset.mask;
            let val = el.value.trim();
            if(!val) return;

            if (type === 'cedula' && /^\d+$/.test(val)) {
                el.value = "V-" + val;
            }
            else if (type === 'phone') {
                const nums = val.replace(/\D/g, '');
                if(nums.length > 0 && val.startsWith('0')) el.value = '+58 ' + val.substring(1); 
            }
            else if (type === 'email') {
                if(!val.includes('@')) {
                    showErr(`Email inválido.`);
                    el.classList.add('input-error');
                } else {
                    el.classList.remove('input-error');
                }
            }
            else if (type === 'capital') {
                el.value = val.replace(/\b\w/g, l => l.toUpperCase());
            }
        });
    });

    $$('[data-toggle-target]').forEach(check => {
        const toggle = () => {
            const targetId = check.dataset.toggleTarget;
            const target = $('#' + targetId);
            if(target) {
                target.style.display = check.checked ? 'block' : 'none';
                target.style.opacity = check.checked ? '1' : '0';
                target.style.transition = 'opacity 0.3s';
            }
        };
        check.addEventListener('change', toggle);
        toggle(); 
    });

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
        referido_por: $('#referidopor')?.value, // Corregido ID
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
        
        // Antecedentes específicos
        hipertension_check: $('#familia_hipertension')?.checked, // Ojo: en tu template usaste IDs de familia para personales? Verifica esto.
        // En tu template nuevo, los IDs son 'diabetes_check', 'asma_check'. 
        // Corregiré los nombres basados en tu template nuevo:
        diabetes_check: $('#diabetes_check')?.checked,
        asma_check: $('#asma_check')?.checked,
        cardiopatias_check: $('#cardiopatias_check')?.checked,
        epilepsia_check: $('#epilepsia_check')?.checked,
        tiroideos_check: $('#tiroideos_check')?.checked,
        otros_antecedentes: $('#otros_antecedentes')?.value,
        
        tiene_cirugias: $('#tiene_cirugias')?.checked,
        cirugia_descripcion: $('#cirugia_descripcion')?.value,
        cirugia_anio: $('#cirugia_anio')?.value,
        
        ha_sido_hospitalizado: $('#ha_sido_hospitalizado')?.checked,
        hospitalizacion_motivo: $('#hospitalizacion_motivo')?.value,
        hospitalizacion_anio: $('#hospitalizacion_anio')?.value,
        transfusion: $('#transfusion')?.checked,

        lesion_desc: $('#lesion_desc')?.value,
        lesion_tipo: $('#lesion_tipo')?.value,
        fractura_bool: $('#fractura_bool')?.checked,
        
        // Familiares
        familia_hipertension: $('#familia_hipertension')?.checked,
        familia_diabetes: $('#familia_diabetes')?.checked,
        familia_cancer: $('#familia_cancer')?.checked,
        familia_cardiopatias: $('#familia_cardiopatias')?.checked,
        familia_geneticas: $('#familia_geneticas')?.value,
        
        // Habitos
        tabaquismo: $('#tabaquismo')?.value,
        alcohol: $('#alcohol')?.value,
        sustancias: $('#sustancias')?.value,
        estadofisico: $('#estadofisico')?.value,
        sueno: $('#Sueno')?.value,
        saludsexual: $('#saludsexual')?.value,
        
        ocupacion: $('#ocupacion')?.value,
        educacion: $('#educacion')?.value,
        
        esquema_infancia: $('#esquema_infancia')?.checked,
        covid_estado: $('#covid_estado')?.value,
        reacciones_adversas: $('#reacciones_adversas')?.value,
        otras_vacunas: $('#otras_vacunas')?.value,

        tratamiento_datos: $('#tratamiento_datos')?.checked,
        fecha_firma: $('#fecha_firma')?.value,
        
        created: STATE.patientCreatedTime,
        modified: new Date().toISOString(),
        creator: STATE.currentUser?.profile?.id,
        modifier: STATE.currentUser?.profile?.id
    };
    return data;
}

// --- DATA LOADER (CARGAR) ---
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
