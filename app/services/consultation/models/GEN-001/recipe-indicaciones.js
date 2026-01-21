// app/services/consultation/models/GEN-001/recipe-indicaciones.js

// Imports limpios 
import { $, STATE, fmtDate } from 'brain';
// CORRECCIÓN: Eliminado import circular de CIMA_DATA

// ==========================================
// 1. LÓGICA DE UI (DROPDOWNS EN CONSULTA)
// ==========================================

export function renderIndicacionesDropdowns(card, dataOptions) {
    const container = card.querySelector('.indicaciones-dropdowns');
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar previos

    // Buscar chips activos en la sección de receta
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    
    if (activeChips.length === 0) {
        container.innerHTML = '<div style="color:#94a3b8; font-size:0.8em; padding:5px; font-style:italic;">Seleccione medicamentos arriba para ver opciones de dosis.</div>';
        return;
    }

    // Agrupar por categoría
    const medsByCategory = {};
    activeChips.forEach(chip => {
        // Buscamos el título del grupo (ej: Antibióticos)
        const groupDiv = chip.closest('.recipe-chips-group');
        const category = groupDiv ? groupDiv.dataset.group : 'Otros';
        
        if (!medsByCategory[category]) medsByCategory[category] = [];
        medsByCategory[category].push(chip.textContent);
    });

    // Generar Selectores (Usando dataOptions pasado como argumento)
    const optionsSource = dataOptions?.INDICACIONES_OPTIONS || {};

    Object.entries(medsByCategory).forEach(([category, meds]) => {
        const options = optionsSource[category] || optionsSource["Otros"] || ["Tomar según indicación médica."];
        
        meds.forEach(med => {
            const row = document.createElement('div');
            row.style.marginBottom = '8px';
            row.style.borderBottom = '1px dashed rgba(255,255,255,0.1)';
            row.style.paddingBottom = '5px';
            
            // Crear opciones del select
            let optionsHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            
            row.innerHTML = `
                <div style="font-weight:600; font-size:0.85em; color:#60a5fa; margin-bottom:2px;">${med}</div>
                <select class="form-select indication-select" data-med="${med}" style="width:100%; font-size:0.8em;">
                    ${optionsHTML}
                    <option value="custom">-- Escribir manual --</option>
                </select>
            `;
            container.appendChild(row);
            
            // Listener: Al cambiar la dosis, actualizar el texto grande
            row.querySelector('select').addEventListener('change', () => syncIndicacionesText(card));
        });
    });
    
    // Sincronización inicial
    syncIndicacionesText(card);
}

// Helper para construir el texto final desde los dropdowns
function syncIndicacionesText(card) {
    const selects = card.querySelectorAll('.indication-select');
    let text = "";
    
    selects.forEach(sel => {
        const med = sel.dataset.med;
        const indicacion = sel.value === 'custom' ? '...' : sel.value;
        text += `• ${med}:\n  ${indicacion}\n\n`;
    });
    
    const txtInd = card.querySelector('.txt-indicaciones');
    // Solo actualizamos si el usuario no ha editado manualmente el textarea grande
    if (txtInd && !txtInd.dataset.userEdited) {
        txtInd.value = text.trim();
        updatePlanTratamiento(card, txtInd.value);
    }
}

// ==========================================
// 2. GENERADOR DE HTML (PREVIEW DOCUMENTO)
// ==========================================

