/**
 * Perfil del Paciente para el modelo de consulta ORL-001
 * Define la estructura completa de la ficha del paciente
 */

window.ORL001_PATIENT_PROFILE = {
  // Secciones de la ficha del paciente
  sections: [
    {
      id: 'identification',
      title: 'A. Identificación',
      fields: [
        {
          id: 'uuid',
          type: 'text',
          label: 'UUID (Automático)',
          readonly: true,
          className: 'calculated-field',
          placeholder: 'Generando...'
        },
        {
          id: 'internal_id',
          type: 'text',
          label: 'ID Interno Sistema',
          readonly: true,
          className: 'calculated-field',
          placeholder: 'p0000001u001'
        },
        {
          id: 'documento_tipo',
          type: 'select',
          label: 'Tipo de Documento *',
          required: true,
          options: [
            { value: '', label: 'Seleccionar' },
            { value: 'C.I.', label: 'Cédula de Identidad' },
            { value: 'Pasaporte', label: 'Pasaporte' },
            { value: 'RIF', label: 'RIF' },
            { value: 'Licencia', label: 'Licencia de Conducir' },
            { value: 'Otro', label: 'Otro' }
          ],
          onchange: 'updatePatientHeader'
        },
        {
          id: 'documento_numero',
          type: 'text',
          label: 'Número de Documento *',
          required: true,
          placeholder: 'Ej: V-12345678',
          onchange: 'updatePatientHeader'
        }
      ]
    },
    {
      id: 'names',
      title: 'B. Nombres',
      fields: [
        {
          id: 'primer_nombre',
          type: 'text',
          label: 'Primer Nombre *',
          required: true,
          placeholder: 'Ej: María',
          onchange: 'updatePatientHeader'
        },
        {
          id: 'segundo_nombre',
          type: 'text',
          label: 'Segundo Nombre',
          placeholder: 'Ej: José',
          onchange: 'updatePatientHeader'
        },
        {
          id: 'primer_apellido',
          type: 'text',
          label: 'Primer Apellido *',
          required: true,
          placeholder: 'Ej: González',
          onchange: 'updatePatientHeader'
        },
        {
          id: 'segundo_apellido',
          type: 'text',
          label: 'Segundo Apellido',
          placeholder: 'Ej: Pérez',
          onchange: 'updatePatientHeader'
        }
      ]
    },
    {
      id: 'demographics',
      title: 'C. Demografía',
      fields: [
        {
          id: 'fecha_nacimiento',
          type: 'date',
          label: 'Fecha de Nacimiento *',
          required: true,
          onchange: 'calcularCampos'
        },
        {
          id: 'edad_auto',
          type: 'text',
          label: 'Edad (Calculada)',
          readonly: true,
          className: 'calculated-field'
        },
        {
          id: 'genero',
          type: 'select',
          label: 'Género Biológico',
          options: [
            { value: '', label: 'Seleccionar' },
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Femenino', label: 'Femenino' },
            { value: 'Intersexual', label: 'Intersexual' }
          ],
          onchange: 'updatePatientHeader'
        },
        {
          id: 'identidad_genero',
          type: 'select',
          label: 'Identidad de Género',
          options: [
            { value: '', label: 'Seleccionar' },
            { value: 'Cisgénero', label: 'Cisgénero' },
            { value: 'Transgénero', label: 'Transgénero' },
            { value: 'No binario', label: 'No binario' },
            { value: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
            { value: 'Otro', label: 'Otro' }
          ]
        },
        {
          id: 'estado_civil',
          type: 'select',
          label: 'Estado Civil',
          options: [
            { value: '', label: 'Seleccionar' },
            { value: 'Soltero', label: 'Soltero' },
            { value: 'Casado', label: 'Casado' },
            { value: 'Divorciado', label: 'Divorciado' },
            { value: 'Viudo', label: 'Viudo' },
            { value: 'Unión Libre', label: 'Unión Libre' }
          ]
        }
      ]
    },
    {
      id: 'biological_data',
      title: 'D. Datos Biológicos',
      fields: [
        {
          id: 'grupo_sanguineo',
          type: 'select',
          label: 'Grupo Sanguíneo',
          options: [
            { value: '', label: 'Seleccionar' },
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'O', label: 'O' },
            { value: 'AB', label: 'AB' }
          ]
        },
        {
          id: 'factor_rh',
          type: 'select',
          label: 'Factor RH',
          options: [
            { value: '', label: 'Seleccionar' },
            { value: '+', label: 'Positivo (+)' },
            { value: '-', label: 'Negativo (-)' }
          ]
        },
        {
          id: 'peso_kg',
          type: 'number',
          label: 'Peso (kg)',
          className: 'field-with-unit',
          placeholder: '0',
          step: '0.1',
          min: '0',
          onchange: 'calcularCampos',
          suffix: 'kg'
        },
        {
          id: 'talla_cm',
          type: 'number',
          label: 'Talla (cm)',
          className: 'field-with-unit',
          placeholder: '0',
          step: '0.1',
          min: '0',
          onchange: 'calcularCampos',
          suffix: 'cm'
        },
        {
          id: 'imc_auto',
          type: 'text',
          label: 'IMC (Calculado)',
          readonly: true,
          className: 'calculated-field'
        },
        {
          id: 'lateralidad',
          type: 'select',
          label: 'Lateralidad',
          options: [
            { value: '', label: 'Seleccionar' },
            { value: 'Diestro', label: 'Diestro' },
            { value: 'Zurdo', label: 'Zurdo' },
            { value: 'Ambidiestro', label: 'Ambidiestro' }
          ]
        }
      ]
    }
    // ... (secciones E a R se mantienen en la misma estructura)
  ],

  // Función para generar el HTML del formulario del paciente
  renderForm: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
      <div class="patient-header" onclick="window.CIMA.togglePatientDetails()">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <button type="button" class="patient-toggle-btn">
            <i class="bi bi-chevron-right"></i>
          </button>
          <span class="badge">PACIENTE</span>
          <div style="display: flex; flex-direction: column; gap: 2px; flex: 1;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span style="font-weight: 700; font-size: 16px; color: #60a5fa;" id="patient-header-name">Nuevo Paciente</span>
              <span style="background: rgba(96, 165, 250, 0.1); color: #93c5fd; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-family: monospace;" id="patient-internal-id">p0000001u001</span>
              <span style="background: rgba(96, 165, 250, 0.1); color: #93c5fd; padding: 2px 8px; border-radius: 6px; font-size: 11px;" id="patient-doc-info">C.I.: ---</span>
              <span style="background: rgba(96, 165, 250, 0.1); color: #93c5fd; padding: 2px 8px; border-radius: 6px; font-size: 11px;" id="patient-age-display">-- años</span>
            </div>
            <div class="patient-alerts" id="patient-alerts-container"></div>
            <div style="display: flex; gap: 16px; font-size: 10px; color: #94a3b8;">
              <span id="patient-meta-created">Creado: --/--/---- --:-- por u-001</span>
              <span id="patient-meta-modified">Modificado: --/--/---- --:-- por u-001</span>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-ghost btn-small" onclick="event.stopPropagation(); window.CIMA.editPatientDetails()" style="font-size: 12px;">
          <i class="bi bi-pencil"></i> Editar
        </button>
      </div>
      
      <div class="patient-details hidden">
    `;

    // Generar cada sección
    this.sections.forEach(section => {
      html += `
        <div class="form-section">
          <div class="form-section-title">${section.title}</div>
          <div class="form-grid">
      `;

      section.fields.forEach(field => {
        html += `<div${field.className === 'field-with-unit' ? ' class="field-with-unit"' : ''}>`;
        html += `<label class="form-label">${field.label}</label>`;
        
        switch(field.type) {
          case 'select':
            html += `<select id="${field.id}" class="${field.className || 'form-select'}"`;
            if (field.onchange) html += ` onchange="window.CIMA.${field.onchange}()"`;
            if (field.required) html += ' required';
            html += '>';
            field.options.forEach(option => {
              html += `<option value="${option.value}">${option.label}</option>`;
            });
            html += '</select>';
            break;
            
          case 'textarea':
            html += `<textarea id="${field.id}" class="${field.className || 'form-input'}" rows="${field.rows || 2}"`;
            if (field.placeholder) html += ` placeholder="${field.placeholder}"`;
            if (field.onchange) html += ` onchange="window.CIMA.${field.onchange}()"`;
            if (field.required) html += ' required';
            html += '></textarea>';
            break;
            
          default:
            html += `<input type="${field.type}" id="${field.id}" class="${field.className || 'form-input'}"`;
            if (field.placeholder) html += ` placeholder="${field.placeholder}"`;
            if (field.onchange) html += ` onchange="window.CIMA.${field.onchange}()"`;
            if (field.readonly) html += ' readonly';
            if (field.required) html += ' required';
            if (field.step) html += ` step="${field.step}"`;
            if (field.min) html += ` min="${field.min}"`;
            html += '>';
            if (field.suffix) {
              html += `<span class="unit-label">${field.suffix}</span>`;
            }
        }
        
        html += '</div>';
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `
        <div class="section-divider"></div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="btn btn-primary" onclick="window.CIMA.guardarPaciente()">
            <i class="bi bi-save"></i> Guardar Cambios
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
};