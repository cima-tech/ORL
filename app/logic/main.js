/**
 * Sistema CIMA - Lógica Principal
 * Carga dinámicamente modelos de consulta y gestiona toda la funcionalidad
 */

window.CIMA = (function() {
  // =========== CONFIGURACIÓN GLOBAL ===========
  const CONFIG = {
    LOCAL_STORAGE_KEY: 'CIMA_PACIENTES',
    CURRENT_USER: 'u-001',
    DEFAULT_MODEL: 'ORL-001'
  };

  // =========== ESTADO GLOBAL ===========
  let state = {
    currentModel: null,
    patientIdCounter: 1,
    patientUUID: 1,
    patientCreatedTime: null,
    patientModifiedTime: null,
    visitIdCounter: 0,
    currentPreviewDoc: null,
    currentPreviewCard: null,
    USE_SIG: true,
    currentShareCard: null,
    editPreviewMode: false,
    loadedPatients: {}
  };

  // =========== FUNCIONES UTILITARIAS ===========
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  function flash(msg, isError = false) {
    const e = $("#err");
    e.textContent = msg;
    e.className = isError ? 'error' : '';
    e.style.display = 'block';
    setTimeout(() => e.style.display = 'none', 3000);
  }

  function showErr(msg) { 
    flash(msg, true); 
    console.error(msg); 
  }

  function calcAge(dob) {
    if (!dob) return '';
    const d = new Date(dob);
    const n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    const m = n.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
    return a;
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }

  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function getLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  // =========== GESTIÓN DE MODELOS ===========
  function loadModel(modelName) {
    try {
      // Por ahora solo cargamos ORL-001
      if (modelName === 'ORL-001') {
        if (!window.ORL001_CONSULTATION_MODEL) {
          throw new Error(`Modelo ${modelName} no encontrado`);
        }
        
        state.currentModel = window.ORL001_CONSULTATION_MODEL;
        
        // Cargar perfil del paciente si existe
        if (window.ORL001_PATIENT_PROFILE) {
          window.ORL001_PATIENT_PROFILE.renderForm('patientForm');
        }
        
        flash(`✅ Modelo ${modelName} cargado correctamente`);
        return true;
      }
      
      throw new Error(`Modelo ${modelName} no soportado`);
    } catch (error) {
      showErr(`Error cargando modelo: ${error.message}`);
      return false;
    }
  }

  // =========== COMPONENTES UI ===========
  function chip(label, active = false, opts = { toggle: true, type: 'normal' }) {
    const s = document.createElement('span');
    s.className = 'chip' + (active ? ' on' : '') + (opts.type === 'study' ? ' study-chip' : '');
    s.textContent = label;
    s.dataset.active = active ? '1' : '0';
    
    if (opts.toggle) {
      s.addEventListener('click', () => {
        if (s.classList.contains('disabled')) return;
        const on = s.dataset.active === '1';
        s.dataset.active = on ? '0' : '1';
        s.classList.toggle('on', !on);
        s.dispatchEvent(new CustomEvent('chip-toggle', { bubbles: true }));
      });
    }
    
    return s;
  }

  function addChips(container, items, opts = {}) {
    items.forEach(l => container.appendChild(chip(l, false, opts)));
  }

  function createChipGroup(title, items, container, opts = {}) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'chip-group';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'chip-group-title';
    titleEl.textContent = title;
    groupDiv.appendChild(titleEl);
    
    const chipsDiv = document.createElement('div');
    chipsDiv.className = 'chips';
    items.forEach(l => chipsDiv.appendChild(chip(l, false, opts)));
    groupDiv.appendChild(chipsDiv);
    
    container.appendChild(groupDiv);
  }

  // =========== GESTIÓN DE PACIENTE ===========
  function generateUUID() {
    return state.patientUUID++;
  }

  function generatePatientInternalId() {
    const id = state.patientIdCounter++;
    return `p${String(id).padStart(7, '0')}u001`;
  }

  function togglePatientDetails() {
    const details = $(".patient-details");
    const toggleBtn = $(".patient-toggle-btn i");
    
    details.classList.toggle('hidden');
    if (details.classList.contains('hidden')) {
      toggleBtn.className = 'bi bi-chevron-right';
    } else {
      toggleBtn.className = 'bi bi-chevron-down';
      if (!$("#patient-internal-id").textContent || $("#patient-internal-id").textContent === 'p0000001u001') {
        $("#patient-internal-id").textContent = generatePatientInternalId();
        $("#internal_id").value = $("#patient-internal-id").textContent;
      }
      if (!$("#uuid").value || $("#uuid").value === 'Generando...') {
        $("#uuid").value = generateUUID();
      }
    }
  }

  function editPatientDetails() {
    const details = $(".patient-details");
    if (details.classList.contains('hidden')) {
      togglePatientDetails();
    }
    $("#primer_nombre").focus();
  }

  function updatePatientHeader() {
    const primerNombre = $("#primer_nombre")?.value || '';
    const segundoNombre = $("#segundo_nombre")?.value || '';
    const primerApellido = $("#primer_apellido")?.value || '';
    const segundoApellido = $("#segundo_apellido")?.value || '';
    
    const nombreCompleto = [];
    if (primerNombre) nombreCompleto.push(primerNombre);
    if (segundoNombre) nombreCompleto.push(segundoNombre);
    if (primerApellido) nombreCompleto.push(primerApellido);
    if (segundoApellido) nombreCompleto.push(segundoApellido);
    
    const nombreDisplay = nombreCompleto.length > 0 ? nombreCompleto.join(' ') : 'Nuevo Paciente';
    
    const docTipo = $("#documento_tipo")?.value || '';
    const docNumero = $("#documento_numero")?.value || '';
    const docInfo = docTipo && docNumero ? `${docTipo}: ${docNumero}` : 'Documento: ---';
    
    const edad = $("#edad_auto")?.value || '--';
    const edadDisplay = edad ? `${edad} años` : '-- años';
    
    $("#patient-header-name").textContent = nombreDisplay;
    $("#patient-doc-info").textContent = docInfo;
    $("#patient-age-display").textContent = edadDisplay;
    
    updatePatientTimestamps();
  }

  function updatePatientTimestamps() {
    if (!state.patientCreatedTime) {
      state.patientCreatedTime = new Date().toISOString();
    }
    state.patientModifiedTime = new Date().toISOString();
    
    $("#patient-meta-created").textContent = 
      `Creado: ${fmtDateTime(state.patientCreatedTime)} por ${CONFIG.CURRENT_USER}`;
    $("#patient-meta-modified").textContent = 
      `Modificado: ${fmtDateTime(state.patientModifiedTime)} por ${CONFIG.CURRENT_USER}`;
  }

  function calcularCampos() {
    const fechaNacimiento = $("#fecha_nacimiento")?.value;
    if (fechaNacimiento) {
      const edad = calcAge(fechaNacimiento);
      $("#edad_auto").value = edad;
    } else {
      $("#edad_auto").value = '';
    }
    
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

  function guardarPaciente() {
    calcularCampos();
    
    // Validar campos obligatorios
    const camposRequeridos = [
      {id: 'primer_nombre', name: 'Primer nombre'},
      {id: 'primer_apellido', name: 'Primer apellido'},
      {id: 'documento_tipo', name: 'Tipo de documento'},
      {id: 'documento_numero', name: 'Número de documento'},
      {id: 'fecha_nacimiento', name: 'Fecha de nacimiento'},
      {id: 'tel_principal', name: 'Teléfono principal'},
      {id: 'tratamiento_datos', name: 'Consentimiento de datos', type: 'checkbox'}
    ];
    
    const errores = [];
    camposRequeridos.forEach(campo => {
      const elemento = $(`#${campo.id}`);
      if (!elemento) return;
      
      if (campo.type === 'checkbox') {
        if (!elemento.checked) {
          errores.push(`${campo.name} es requerido`);
        }
      } else {
        if (!elemento.value.trim()) {
          errores.push(`${campo.name} es requerido`);
        }
      }
    });
    
    if (errores.length > 0) {
      showErr(`Complete los campos requeridos: ${errores.join(', ')}`);
      return;
    }
    
    if (saveToLocal()) {
      flash('Datos del paciente guardados exitosamente');
    }
  }

  // =========== GESTIÓN DE VISITAS ===========
  function createVisitCard(type = 'Primera') {
    if (!state.currentModel) {
      showErr('No hay modelo de consulta cargado');
      return null;
    }
    
    const cardId = 'visit-' + (++state.visitIdCounter);
    const wrap = document.createElement('div');
    wrap.id = cardId;
    wrap.className = 'card visit-card';
    wrap.dataset.type = type;
    
    // Generar HTML basado en el modelo
    wrap.innerHTML = generateVisitHTML(cardId, type);
    
    // Configurar eventos
    setupVisitEvents(wrap, cardId);
    
    return wrap;
  }

  function generateVisitHTML(cardId, type) {
    const model = state.currentModel;
    const edad = $("#edad_auto")?.value || '[edad]';
    const edadStr = (edad || edad === 0) ? `${edad} años` : '[edad]';
    const genero = $("#genero")?.value || '[género]';
    const eaAuto = `Paciente ${genero} de ${edadStr} quien acude a consulta por presentar [Motivo de consulta].`;
    
    let html = `
      <div class="visit-header">
        <button type="button" class="visit-toggle-btn" onclick="window.CIMA.toggleVisitBody('${cardId}')">
          <i class="bi bi-chevron-down"></i>
        </button>
        <span class="badge">${type}</span>
        <span style="flex: 1;">Consulta ${type.toLowerCase()}</span>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-primary btn-small btn-inf">
            <i class="bi bi-file-text"></i> Informe
          </button>
          <button type="button" class="btn btn-success btn-small btn-rp">
            <i class="bi bi-prescription"></i> Receta
          </button>
        </div>
      </div>
      
      <div class="visit-body">
        <div class="row">
          <div class="col">
            <label class="form-label">Fecha y Hora</label>
            <input type="datetime-local" class="form-input visit-date" value="${getLocalDateTime()}">
          </div>
        </div>
        
        <!-- BLOQUE 1: ANAMNESIS -->
        <div class="form-section">
          <div class="form-section-title">1. Anamnesis</div>
          
          <!-- 1.1 Motivo de Consulta -->
          <div class="row">
            <div class="col">
              <label class="form-label">Motivo de Consulta</label>
              <input id="txt-motivo-${cardId}" class="form-input txt-motivo" placeholder="${model.anamnesis.motivoConsulta.placeholder}">
              <div id="chips-motivo-${cardId}" class="chips chips-motivo" style="margin-top: 8px;"></div>
            </div>
          </div>
          
          <!-- 1.2 Enfermedad Actual -->
          <div class="row">
            <div class="col">
              <label class="form-label">Enfermedad Actual</label>
              <textarea id="txt-ea-${cardId}" class="form-input txt-ea" rows="3" placeholder="${model.anamnesis.enfermedadActual.placeholder}">${eaAuto}</textarea>
            </div>
          </div>
          
          <!-- 1.3 Antecedentes -->
          <div class="row">
            <div class="col">
              <label class="form-label">Antecedentes Personales</label>
              <input id="txt-antecedentes-personales-${cardId}" class="form-input txt-antecedentes-personales" placeholder="${model.anamnesis.antecedentesPersonales.placeholder}">
              <div id="chips-antecedentes-personales-${cardId}" class="chips chips-antecedentes-personales" style="margin-top: 8px;"></div>
            </div>
            <div class="col">
              <label class="form-label">Antecedentes Familiares</label>
              <input id="txt-antecedentes-familiares-${cardId}" class="form-input txt-antecedentes-familiares" placeholder="${model.anamnesis.antecedentesFamiliares.placeholder}">
              <div id="chips-antecedentes-familiares-${cardId}" class="chips chips-antecedentes-familiares" style="margin-top: 8px;"></div>
            </div>
          </div>
        </div>
    `;
    
    // BLOQUE 2: EXAMEN FÍSICO
    html += `
        <div class="form-section">
          <div class="form-section-title">2. Examen Físico</div>
    `;
    
    // Cara
    html += `
          <div class="exam-area">
            <div class="exam-area-title"><i class="bi bi-emoji-neutral"></i> Cara</div>
            <label class="form-label">Hallazgos en Cara</label>
            <input id="txt-exam-cara-${cardId}" class="form-input txt-exam-cara" placeholder="${model.examenFisico.cara.placeholder}">
            <div id="chips-exam-cara-${cardId}" class="chips chips-exam-cara" style="margin-top: 8px;"></div>
          </div>
    `;
    
    // Oído Derecho
    html += `
          <div class="exam-area">
            <div class="exam-area-title"><i class="bi bi-ear"></i> Oído Derecho</div>
            <label class="form-label">Hallazgos Oído Derecho</label>
            <textarea id="txt-exam-oido-derecho-${cardId}" class="form-input txt-exam-oido-derecho" rows="2" placeholder="${model.examenFisico.oidoDerecho.placeholder}"></textarea>
            <div id="chips-exam-oido-derecho-${cardId}" style="margin-top: 8px;"></div>
          </div>
    `;
    
    // Oído Izquierdo
    html += `
          <div class="exam-area">
            <div class="exam-area-title"><i class="bi bi-ear"></i> Oído Izquierdo</div>
            <label class="form-label">Hallazgos Oído Izquierdo</label>
            <textarea id="txt-exam-oido-izquierdo-${cardId}" class="form-input txt-exam-oido-izquierdo" rows="2" placeholder="${model.examenFisico.oidoIzquierdo.placeholder}"></textarea>
            <div id="chips-exam-oido-izquierdo-${cardId}" style="margin-top: 8px;"></div>
          </div>
    `;
    
    // Nariz
    html += `
          <div class="exam-area">
            <div class="exam-area-title"><i class="bi bi-droplet"></i> Nariz</div>
            <label class="form-label">Hallazgos en Nariz</label>
            <textarea id="txt-exam-nariz-${cardId}" class="form-input txt-exam-nariz" rows="2" placeholder="${model.examenFisico.nariz.placeholder}"></textarea>
            <div id="chips-exam-nariz-${cardId}" style="margin-top: 8px;"></div>
          </div>
    `;
    
    // Orofaringe
    html += `
          <div class="exam-area">
            <div class="exam-area-title"><i class="bi bi-mic"></i> Orofaringe</div>
            <label class="form-label">Hallazgos en Orofaringe</label>
            <textarea id="txt-exam-orofaringe-${cardId}" class="form-input txt-exam-orofaringe" rows="2" placeholder="${model.examenFisico.orofaringe.placeholder}"></textarea>
            <div id="chips-exam-orofaringe-${cardId}" style="margin-top: 8px;"></div>
          </div>
    `;
    
    // Cuello
    html += `
          <div class="exam-area">
            <div class="exam-area-title"><i class="bi bi-person-standing"></i> Cuello</div>
            <label class="form-label">Hallazgos en Cuello</label>
            <input id="txt-exam-cuello-${cardId}" class="form-input txt-exam-cuello" placeholder="${model.examenFisico.cuello.placeholder}">
            <div id="chips-exam-cuello-${cardId}" class="chips chips-exam-cuello" style="margin-top: 8px;"></div>
          </div>
        </div>
    `;
    
    // BLOQUE 3: ESTUDIOS
    html += `
        <div class="form-section">
          <div class="form-section-title">3. Estudios</div>
          
          <div class="row">
            <div class="col">
              <label class="form-label">Seleccionar Estudios</label>
              <div id="chips-studies-${cardId}" class="chips chips-studies" style="margin-top: 8px;"></div>
              <div id="studies-content-${cardId}" style="margin-top: 16px;"></div>
            </div>
          </div>
          
          <div class="row">
            <div class="col">
              <label class="form-label">Estudios Adicionales (sin chips, solo texto)</label>
              <div id="additional-studies-${cardId}" class="additional-studies-container" style="margin-top: 8px;"></div>
            </div>
          </div>
        </div>
    `;
    
    // BLOQUE 4: DIAGNÓSTICO Y PLAN
    html += `
        <div class="form-section">
          <div class="form-section-title">4. Diagnóstico y Plan</div>
          
          <!-- 4.1 Diagnóstico -->
          <div class="row">
            <div class="col">
              <label class="form-label">Diagnóstico</label>
              <input id="txt-dx-${cardId}" class="form-input txt-dx" placeholder="${model.diagnosticoPlan.diagnostico.placeholder}">
              <div id="chips-dx-${cardId}" class="chips chips-dx" style="margin-top: 8px;"></div>
            </div>
          </div>
          
          <!-- 4.2 Recipe -->
          <div class="row">
            <div class="col">
              <label class="form-label">Medicamentos / RP</label>
              <textarea id="txt-recipe-${cardId}" class="form-input txt-recipe" rows="4" placeholder="${model.diagnosticoPlan.recipe.placeholder}"></textarea>
              <div id="recipe-chips-${cardId}" class="recipe-chips-container" style="margin-top: 8px;"></div>
            </div>
          </div>
          
          <!-- 4.3 Indicaciones -->
          <div class="row">
            <div class="col">
              <label class="form-label">Indicaciones (Posología)</label>
              <textarea id="txt-indicaciones-${cardId}" class="form-input txt-indicaciones" rows="6" placeholder="${model.diagnosticoPlan.indicaciones.placeholder}"></textarea>
              <div id="indicaciones-dropdowns-${cardId}" class="indicaciones-dropdowns" style="margin-top: 8px;"></div>
            </div>
          </div>
          
          <!-- 4.4 Plan -->
          <div class="row">
            <div class="col">
              <label class="form-label">Plan / Tratamiento Final</label>
              <textarea id="txt-plan-${cardId}" class="form-input txt-plan" rows="8" placeholder="${model.diagnosticoPlan.plan.placeholder}"></textarea>
            </div>
          </div>
        </div>
        
        <div class="doc-status-area" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(96, 165, 250, 0.1);"></div>
      </div>
    `;
    
    return html;
  }

  function setupVisitEvents(card, cardId) {
    const model = state.currentModel;
    
    // Cargar chips para cada sección
    loadChipsForVisit(card, cardId);
    
    // Configurar botones de informe y receta
    card.querySelector('.btn-inf').addEventListener('click', () => {
      if (state.currentPreviewDoc === 'INF' && state.currentPreviewCard === card) closePreview();
      else openDoc('INF', card);
    });
    
    card.querySelector('.btn-rp').addEventListener('click', () => {
      if (state.currentPreviewDoc === 'RP' && state.currentPreviewCard === card) closePreview();
      else openDoc('RP', card);
    });
    
    // Configurar eventos para textareas
    card.querySelector(`#txt-recipe-${cardId}`)?.addEventListener('input', function() {
      this.dataset.userEdited = '1';
    });
    
    card.querySelector(`#txt-indicaciones-${cardId}`)?.addEventListener('input', function() {
      this.dataset.userEdited = '1';
    });
    
    card.querySelector(`#txt-plan-${cardId}`)?.addEventListener('input', function() {
      this.dataset.userEdited = '1';
    });
  }

  function loadChipsForVisit(card, cardId) {
    const model = state.currentModel;
    
    // Cargar chips de anamnesis
    addChips(card.querySelector(`#chips-motivo-${cardId}`), model.anamnesis.motivoConsulta.chips);
    addChips(card.querySelector(`#chips-antecedentes-personales-${cardId}`), model.anamnesis.antecedentesPersonales.chips);
    addChips(card.querySelector(`#chips-antecedentes-familiares-${cardId}`), model.anamnesis.antecedentesFamiliares.chips);
    
    // Cargar chips de examen físico
    addChips(card.querySelector(`#chips-exam-cara-${cardId}`), model.examenFisico.cara.chips);
    addChips(card.querySelector(`#chips-exam-cuello-${cardId}`), model.examenFisico.cuello.chips);
    
    // Cargar chips agrupados para examen físico
    loadGroupedChips(card.querySelector(`#chips-exam-oido-derecho-${cardId}`), model.examenFisico.oidoDerecho.groups);
    loadGroupedChips(card.querySelector(`#chips-exam-oido-izquierdo-${cardId}`), model.examenFisico.oidoIzquierdo.groups);
    loadGroupedChips(card.querySelector(`#chips-exam-nariz-${cardId}`), model.examenFisico.nariz.groups);
    loadGroupedChips(card.querySelector(`#chips-exam-orofaringe-${cardId}`), model.examenFisico.orofaringe.groups);
    
    // Cargar chips de diagnóstico
    addChips(card.querySelector(`#chips-dx-${cardId}`), model.diagnosticoPlan.diagnostico.chips);
    
    // Cargar chips de estudios
    loadStudyChips(card, cardId);
    
    // Cargar chips de recipe
    loadRecipeChips(card, cardId);
    
    // Cargar estudios adicionales
    loadAdditionalStudies(card, cardId);
  }

  function loadGroupedChips(container, groups) {
    if (!container || !groups) return;
    
    Object.entries(groups).forEach(([groupName, items]) => {
      createChipGroup(groupName, items, container);
    });
  }

  function loadStudyChips(card, cardId) {
    const model = state.currentModel;
    const studiesContainer = card.querySelector(`#chips-studies-${cardId}`);
    const studiesContent = card.querySelector(`#studies-content-${cardId}`);
    
    model.estudios.estudiosConChips.forEach(study => {
      const studyChip = chip(study.name, false, {type: 'study'});
      
      studyChip.addEventListener('click', function() {
        const studyId = `study-${study.name.toLowerCase().replace(/ /g, '-')}-${cardId}`;
        
        if (this.classList.contains('on')) {
          // Mostrar contenido del estudio
          if (!document.getElementById(studyId)) {
            const studyDiv = document.createElement('div');
            studyDiv.id = studyId;
            studyDiv.className = 'study-content';
            studyDiv.innerHTML = `
              <div style="font-weight: 700; color: #60a5fa; margin-bottom: 12px;">${study.name}</div>
              <label class="form-label">Conclusión ${study.name}</label>
              <textarea id="${study.textboxId}-${cardId}" class="form-input" rows="3" placeholder="${study.placeholder}"></textarea>
              <div id="study-chips-${study.name.toLowerCase().replace(/ /g, '-')}-${cardId}" style="margin-top: 12px;"></div>
            `;
            
            studiesContent.appendChild(studyDiv);
            
            // Cargar chips del estudio
            const studyChipsContainer = studyDiv.querySelector(`#study-chips-${study.name.toLowerCase().replace(/ /g, '-')}-${cardId}`);
            loadGroupedChips(studyChipsContainer, study.groups);
          }
        } else {
          // Ocultar contenido del estudio
          const studyDiv = document.getElementById(studyId);
          if (studyDiv) {
            studyDiv.remove();
          }
        }
      });
      
      studiesContainer.appendChild(studyChip);
    });
  }

  function loadRecipeChips(card, cardId) {
    const model = state.currentModel;
    const container = card.querySelector(`#recipe-chips-${cardId}`);
    
    if (!container) return;
    
    Object.entries(model.diagnosticoPlan.recipe.groups).forEach(([groupName, meds]) => {
      const groupDiv = document.createElement('div');
      groupDiv.style.marginBottom = '12px';
      groupDiv.innerHTML = `
        <div style="font-weight: 600; color: #60a5fa; margin: 8px 0;">${groupName}</div>
        <div class="chips recipe-chips-group" data-group="${groupName}"></div>
      `;
      
      const chipsBox = groupDiv.querySelector('.chips');
      meds.forEach(med => {
        const c = chip(med, false);
        c.addEventListener('click', () => {
          updateRecipeTextbox(card, cardId);
          updateIndicacionesSection(card, cardId);
        });
        chipsBox.appendChild(c);
      });
      
      container.appendChild(groupDiv);
    });
  }

  function loadAdditionalStudies(card, cardId) {
    const model = state.currentModel;
    const container = card.querySelector(`#additional-studies-${cardId}`);
    
    if (!container) return;
    
    model.estudios.estudiosAdicionales.forEach(studyName => {
      const studyDiv = document.createElement('div');
      studyDiv.className = 'additional-study';
      studyDiv.innerHTML = `
        <div class="additional-study-title">${studyName}</div>
        <textarea id="txt-study-${studyName.toLowerCase().replace(/ /g, '-')}-${cardId}" class="form-input" rows="2" placeholder="Conclusión ${studyName}..."></textarea>
      `;
      container.appendChild(studyDiv);
    });
  }

  function updateRecipeTextbox(card, cardId) {
    const selected = [...card.querySelectorAll('.recipe-chips-group .chip.on')].map(c => c.textContent);
    const txtRecipe = card.querySelector(`#txt-recipe-${cardId}`);
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
      txtRecipe.value = selected.join('\n');
    }
  }

  function updateIndicacionesSection(card, cardId) {
    const dropdownsContainer = card.querySelector(`#indicaciones-dropdowns-${cardId}`);
    const selectedByGroup = {};
    
    card.querySelectorAll('.recipe-chips-group').forEach(groupChips => {
      const groupName = groupChips.dataset.group;
      const selected = [...groupChips.querySelectorAll('.chip.on')].map(c => c.textContent);
      if (selected.length > 0) selectedByGroup[groupName] = selected;
    });
    
    dropdownsContainer.innerHTML = '';
    
    if (!card.indicacionesData) card.indicacionesData = {};
    
    const model = state.currentModel;
    
    Object.entries(selectedByGroup).forEach(([groupName, meds]) => {
      meds.forEach(medName => {
        const medDiv = document.createElement('div');
        medDiv.style.marginBottom = '10px';
        medDiv.innerHTML = `
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">${medName}</div>
          <select class="form-select indicacion-select" data-med="${medName}" data-group="${groupName}">
            <option value="">-- Seleccione indicación --</option>
          </select>
        `;
        
        const select = medDiv.querySelector('select');
        const options = model.diagnosticoPlan.recipe.indicacionesOptions[groupName] || [];
        
        options.forEach(ind => {
          const opt = document.createElement('option');
          opt.value = ind;
          opt.textContent = ind;
          select.appendChild(opt);
        });
        
        if (card.indicacionesData[medName]) {
          select.value = card.indicacionesData[medName];
        } else if (options.length > 0) {
          select.selectedIndex = 1;
          card.indicacionesData[medName] = select.value;
        }
        
        select.addEventListener('change', () => {
          card.indicacionesData[medName] = select.value;
          updateIndicacionesTextbox(card, cardId);
        });
        
        dropdownsContainer.appendChild(medDiv);
      });
    });
    
    updateIndicacionesTextbox(card, cardId);
  }

  function updateIndicacionesTextbox(card, cardId) {
    const txtIndicaciones = card.querySelector(`#txt-indicaciones-${cardId}`);
    if (!txtIndicaciones || txtIndicaciones.dataset.userEdited === '1') return;
    
    const lines = [];
    card.querySelectorAll('.indicacion-select').forEach(sel => {
      if (sel.value) lines.push(`${sel.dataset.med}: ${sel.value}`);
    });
    
    txtIndicaciones.value = lines.join('\n\n');
    updatePlanTratamiento(card, cardId);
  }

  function updatePlanTratamiento(card, cardId) {
    const model = state.currentModel;
    const txtPlan = card.querySelector(`#txt-plan-${cardId}`);
    const txtIndicaciones = card.querySelector(`#txt-indicaciones-${cardId}`);
    
    if (!txtPlan || txtPlan.dataset.userEdited === '1') return;
    
    const indicaciones = txtIndicaciones?.value || '';
    const contacto = model.diagnosticoPlan.plan.legalText;
    
    txtPlan.value = indicaciones + contacto;
  }

  // =========== PREVIEW Y DOCUMENTOS ===========
  function toggleVisitBody(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const body = card.querySelector('.visit-body');
    const btn = card.querySelector('.visit-toggle-btn i');
    if (!body || !btn) return;
    body.classList.toggle('hidden');
    btn.className = body.classList.contains('hidden') ? 'bi bi-chevron-right' : 'bi bi-chevron-down';
  }

  function closePreview() {
    $("#previewBar")?.classList.add('hidden');
    $("#previewShell")?.classList.add('hidden');
    $$('.btn-inf, .btn-rp').forEach(btn => btn.classList.remove('active'));
    state.editPreviewMode = false;
    state.currentPreviewDoc = null;
    state.currentPreviewCard = null;
  }

  function openDoc(kind, card) {
    $("#previewBar")?.classList.remove('hidden');
    $("#previewShell")?.classList.remove('hidden');
    
    const pv = $("#docPreview");
    if (!pv) return;
    
    const html = (kind === 'INF') ? buildReportHTML(card) : buildRecipeHTML(card);
    pv.innerHTML = html;
    applyZoom();
    
    state.currentPreviewDoc = kind;
    state.currentPreviewCard = card;
    
    // Hacer el preview editable si está en modo edición
    if (state.editPreviewMode) {
      enablePreviewEditing();
    }
    
    flash('Documento generado');
  }

  function buildReportHTML(card) {
    const model = state.currentModel;
    const cardId = card.id;
    const date = card.querySelector('.visit-date').value;
    
    // Recopilar datos de la consulta
    const motivo = card.querySelector(`#txt-motivo-${cardId}`)?.value || '';
    const ea = card.querySelector(`#txt-ea-${cardId}`)?.value || '';
    const antecedentesPersonales = card.querySelector(`#txt-antecedentes-personales-${cardId}`)?.value || '';
    const antecedentesFamiliares = card.querySelector(`#txt-antecedentes-familiares-${cardId}`)?.value || '';
    
    // Examen físico
    const examCara = card.querySelector(`#txt-exam-cara-${cardId}`)?.value || '';
    const examOidoDerecho = card.querySelector(`#txt-exam-oido-derecho-${cardId}`)?.value || '';
    const examOidoIzquierdo = card.querySelector(`#txt-exam-oido-izquierdo-${cardId}`)?.value || '';
    const examNariz = card.querySelector(`#txt-exam-nariz-${cardId}`)?.value || '';
    const examOrofaringe = card.querySelector(`#txt-exam-orofaringe-${cardId}`)?.value || '';
    const examCuello = card.querySelector(`#txt-exam-cuello-${cardId}`)?.value || '';
    
    // Diagnóstico y plan
    const dx = card.querySelector(`#txt-dx-${cardId}`)?.value || '';
    const plan = card.querySelector(`#txt-plan-${cardId}`)?.value || '';
    
    // Datos del paciente
    const primerNombre = $("#primer_nombre")?.value || '';
    const segundoNombre = $("#segundo_nombre")?.value || '';
    const primerApellido = $("#primer_apellido")?.value || '';
    const segundoApellido = $("#segundo_apellido")?.value || '';
    
    const nombreCompleto = [];
    if (primerNombre) nombreCompleto.push(primerNombre);
    if (segundoNombre) nombreCompleto.push(segundoNombre);
    if (primerApellido) nombreCompleto.push(primerApellido);
    if (segundoApellido) nombreCompleto.push(segundoApellido);
    
    const nombreDisplay = nombreCompleto.join(' ');
    
    // Construir HTML
    return `
      <div class="doc-page doc-letter">
        <div class="doc-wrap">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin-bottom: 10px;">${model.templates.informe.title}</h1>
            <div style="color: #666;">${model.templates.informe.subtitle}</div>
          </div>
          
          <div style="font-weight: 600; margin-bottom: 10px;">
            Nombre: ${nombreDisplay || '—'} · 
            ID: ${$("#documento_numero")?.value || '—'} · 
            Sexo: ${$("#genero")?.value || '—'} · 
            Edad: ${$("#edad_auto")?.value || '—'} años
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong>Fecha:</strong> ${fmtDateTime(date)}
          </div>
          
          ${ea ? `<div style="margin-bottom: 20px;"><strong>Enfermedad Actual:</strong> ${ea}</div>` : ''}
          
          ${motivo ? `<div style="margin-bottom: 20px;"><strong>Motivo de Consulta:</strong> ${motivo}</div>` : ''}
          
          ${antecedentesPersonales ? `<div style="margin-bottom: 20px;"><strong>Antecedentes Personales:</strong> ${antecedentesPersonales}</div>` : ''}
          
          ${antecedentesFamiliares ? `<div style="margin-bottom: 20px;"><strong>Antecedentes Familiares:</strong> ${antecedentesFamiliares}</div>` : ''}
          
          ${(examCara || examOidoDerecho || examOidoIzquierdo || examNariz || examOrofaringe || examCuello) ? 
            `<div style="margin-bottom: 20px;"><strong>Examen Físico:</strong><br>
            ${examCara ? `Cara: ${examCara}<br>` : ''}
            ${examOidoDerecho ? `Oído Derecho: ${examOidoDerecho}<br>` : ''}
            ${examOidoIzquierdo ? `Oído Izquierdo: ${examOidoIzquierdo}<br>` : ''}
            ${examNariz ? `Nariz: ${examNariz}<br>` : ''}
            ${examOrofaringe ? `Orofaringe: ${examOrofaringe}<br>` : ''}
            ${examCuello ? `Cuello: ${examCuello}<br>` : ''}
            </div>` : ''}
          
          ${dx ? `<div style="margin-bottom: 20px;"><strong>Diagnóstico:</strong> ${dx}</div>` : ''}
          
          ${plan ? `<div style="margin-bottom: 20px;"><strong>Plan / Tratamiento:</strong><br>${plan.replace(/\n/g, '<br>')}</div>` : ''}
          
          <div style="margin-top: 80px; text-align: center;">
            <div style="border-top: 1px solid #000; width: 200px; margin: 40px auto 10px;"></div>
            <div>${model.templates.informe.footer.name}</div>
            <div style="font-size: 12px; color: #666;">${model.templates.informe.footer.title}</div>
          </div>
        </div>
      </div>
    `;
  }

  function buildRecipeHTML(card) {
    const model = state.currentModel;
    const cardId = card.id;
    
    // Datos del paciente
    const primerNombre = $("#primer_nombre")?.value || '';
    const segundoNombre = $("#segundo_nombre")?.value || '';
    const primerApellido = $("#primer_apellido")?.value || '';
    const segundoApellido = $("#segundo_apellido")?.value || '';
    
    const nombreCompleto = [];
    if (primerNombre) nombreCompleto.push(primerNombre);
    if (segundoNombre) nombreCompleto.push(segundoNombre);
    if (primerApellido) nombreCompleto.push(primerApellido);
    if (segundoApellido) nombreCompleto.push(segundoApellido);
    
    const name = nombreCompleto.join(' ') || '—';
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const date = fmtDate(dateISO);
    const recipe = card.querySelector(`#txt-recipe-${cardId}`)?.value || '';
    const indicaciones = card.querySelector(`#txt-indicaciones-${cardId}`)?.value || '';
    
    return `
      <div class="doc-page doc-letter land">
        <div class="doc-wrap">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin-bottom: 10px;">${model.templates.receta.title}</h1>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong>Paciente:</strong> ${name}<br>
            <strong>ID:</strong> ${doc}<br>
            <strong>Fecha:</strong> ${date}
          </div>
          
          <div style="display: flex; gap: 40px; margin-bottom: 40px;">
            <div style="flex: 1;">
              <h3 style="color: #3b82f6; margin-bottom: 15px;">MEDICAMENTOS</h3>
              <div style="white-space: pre-line;">${recipe}</div>
            </div>
            
            <div style="flex: 1;">
              <h3 style="color: #3b82f6; margin-bottom: 15px;">INDICACIONES</h3>
              <div style="white-space: pre-line;">${indicaciones}</div>
            </div>
          </div>
          
          <div style="margin-top: 60px; text-align: center;">
            <div style="border-top: 1px solid #000; width: 200px; margin: 40px auto 10px;"></div>
            <div>${model.templates.receta.footer.name}</div>
            <div style="font-size: 12px; color: #666;">${model.templates.receta.footer.title}</div>
            <div style="font-size: 11px; color: #666; margin-top: 5px;">${model.templates.receta.footer.contact}</div>
          </div>
        </div>
      </div>
    `;
  }

  function applyZoom() {
    const z = $("#zoomRange").value;
    $("#zoomVal").textContent = z + '%';
    const pv = $("#docPreview");
    if (pv) {
      pv.style.transform = 'scale(' + (z / 100) + ')';
      pv.style.transformOrigin = 'top center';
    }
  }

  function enablePreviewEditing() {
    const preview = $("#docPreview");
    if (!preview) return;
    
    // Hacer todos los elementos de texto editables
    preview.querySelectorAll('div[style*="white-space"], textarea, input').forEach(el => {
      if (el.tagName === 'DIV' && el.style.whiteSpace === 'pre-line') {
        const textarea = document.createElement('textarea');
        textarea.className = 'form-input editable-preview';
        textarea.style.width = '100%';
        textarea.style.minHeight = '100px';
        textarea.value = el.textContent;
        textarea.oninput = function() {
          el.textContent = this.value;
        };
        el.parentNode.replaceChild(textarea, el);
      }
    });
    
    $("#btnEditPreview").innerHTML = '<i class="bi bi-eye"></i> Ver Preview';
    state.editPreviewMode = true;
  }

  function disablePreviewEditing() {
    const preview = $("#docPreview");
    if (!preview) return;
    
    // Revertir textareas a divs
    preview.querySelectorAll('textarea.editable-preview').forEach(textarea => {
      const div = document.createElement('div');
      div.style.whiteSpace = 'pre-line';
      div.textContent = textarea.value;
      textarea.parentNode.replaceChild(div, textarea);
    });
    
    $("#btnEditPreview").innerHTML = '<i class="bi bi-pencil-square"></i> Editar Preview';
    state.editPreviewMode = false;
  }

  function togglePreviewEdit() {
    if (!state.currentPreviewCard || !state.currentPreviewDoc) return;
    
    if (state.editPreviewMode) {
      disablePreviewEditing();
      flash('Modo vista activado');
    } else {
      enablePreviewEditing();
      flash('Modo edición activado - los cambios se reflejarán en el documento');
    }
  }

  // =========== ALMACENAMIENTO LOCAL ===========
  function saveToLocal() {
    try {
      let pacientes = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
      
      const pacienteKey = $("#uuid")?.value || $("#documento_numero")?.value;
      if (!pacienteKey) {
        showErr('No se puede guardar sin UUID o número de documento');
        return false;
      }
      
      // Serializar estado actual
      const data = serializeCurrentState();
      
      pacientes[pacienteKey] = {
        ...data,
        model: state.currentModel.name,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(pacientes));
      flash('Historia guardada localmente');
      return true;
    } catch (err) {
      showErr('Error guardando: ' + err.message);
      return false;
    }
  }

  function serializeCurrentState() {
    // Implementar serialización del estado actual
    return {
      patient: {},
      visits: [],
      timestamp: new Date().toISOString()
    };
  }

  function searchPatientsLocal(field, value) {
    try {
      const pacientes = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
      const results = [];
      
      for (const [key, data] of Object.entries(pacientes)) {
        const patient = data.patient;
        
        let match = false;
        if (field ===