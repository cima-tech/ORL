// CORRECCIÓN: Imports limpios
import { $, STATE, fmtDate } from 'brain';
import { CIMA_DATA } from 'data';

// --- GENERADOR HTML DEL RÉCIPE ---
export function buildRecipeHTML(card) {
    const pNombre = [
        $("#primer_nombre")?.value, $("#segundo_nombre")?.value,
        $("#primer_apellido")?.value, $("#segundo_apellido")?.value
    ].filter(Boolean).join(' ');
    
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const date = fmtDate(dateISO);
    
    // Contenido
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    const dr = STATE.currentUser?.profile || {};

    return `
        <div class="doc-page doc-letter land">
        <div class="doc-wrap">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3b82f6;">
                <h1 style="color: #3b82f6; margin-bottom: 5px;">RÉCIPE MÉDICO</h1>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 1.1em;">
                <div><strong>Paciente:</strong> ${pNombre}</div>
                <div><strong>ID:</strong> ${doc}</div>
                <div><strong>Fecha:</strong> ${date}</div>
            </div>
            
            <div style="display: flex; gap: 40px; min-height: 400px;">
                <div style="flex: 1; border-right: 1px dashed #ccc; padding-right: 20px;">
                    <h3 style="color: #3b82f6; border-bottom: 1px solid #eee; padding-bottom:5px;">Rp. (Medicamentos)</h3>
                    <div style="white-space: pre-line; font-family: 'Courier New', monospace; font-size: 1.1em;">${recipe}</div>
                </div>
                
                <div style="flex: 1; padding-left: 10px;">
                    <h3 style="color: #3b82f6; border-bottom: 1px solid #eee; padding-bottom:5px;">Indicaciones</h3>
                    <div style="white-space: pre-line; font-size: 0.95em;">${indicaciones}</div>
                </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center; page-break-inside: avoid;">
                <div style="border-top: 1px solid #000; width: 250px; margin: 40px auto 10px;"></div>
                <div style="font-weight:bold;">${dr.name || ''}</div>
                <div style="font-size: 12px; color: #666;">${dr.specialty || ''} - ${dr.institution || ''}</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">${(dr.phones || []).join(' / ')}</div>
            </div>
        </div>
        </div>
    `;
}

// --- LÓGICA REACTIVA ---

export function updateRecipeTextbox(card) {
    // Busca todos los chips ACTIVOS dentro del contenedor de recipe de ESTA tarjeta
    const selected = [...card.querySelectorAll('.recipe-chips-container .chip.on')].map(c => c.textContent);
    const txtRecipe = card.querySelector('.txt-recipe');
    
    // Solo actualiza si el usuario NO ha editado manualmente el textbox para evitar borrar notas personalizadas
    // Usamos un atributo dataset 'userEdited' que se activa 'oninput' (ver data.js)
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
        txtRecipe.value = selected.join('\n');
    }
}

export function updateIndicacionesSection(card) {
    const dropdownsContainer = card.querySelector('.indicaciones-dropdowns'); // Contenedor oculto auxiliar si quisieras hacerlo visual
    // NOTA: En tu versión original generabas dropdowns dinámicos. Aquí replicamos esa lógica pura.
    
    // 1. Identificar medicamentos seleccionados por grupo
    const selectedByGroup = {};
    card.querySelectorAll('.recipe-chips-group').forEach(groupChips => {
        const groupName = groupChips.dataset.group; // ej: "Antibióticos"
        const selected = [...groupChips.querySelectorAll('.chip.on')].map(c => c.textContent);
        if (selected.length > 0) selectedByGroup[groupName] = selected;
    });

    // 2. Generar Texto de Indicaciones Automático
    let indicacionesAuto = [];
    
    Object.entries(selectedByGroup).forEach(([groupName, meds]) => {
        const options = CIMA_DATA.INDICACIONES_OPTIONS[groupName] || CIMA_DATA.INDICACIONES_OPTIONS["Otros"];
        // Por defecto tomamos la primera opción disponible para autocompletar
        const defaultOption = options[0] || "Tomar según indicación médica.";
        
        meds.forEach(med => {
            indicacionesAuto.push(`${med}:\n- ${defaultOption}`);
        });
    });

    // 3. Actualizar Textbox de Indicaciones
    const txtInd = card.querySelector('.txt-indicaciones');
    if (txtInd && !txtInd.dataset.userEdited) {
        txtInd.value = indicacionesAuto.join('\n\n');
        // También actualizamos el PLAN global, ya que suele ser copia de indicaciones + contacto
        updatePlanTratamiento(card, txtInd.value);
    }
}

function updatePlanTratamiento(card, indicacionesText) {
    const txtPlan = card.querySelector('.txt-plan');
    if (!txtPlan || txtPlan.dataset.userEdited === '1') return;
    
    // Texto legal/contacto por defecto
    const contacto = "\n\nAVISO: Si persisten los síntomas o presenta reacción desfavorable, suspenda tratamiento y notifique de inmediato a los números de contacto o acuda a Emergencia.";
    
    txtPlan.value = indicacionesText + contacto;
}
