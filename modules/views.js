/* modules/views.js - Renderizador corregido */
import { PATIENT_FIELD_CONFIG } from './field-config.js';

const Views = {
    renderPatientForm: (container, data = {}, onSubmit) => {
        container.innerHTML = '';
        
        const form = document.createElement('form');
        form.id = 'patientForm';
        form.className = 'patient-form';
        
        // Renderizar todas las secciones
        Object.entries(PATIENT_FIELD_CONFIG).forEach(([sectionKey, sectionConfig]) => {
            const section = document.createElement('div');
            section.className = 'form-section';
            
            const title = document.createElement('h4');
            title.textContent = sectionConfig.label;
            title.style.color = '#3b82f6';
            title.style.marginBottom = '15px';
            section.appendChild(title);
            
            if (sectionConfig.type === 'checkbox_list') {
                this.renderCheckboxList(section, sectionKey, sectionConfig, data);
            } else if (sectionConfig.type === 'group_check_detail') {
                this.renderGroupCheckDetail(section, sectionKey, sectionConfig, data);
            } else {
                this.renderStandardFields(section, sectionKey, sectionConfig, data);
            }
            
            form.appendChild(section);
        });
        
        // Botón de submit
        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.textContent = 'Guardar Paciente';
        submitBtn.className = 'action-btn';
        submitBtn.style.marginTop = '20px';
        submitBtn.style.width = '100%';
        submitBtn.onclick = () => {
            const formData = this.extractFormData(form);
            onSubmit(formData);
        };
        
        form.appendChild(submitBtn);
        container.appendChild(form);
    },
    
    renderStandardFields: (container, sectionKey, config, data) => {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        grid.style.gap = '15px';
        grid.style.marginBottom = '20px';
        
        config.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-field';
            
            const fieldId = `${sectionKey}_${field.key}`;
            
            const label = document.createElement('label');
            label.textContent = field.label;
            label.htmlFor = fieldId;
            label.style.display = 'block';
            label.style.marginBottom = '5px';
            label.style.fontSize = '0.9rem';
            label.style.color = 'var(--color-text-dim)';
            
            let input;
            const currentValue = this.getNestedValue(data, `${sectionKey}.${field.key}`);
            
            if (field.type === 'select') {
                input = document.createElement('select');
                input.innerHTML = '<option value="">Seleccione...</option>' +
                    field.options.map(opt => 
                        `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt}</option>`
                    ).join('');
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
                input.value = currentValue || '';
            } else if (field.type === 'checkbox') {
                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '10px';
                
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = currentValue || false;
                
                label.style.marginBottom = '0';
                
                wrapper.appendChild(input);
                wrapper.appendChild(label);
                fieldDiv.appendChild(wrapper);
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
                input.value = currentValue || '';
                if (field.placeholder) input.placeholder = field.placeholder;
                if (field.step) input.step = field.step;
            }
            
            if (field.type !== 'checkbox') {
                input.id = fieldId;
                input.name = `${sectionKey}.${field.key}`;
                input.className = 'form-input';
                input.style.width = '100%';
                input.style.padding = '8px 12px';
                input.style.background = 'rgba(255,255,255,0.05)';
                input.style.border = '1px solid rgba(255,255,255,0.1)';
                input.style.borderRadius = '6px';
                input.style.color = 'var(--color-text)';
                
                fieldDiv.appendChild(label);
                fieldDiv.appendChild(input);
            }
            
            if (field.full) {
                fieldDiv.style.gridColumn = '1 / -1';
            }
            
            grid.appendChild(fieldDiv);
        });
        
        container.appendChild(grid);
    },
    
    renderCheckboxList: (container, sectionKey, config, data) => {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        grid.style.gap = '10px';
        grid.style.marginBottom = '20px';
        
        config.items.forEach(item => {
            const fieldDiv = document.createElement('div');
            fieldDiv.style.display = 'flex';
            fieldDiv.style.alignItems = 'center';
            fieldDiv.style.gap = '8px';
            
            const fieldId = `${sectionKey}_${item.key}`;
            const currentValue = this.getNestedValue(data, `${sectionKey}.${item.key}`);
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = fieldId;
            input.name = `${sectionKey}.${item.key}`;
            input.checked = currentValue || false;
            
            const label = document.createElement('label');
            label.htmlFor = fieldId;
            label.textContent = item.label;
            label.style.fontSize = '0.9rem';
            label.style.color = 'var(--color-text)';
            
            fieldDiv.appendChild(input);
            fieldDiv.appendChild(label);
            grid.appendChild(fieldDiv);
        });
        
        container.appendChild(grid);
        
        if (config.extra_field) {
            const extraDiv = document.createElement('div');
            extraDiv.style.marginTop = '10px';
            extraDiv.style.gridColumn = '1 / -1';
            
            const label = document.createElement('label');
            label.textContent = 'Otros / Detalles';
            label.style.display = 'block';
            label.style.marginBottom = '5px';
            label.style.fontSize = '0.9rem';
            label.style.color = 'var(--color-text-dim)';
            
            const textarea = document.createElement('textarea');
            textarea.name = `${sectionKey}.${config.extra_field}`;
            textarea.rows = 2;
            textarea.value = this.getNestedValue(data, `${sectionKey}.${config.extra_field}`) || '';
            textarea.style.width = '100%';
            textarea.style.padding = '8px 12px';
            textarea.style.background = 'rgba(255,255,255,0.05)';
            textarea.style.border = '1px solid rgba(255,255,255,0.1)';
            textarea.style.borderRadius = '6px';
            textarea.style.color = 'var(--color-text)';
            
            extraDiv.appendChild(label);
            extraDiv.appendChild(textarea);
            container.appendChild(extraDiv);
        }
    },
    
    renderGroupCheckDetail: (container, sectionKey, config, data) => {
        config.items.forEach(item => {
            const group = document.createElement('div');
            group.style.marginBottom = '15px';
            group.style.padding = '15px';
            group.style.background = 'rgba(255,255,255,0.03)';
            group.style.borderRadius = '8px';
            group.style.border = '1px solid rgba(255,255,255,0.1)';
            
            const checkDiv = document.createElement('div');
            checkDiv.style.display = 'flex';
            checkDiv.style.alignItems = 'center';
            checkDiv.style.gap = '10px';
            checkDiv.style.marginBottom = '8px';
            
            const checkFieldId = `${sectionKey}_${item.key}_check`;
            const checkValue = this.getNestedValue(data, `${sectionKey}.${item.key}_check`);
            
            const checkInput = document.createElement('input');
            checkInput.type = 'checkbox';
            checkInput.id = checkFieldId;
            checkInput.name = `${sectionKey}.${item.key}_check`;
            checkInput.checked = checkValue || false;
            
            const checkLabel = document.createElement('label');
            checkLabel.htmlFor = checkFieldId;
            checkLabel.textContent = item.label;
            checkLabel.style.fontWeight = '600';
            checkLabel.style.color = 'var(--color-text)';
            
            checkDiv.appendChild(checkInput);
            checkDiv.appendChild(checkLabel);
            group.appendChild(checkDiv);
            
            const detailFieldId = `${sectionKey}_${item.key}_detalle`;
            const detailValue = this.getNestedValue(data, `${sectionKey}.${item.key}_detalle`);
            
            const detailInput = document.createElement('input');
            detailInput.type = 'text';
            detailInput.id = detailFieldId;
            detailInput.name = `${sectionKey}.${item.key}_detalle`;
            detailInput.value = detailValue || '';
            detailInput.placeholder = 'Especifique...';
            detailInput.style.width = '100%';
            detailInput.style.padding = '8px 12px';
            detailInput.style.background = 'rgba(255,255,255,0.05)';
            detailInput.style.border = '1px solid rgba(255,255,255,0.1)';
            detailInput.style.borderRadius = '6px';
            detailInput.style.color = 'var(--color-text)';
            
            group.appendChild(detailInput);
            container.appendChild(group);
        });
    },
    
    getNestedValue: (obj, path) => {
        if (!obj) return '';
        return path.split('.').reduce((o, k) => (o || {})[k], obj) || '';
    },
    
    extractFormData: (form) => {
        const data = {};
        const formData = new FormData(form);
        
        formData.forEach((value, key) => {
            const parts = key.split('.');
            let target = data;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!target[parts[i]]) target[parts[i]] = {};
                target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = value;
        });
        
        // También procesar checkboxes que no están en FormData
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const parts = checkbox.name.split('.');
            let target = data;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!target[parts[i]]) target[parts[i]] = {};
                target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = checkbox.checked;
        });
        
        return data;
    }
};

export default Views;
