/* modules/views.js - Renderizadores de UI */
import { PATIENT_FIELD_CONFIG } from './field-config.js';

const Views = {
    renderPatientForm: (container, data = {}, onSubmit) => {
        container.innerHTML = `
            <div class="form-container">
                <div class="form-header">
                    <h3><i class="fas fa-user-injured"></i> Registro Completo del Paciente</h3>
                    <p>Todos los campos son importantes para su historial médico</p>
                </div>
                <form id="patientRegistrationForm" class="patient-form">
                    <div class="form-sections" id="formSections"></div>
                    <div class="form-footer">
                        <button type="submit" class="submit-btn">
                            <i class="fas fa-check"></i> Enviar Registro
                        </button>
                        <button type="button" class="cancel-btn" onclick="CIMA.closeDrawer('patientRegisterDrawer')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        const sectionsContainer = document.getElementById('formSections');
        this.renderFormSections(sectionsContainer, data);
        
        const form = document.getElementById('patientRegistrationForm');
        if (form && onSubmit) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = this.extractFormData(formData);
                onSubmit(data);
            };
        }
    },
    
    renderFormSections: (container, data) => {
        Object.entries(PATIENT_FIELD_CONFIG).forEach(([sectionKey, sectionConfig]) => {
            const section = document.createElement('div');
            section.className = 'form-section glass-layer';
            
            const title = document.createElement('div');
            title.className = 'section-title';
            title.innerHTML = `<h4><i class="fas fa-folder"></i> ${sectionConfig.label}</h4>`;
            section.appendChild(title);
            
            const fields = document.createElement('div');
            fields.className = 'section-fields';
            
            if (sectionConfig.type === 'checkbox_list') {
                this.renderCheckboxList(fields, sectionKey, sectionConfig, data);
            } else if (sectionConfig.type === 'group_check_detail') {
                this.renderGroupCheckDetail(fields, sectionKey, sectionConfig, data);
            } else {
                this.renderStandardFields(fields, sectionKey, sectionConfig, data);
            }
            
            section.appendChild(fields);
            container.appendChild(section);
        });
    },
    
    renderStandardFields: (container, sectionKey, config, data) => {
        config.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = `form-field ${field.full ? 'full-width' : ''}`;
            
            const label = document.createElement('label');
            label.textContent = field.label;
            label.htmlFor = `${sectionKey}_${field.key}`;
            
            let input;
            if (field.type === 'select') {
                input = document.createElement('select');
                input.innerHTML = `<option value="">Seleccione...</option>` +
                    field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                input.value = this.getNestedValue(data, `${sectionKey}.${field.key}`) || '';
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
                input.value = this.getNestedValue(data, `${sectionKey}.${field.key}`) || '';
            } else if (field.type === 'checkbox') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = this.getNestedValue(data, `${sectionKey}.${field.key}`) || false;
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
                input.value = this.getNestedValue(data, `${sectionKey}.${field.key}`) || '';
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }
            
            input.id = `${sectionKey}_${field.key}`;
            input.name = `${sectionKey}.${field.key}`;
            input.className = 'form-input';
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            container.appendChild(fieldDiv);
        });
    },
    
    renderCheckboxList: (container, sectionKey, config, data) => {
        config.items.forEach(item => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'checkbox-field';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${sectionKey}_${item.key}`;
            input.name = `${sectionKey}.${item.key}`;
            input.checked = this.getNestedValue(data, `${sectionKey}.${item.key}`) || false;
            
            const label = document.createElement('label');
            label.htmlFor = `${sectionKey}_${item.key}`;
            label.textContent = item.label;
            
            fieldDiv.appendChild(input);
            fieldDiv.appendChild(label);
            container.appendChild(fieldDiv);
        });
        
        if (config.extra_field) {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-field full-width';
            
            const label = document.createElement('label');
            label.textContent = 'Otros / Detalles';
            label.htmlFor = `${sectionKey}_${config.extra_field}`;
            
            const input = document.createElement('textarea');
            input.id = `${sectionKey}_${config.extra_field}`;
            input.name = `${sectionKey}.${config.extra_field}`;
            input.rows = 2;
            input.value = this.getNestedValue(data, `${sectionKey}.${config.extra_field}`) || '';
            input.className = 'form-input';
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            container.appendChild(fieldDiv);
        }
    },
    
    renderGroupCheckDetail: (container, sectionKey, config, data) => {
        config.items.forEach(item => {
            const group = document.createElement('div');
            group.className = 'check-detail-group';
            
            const checkDiv = document.createElement('div');
            checkDiv.className = 'check-row';
            
            const checkInput = document.createElement('input');
            checkInput.type = 'checkbox';
            checkInput.id = `${sectionKey}_${item.key}_check`;
            checkInput.name = `${sectionKey}.${item.key}_check`;
            checkInput.checked = this.getNestedValue(data, `${sectionKey}.${item.key}_check`) || false;
            
            const checkLabel = document.createElement('label');
            checkLabel.htmlFor = `${sectionKey}_${item.key}_check`;
            checkLabel.textContent = item.label;
            checkLabel.style.fontWeight = 'bold';
            
            checkDiv.appendChild(checkInput);
            checkDiv.appendChild(checkLabel);
            group.appendChild(checkDiv);
            
            const detailInput = document.createElement('input');
            detailInput.type = 'text';
            detailInput.id = `${sectionKey}_${item.key}_detalle`;
            detailInput.name = `${sectionKey}.${item.key}_detalle`;
            detailInput.value = this.getNestedValue(data, `${sectionKey}.${item.key}_detalle`) || '';
            detailInput.placeholder = 'Especifique...';
            detailInput.className = 'form-input';
            detailInput.style.marginTop = '5px';
            
            group.appendChild(detailInput);
            container.appendChild(group);
        });
    },
    
    getNestedValue: (obj, path) => {
        return path.split('.').reduce((o, k) => (o || {})[k], obj);
    },
    
    extractFormData: (formData) => {
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            const parts = key.split('.');
            let target = data;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!target[parts[i]]) target[parts[i]] = {};
                target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = value;
        }
        
        return data;
    }
};

export default Views;