export function buildRecipeHTML(card) {
    // A. Datos del Paciente
    const pNombre = [
        $("#primer_nombre")?.value, $("#primer_apellido")?.value
    ].filter(Boolean).join(' ');
    
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const date = fmtDate(dateISO);
    
    // B. Contenido Médico
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    // C. Configuración Visual
    const assets = STATE.currentUser?.assets || {};
    const hasSign = STATE.USE_SIG; // Estado del toggle de firma en toolbar
    
    // Imágenes (Con tamaños controlados)
    const headerImg = assets.header_path ? `<img src="${assets.header_path}" style="width:100%; max-height:80px; object-fit:contain;">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}" style="width:100%; max-height:60px; object-fit:contain;">` : '';
    
    // D. Bloque de Firma
    // Intentar obtener datos del usuario, fallback a genérico si es necesario
    const drName = STATE.currentUser?.profile?.name || "Dr. Médico General";
    const drSpec = STATE.currentUser?.professional?.specialty || STATE.currentUser?.profile?.title_line_1 || "Medicina General";
    const drCode = (STATE.currentUser?.professional?.license_number) ? `MPPS: ${STATE.currentUser.professional.license_number}` : "";

    const firmaBlock = `
        <div style="height:120px; position:relative; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; margin-top:auto;">
            ${hasSign && assets.signature_path ? `<img src="${assets.signature_path}" style="position:absolute; bottom:40px; width:140px;">` : ''}
            ${hasSign && assets.stamp_path ? `<img src="${assets.stamp_path}" style="position:absolute; bottom:40px; right:40px; width:90px;">` : ''}
            
            <div style="text-align:center; font-size:0.75rem; color:#000; line-height:1.2;">
                <div style="font-weight:bold; font-size:0.9rem; border-top:1px solid #000; padding-top:4px; width:220px; margin:0 auto 2px auto;">
                    ${drName}
                </div>
                ${drSpec}<br>
                <span style="font-size:0.7rem;">${drCode}</span>
            </div>
        </div>
    `;

    // E. Estructura HTML (Grid de 2 Columnas)
    return `
        <div class="doc-page doc-letter land" style="padding:30px 40px; display:grid; grid-template-columns: 1fr 1fr; gap:50px;">
            
            <div style="display:flex; flex-direction:column; height:100%; border-right:1px dashed #cbd5e1; padding-right:25px;">
                <div style="text-align:center; margin-bottom:15px;">${headerImg}</div>
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #333; margin-bottom:15px; padding-bottom:5px;">
                    <div style="font-size:1.4rem; font-weight:bold; font-family:'Georgia', serif;">Rp.</div>
                    <div style="font-size:0.85rem;">${date}</div>
                </div>

                <div style="font-size:0.95rem; margin-bottom:20px;">
                    <b>Paciente:</b> ${pNombre} <br>
                    <b>ID:</b> ${doc}
                </div>

                <div contenteditable="true" style="flex:1; font-family:'Courier New', monospace; font-size:1.1rem; line-height:1.5; outline:none; white-space:pre-line;">
                    ${recipe}
                </div>

                ${firmaBlock}
                <div style="text-align:center; margin-top:10px;">${footerImg}</div>
            </div>

            <div style="display:flex; flex-direction:column; height:100%; padding-left:10px;">
                <div style="text-align:center; margin-bottom:15px;">${headerImg}</div>
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #333; margin-bottom:15px; padding-bottom:5px;">
                    <div style="font-size:1.4rem; font-weight:bold; font-family:'Georgia', serif;">Indicaciones</div>
                    <div style="font-size:0.85rem;">${date}</div>
                </div>

                <div style="font-size:0.95rem; margin-bottom:20px;">
                    <b>Paciente:</b> ${pNombre}
                </div>

                <div contenteditable="true" style="flex:1; font-family:'Segoe UI', sans-serif; font-size:1rem; line-height:1.4; outline:none; white-space:pre-line;">
                    ${indicaciones}
                </div>

                ${firmaBlock}
                <div style="text-align:center; margin-top:10px;">${footerImg}</div>
            </div>

        </div>
    `;
}

// ==========================================
// 3. LOGICA REACTIVA (COMPATIBILIDAD)
// ==========================================

export function updateRecipeTextbox(card) {
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    const selectedMeds = Array.from(activeChips).map(c => c.textContent);
    
    const txtRecipe = card.querySelector('.txt-recipe');
    
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
        txtRecipe.value = selectedMeds.join('\n');
    }
}

function updatePlanTratamiento(card, indicacionesText) {
    const txtPlan = card.querySelector('.txt-plan');
    // En medicina general el plan es un campo diferente, verificamos si existe
    // En GEN-001 se llama txt-plan
    if (!txtPlan || txtPlan.dataset.userEdited === '1') return;
    
    // Solo actualizamos si está vacío para no borrar notas de dieta/ejercicio
    if (txtPlan.value.trim() === "") {
        const contacto = "\n\nNOTA:\nEn caso de fiebre persistente (>38.5°C) por más de 48h, dificultad respiratoria o deterioro del estado general, acudir a emergencia.";
        txtPlan.value = "Tratamiento farmacológico según indicaciones adjuntas.\n" + contacto;
    }
}
