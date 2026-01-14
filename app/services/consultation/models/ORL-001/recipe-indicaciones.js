import { $, STATE, fmtDate } from '../../../../logic/brain.js';
import { CIMA_DATA } from './data.js';

// --- GENERADOR HTML DEL RÉCIPE (LANDSCAPE) ---
export function buildRecipeHTML(card) {
    // Datos del Paciente
    const pNombre = [
        $("#primer_nombre")?.value, $("#segundo_nombre")?.value,
        $("#primer_apellido")?.value, $("#segundo_apellido")?.value
    ].filter(Boolean).join(' ');
    
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const date = fmtDate(dateISO);
    
    // Contenido Médico
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    // Datos del Médico
    const dr = STATE.currentUser?.profile || {};

    // Estructura HTML (Usando clase .land para orientación horizontal)
    return `
        <div class="doc-page doc-letter land">
        <div class="doc-wrap">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3b82f6;">
                <h1 style="color: #3b82f6; margin-bottom: 5px; font-size: 22px;">RÉCIPE MÉDICO</h1>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 1.1em; background: #f8fafc; padding: 10px; border-radius: 8px;">
                <div><strong>Paciente:</strong> ${pNombre}</div>
                <div><strong>ID:</strong> ${doc}</div>
                <div><strong>Fecha:</strong> ${date}</div>
            </div>
            
            <div style="display: flex; gap: 40px; min-height: 400px;">
                <div style="flex: 1; border-right: 1px dashed #94a3b8; padding-right: 20px;">
                    <h3 style="color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom:5px; margin-top: 0;">Rp. (Medicamentos)</h3>
                    <div style="white-space: pre-line; font-family: 'Courier New', monospace; font-size: 1.1em; line-height: 1.6;">${recipe}</div>
                </div>
                
                <div style="flex: 1; padding-left: 10px;">
                    <h3 style="color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom:5px; margin-top: 0;">Indicaciones</h3>
                    <div style="white-space: pre-line; font-size: 0.95em; line-height: 1.5;">${indicaciones}</div>
                </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center; page-break-inside: avoid;">
                <div style="border-top: 1px solid #000; width: 250px; margin: 40px auto 10px;"></div>
                <div style="font-weight:bold;">${dr.name || ''}</div>
                <div style="font-size: 12px; color: #666;">${dr.title_line_1 || ''}</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">${(dr.phones || []).join(' / ')}</div>
            </div>
        </div>
        </div>
    `;
}

// --- LÓGICA REACTIVA DE MEDICAMENTOS ---

// Actualiza el textarea de "Recipe" cuando se seleccionan chips
export function updateRecipeTextbox(card) {
    // 1. Buscamos todos los chips con clase .on dentro de grupos de receta
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    const selectedMeds = Array.from(activeChips).map(c => c.textContent);
    
    const txtRecipe = card.querySelector('.txt-recipe');
    
    // IMPORTANTE: Solo sobrescribimos si el usuario NO ha editado manualmente.
    // Esto previene borrar dosis personalizadas o correcciones manuales.
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
        txtRecipe.value = selectedMeds.join('\n');
    }
}

// Actualiza el textarea de "Indicaciones" basado en los medicamentos seleccionados
export function updateIndicacionesSection(card) {
    // 1. Agrupar medicamentos seleccionados por su Categoría (ej: Antibióticos, Analgésicos)
    // Esto es necesario porque las indicaciones dependen de la categoría
    const selectedByGroup = {};
    
    card.querySelectorAll('.recipe-chips-group').forEach(groupContainer => {
        const groupName = groupContainer.dataset.group; // ej: "Antibióticos"
        const medsInGroup = [...groupContainer.querySelectorAll('.chip.on')].map(c => c.textContent);
        
        if (medsInGroup.length > 0) {
            selectedByGroup[groupName] = medsInGroup;
        }
    });

    // 2. Generar texto de indicaciones
    let indicacionesAuto = [];
    
    Object.entries(selectedByGroup).forEach(([groupName, meds]) => {
        // Buscamos las opciones de posología para este grupo en CIMA_DATA
        const options = CIMA_DATA.INDICACIONES_OPTIONS[groupName] || CIMA_DATA.INDICACIONES_OPTIONS["Otros"];
        
        // Estrategia por defecto: Tomar la primera opción disponible.
        // (En una versión futura, aquí podríamos inyectar un <select> en el DOM para elegir posología)
        const defaultOption = options.length > 0 ? options[0] : "Tomar según indicación médica.";
        
        meds.forEach(med => {
            indicacionesAuto.push(`• ${med}:\n  ${defaultOption}`);
        });
    });

    // 3. Inyectar en el textarea de Indicaciones
    const txtInd = card.querySelector('.txt-indicaciones');
    if (txtInd && !txtInd.dataset.userEdited) {
        txtInd.value = indicacionesAuto.join('\n\n');
        
        // Trigger en cascada: Al cambiar indicaciones, sugerimos actualizar el Plan
        updatePlanTratamiento(card, txtInd.value);
    }
}

// Actualiza el "Plan/Tratamiento" (que suele ser Indicaciones + Advertencia legal)
function updatePlanTratamiento(card, indicacionesText) {
    const txtPlan = card.querySelector('.txt-plan');
    if (!txtPlan || txtPlan.dataset.userEdited === '1') return;
    
    // Texto legal de seguridad
    const contacto = "\n\nNOTA DE SEGURIDAD:\nAvisar eventualidad si persisten síntomas a pesar del Tratamiento indicado o empeoramiento de síntomas a los teléfonos de contacto o acudir a la Emergencia.";
    
    txtPlan.value = indicacionesText + contacto;

}
