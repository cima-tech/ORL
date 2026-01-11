/* consultmodels/MEDGEN-001.js */

export const MODEL_DEFINITION = {
    id: "MEDGEN-001",
    name: "Consulta de Medicina General",
    
    initUI: function(container, data = {}) {
        container.innerHTML = `
            <div style="margin-bottom:20px; color:var(--color-text-dim); font-weight:600; font-size:0.9rem;">
                * Campos obligatorios marcados con (*)
            </div>

            <div class="glass-panel" style="padding:25px; margin-bottom:25px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--color-accent); margin-bottom:10px; display:block;">Motivo de Consulta (*)</label>
                    <textarea class="txt-motivo" rows="3" style="width:100%;" placeholder="Describa el motivo de consulta...">${data.motivo || ''}</textarea>
                </div>
                
                <div class="input-group" style="width:100%; margin-top:20px;">
                    <label style="font-weight:600; color:var(--color-accent); margin-bottom:10px; display:block;">Enfermedad Actual (*)</label>
                    <textarea class="txt-ea" rows="5" style="width:100%;" placeholder="Historia de la enfermedad actual...">${data.ea || ''}</textarea>
                </div>
            </div>

            <div class="glass-panel" style="padding:25px; margin-bottom:25px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--color-accent); margin-bottom:10px; display:block;">Examen Físico</label>
                    <textarea class="txt-examen" rows="4" style="width:100%;" placeholder="Hallazgos del examen físico...">${data.examen || ''}</textarea>
                </div>
            </div>

            <div class="glass-panel" style="padding:25px; margin-bottom:25px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--color-accent); margin-bottom:10px; display:block;">Diagnóstico (*)</label>
                    <textarea class="txt-dx" rows="3" style="width:100%;" placeholder="Diagnóstico principal...">${data.dx || ''}</textarea>
                </div>
            </div>

            <div class="glass-panel" style="padding:25px; margin-bottom:25px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--color-accent); margin-bottom:10px; display:block;">Plan de Tratamiento (*)</label>
                    <textarea class="txt-plan" rows="6" style="width:100%;" placeholder="Tratamiento indicado...">${data.plan || ''}</textarea>
                </div>
            </div>

            <div class="glass-panel" style="padding:25px; margin-bottom:25px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--color-accent); margin-bottom:10px; display:block;">Recipe</label>
                    <textarea class="txt-recipe" rows="6" style="width:100%;" placeholder="Medicamentos recetados...">${data.recipe || ''}</textarea>
                </div>
            </div>
        `;

        // Aplicar estilos glass a los inputs
        const textareas = container.querySelectorAll('textarea');
        textareas.forEach(ta => {
            ta.style.cssText = "width:100%; background:var(--color-glass); border:1px solid var(--color-glass-border); color:var(--color-text); padding:12px; border-radius:8px; backdrop-filter:blur(10px); font-size:0.95rem;";
            ta.addEventListener('focus', function() {
                this.style.background = "var(--color-glass-heavy)";
                this.style.borderColor = "var(--color-accent)";
            });
            ta.addEventListener('blur', function() {
                this.style.background = "var(--color-glass)";
                this.style.borderColor = "var(--color-glass-border)";
            });
        });
    },
    
    getData: function(container) {
        const getVal = (sel) => container.querySelector(sel)?.value || '';
        
        return {
            motivo: getVal('.txt-motivo'),
            ea: getVal('.txt-ea'),
            examen: getVal('.txt-examen'),
            dx: getVal('.txt-dx'),
            plan: getVal('.txt-plan'),
            recipe: getVal('.txt-recipe')
        };
    },
    
    validate: function(data) {
        if (!data.motivo.trim()) {
            return "Debe ingresar un Motivo de Consulta.";
        }
        if (!data.ea.trim()) {
            return "Debe ingresar la Enfermedad Actual.";
        }
        if (!data.dx.trim()) {
            return "Debe ingresar un Diagnóstico.";
        }
        if (!data.plan.trim()) {
            return "Debe ingresar un Plan de Tratamiento.";
        }
        return null;
    },
    
    getSummary: function(data) {
        return data.motivo || data.dx || "Consulta Medicina General";
    }
};
