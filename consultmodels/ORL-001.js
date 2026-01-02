// [CONTRATO UNIVERSAL] CONEXIÓN CON INDEX.JS
// Este bloque usa nombres genéricos (MODEL_UI, MODEL_DATA) para permitir intercambiabilidad.

export const MODEL_DEFINITION = {
    id: "ORL-001", 
    name: "Consulta Modelo Universal (ORL)",
    
    // [REESTRUCTURACIÓN FINAL PRO] INICIALIZACIÓN UI
    initUI: function(container, data = {}) {
        // [FIX CRÍTICO] INYECTAR ESTRUCTURA HTML (ORDEN LÓGICO + 100% WIDTH + ESTUDIOS)
        container.innerHTML = `
            <div style="margin-bottom:20px; color:var(--text-dim); font-weight:600; font-size:0.9rem;">
                * Campos obligatorios marcados con (*)
            </div>

            <!-- SECCIÓN 1: MOTIVO Y EA -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Motivo de Consulta (*)</label>
                    <input type="text" class="txt-motivo" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Ej: Dolor de garganta...">
                    <div class="chips-container chips-motivo" style="margin-top:10px;"></div>
                </div>
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Enfermedad Actual (*)</label>
                    <textarea class="txt-ea" rows="5" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Describa el padecimiento actual..."></textarea>
                </div>
                 <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Antecedentes Personales</label>
                    <input type="text" class="txt-ap" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Ej: Asma...">
                    <div class="chips-container chips-ap" style="margin-top:10px;"></div>
                </div>
                 <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Antecedentes Familiares</label>
                    <input type="text" class="txt-af" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Ej: Hipertensión...">
                    <div class="chips-container chips-af" style="margin-top:10px;"></div>
                </div>
            </div>

            <!-- SECCIÓN 2: EXAMEN FÍSICO (SIEMPRE VISIBLE + TEXTO) -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-stethoscope"></i> Examen Físico ORL
                </div>
                <div class="pe-panels">
                    <!-- LÓGICA DE CHIPS SE INYECTA AQUÍ POR MODEL_UI.init(container) -->
                    <!-- [FIX TEXTBOX PE] TEXTO PARA NOTAS DE EXAMEN -->
                    <div style="margin-top:15px;">
                        <label style="font-weight:600; color:var(--accent-blue); display:block; margin-bottom:5px;">Notas de Examen Físico</label>
                        <textarea id="txt-pe-notas" rows="4" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Hallazgos positivos o negativos..."></textarea>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 3: ESTUDIOS EN CONSULTA -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                 <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-x-ray"></i> Estudios Solicitados / Realizados
                </div>
                 <div class="input-group" style="width:100%;">
                    <textarea id="txt-estudios" rows="4" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Detalles de estudios (Ej: Nasofibrolaringoscopia, Audiometría)..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 4: DIAGNÓSTICO -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Diagnóstico (*)</label>
                    <input type="text" class="txt-dx" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Diagnóstico presuntivo...">
                    <div class="chips-container chips-dx" style="margin-top:10px;"></div>
                </div>
            </div>

            <!-- SECCIÓN 5: PLAN Y TRATAMIENTO -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Plan y Tratamiento (*)</label>
                    <textarea class="txt-plan" rows="6" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Plan de manejo, indicaciones generales..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 6: RECETA E INDICACIONES (DINÁMICAS) -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-prescription-bottle-alt"></i> Recipe e Indicaciones Detalladas
                </div>
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--text-dim);">Recipe</label>
                    <textarea class="txt-recipe" rows="6" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Medicamentos y dosis..."></textarea>
                    <div class="recipe-chips-container" style="margin-top:10px;"></div>
                </div>
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--text-dim);">Indicaciones (Auto-generadas)</label>
                    <div class="indicaciones-dropdowns" style="margin-bottom:10px;"></div>
                    <textarea class="txt-indicaciones" rows="6" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Dosis específicas..."></textarea>
                </div>
            </div>
        `;

        // 1. Ahora SÍ ejecutamos la lógica genérica con nombres genéricos
        MODEL_UI.init(container);

        // 2. Si hay datos (Edición), llenamos los campos manualmente
        if (data && Object.keys(data).length > 0) {
            const setVal = (sel, val) => {
                const el = container.querySelector(sel);
                if(el) el.value = val || '';
            };
            setVal('.txt-ea', data.ea);
            setVal('.txt-motivo', data.motivo);
            setVal('.txt-ap', data.ap);
            setVal('.txt-af', data.af);
            setVal('.txt-dx', data.dx);
            setVal('#txt-estudios', data.estudios);
            setVal('#txt-pe-notas', data.pe_notas);
            setVal('.txt-plan', data.plan);
            setVal('.txt-recipe', data.recipe);
            setVal('.txt-indicaciones', data.indicaciones);
        }
    },
    
    // 2. Obtener Datos: Extrae la info del DOM
    getData: function(container) {
        const getVal = (sel) => container.querySelector(sel)?.value || '';
        
        return {
            ea: getVal('.txt-ea'),
            motivo: getVal('.txt-motivo'),
            ap: getVal('.txt-ap'), 
            af: getVal('.txt-af'), 
            dx: getVal('.txt-dx'),
            estudios: getVal('#txt-estudios'),
            pe_notas: getVal('#txt-pe-notas'), // NUEVO
            plan: getVal('.txt-plan'),
            recipe: getVal('.txt-recipe'),
            indicaciones: getVal('.txt-indicaciones')
        };
    },
    
    // 3. Validar: Chequeos básicos
    validate: function(data) {
        if (!data.motivo && !data.ea) {
            return "Debe ingresar al menos un Motivo o Enfermedad Actual.";
        }
        if (!data.dx) {
            return "Debe ingresar un Diagnóstico.";
        }
        if (!data.plan) {
            return "Debe ingresar un Plan y Tratamiento.";
        }
        return null; 
    },
    
    // 4. Resumen: Texto corto para la lista principal
    getSummary: function(data) {
        return data.motivo || data.dx || "Consulta Modelo";
    }
};

export const MODEL_MODULE = {
    DATA: MODEL_DATA,
    UI: MODEL_UI,
    DOCS: MODEL_DOCS
};
