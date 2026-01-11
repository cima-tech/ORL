/* consultmodels/MEDGEN-001.js - Modelo de Medicina General */

export const MODEL_DEFINITION = {
    id: "MEDGEN-001",
    name: "Medicina General",
    
    initUI: function(container, data = {}) {
        container.innerHTML = `
            <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
                <div class="input-group" style="width: 100%;">
                    <label>Motivo de Consulta</label>
                    <input type="text" class="txt-motivo" 
                           value="${data.motivo || ''}"
                           placeholder="Ej: Fiebre, dolor de cabeza...">
                </div>
                
                <div class="input-group" style="width: 100%; margin-top: 20px;">
                    <label>Enfermedad Actual</label>
                    <textarea class="txt-ea" rows="4">${data.ea || ''}</textarea>
                </div>
            </div>
            
            <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
                <h3>Examen Físico</h3>
                <div class="input-row">
                    <div class="input-group">
                        <label>Temperatura (°C)</label>
                        <input type="number" step="0.1" class="txt-temp" 
                               value="${data.temp || ''}">
                    </div>
                    <div class="input-group">
                        <label>Presión Arterial</label>
                        <input type="text" class="txt-pa" 
                               value="${data.pa || ''}" 
                               placeholder="120/80">
                    </div>
                    <div class="input-group">
                        <label>Frecuencia Cardíaca</label>
                        <input type="number" class="txt-fc" 
                               value="${data.fc || ''}">
                    </div>
                </div>
                
                <div class="input-group" style="width: 100%; margin-top: 20px;">
                    <label>Examen Físico Detallado</label>
                    <textarea class="txt-examen" rows="4">${data.examen || ''}</textarea>
                </div>
            </div>
            
            <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
                <div class="input-group" style="width: 100%;">
                    <label>Diagnóstico</label>
                    <input type="text" class="txt-dx" 
                           value="${data.dx || ''}"
                           placeholder="Diagnóstico principal...">
                </div>
                
                <div class="input-group" style="width: 100%; margin-top: 20px;">
                    <label>Plan y Tratamiento</label>
                    <textarea class="txt-plan" rows="4">${data.plan || ''}</textarea>
                </div>
            </div>
            
            <div class="glass-panel" style="padding: 20px;">
                <label>
                    <input type="checkbox" class="chk-inherit" 
                           ${data.inheritPrevious ? 'checked' : ''}>
                    Heredar datos de la consulta anterior
                </label>
            </div>
        `;
    },
    
    getData: function(container) {
        return {
            motivo: container.querySelector('.txt-motivo')?.value || '',
            ea: container.querySelector('.txt-ea')?.value || '',
            temp: container.querySelector('.txt-temp')?.value || '',
            pa: container.querySelector('.txt-pa')?.value || '',
            fc: container.querySelector('.txt-fc')?.value || '',
            examen: container.querySelector('.txt-examen')?.value || '',
            dx: container.querySelector('.txt-dx')?.value || '',
            plan: container.querySelector('.txt-plan')?.value || '',
            inheritPrevious: container.querySelector('.chk-inherit')?.checked || false
        };
    },
    
    validate: function(data) {
        if (!data.motivo) return "Debe ingresar un motivo de consulta";
        if (!data.dx) return "Debe ingresar un diagnóstico";
        return null;
    },
    
    getSummary: function(data) {
        return `${data.motivo} - ${data.dx}`.substring(0, 50);
    }
};
