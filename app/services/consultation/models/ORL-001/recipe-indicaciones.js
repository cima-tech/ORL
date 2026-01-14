// CORRECCIÓN: Imports limpios usando el Mapa
import { $, STATE, fmtDate } from 'brain';
import { CIMA_DATA } from 'data';

// --- GENERADOR HTML DEL RÉCIPE ---
export function buildRecipeHTML(card) {
    // 1. Datos del Paciente
    const pNombre = [
        $("#primer_nombre")?.value, $("#segundo_nombre")?.value,
        $("#primer_apellido")?.value, $("#segundo_apellido")?.value
    ].filter(Boolean).join(' ');
    
    const doc = $("#documento_numero")?.value || '—';
    const dateISO = card.querySelector('.visit-date').value;
    const date = fmtDate(dateISO);
    
    // 2. Contenido Médico
    const recipe = (card.querySelector('.txt-recipe')?.value || '').trim();
    const indicaciones = (card.querySelector('.txt-indicaciones')?.value || '').trim();
    
    // 3. Datos del Médico y Configuración Visual (Desde JSON)
    const dr = STATE.currentUser?.profile || {};
    const assets = STATE.currentUser?.assets || {};

    // Generación de etiquetas IMG
    // Nota: Ajustamos max-height para que no se coman todo el espacio en el récipe
    const headerImg = assets.header_path ? `<img src="${assets.header_path}" style="width:100%; max-height:120px; object-fit:contain;">` : '';
    const footerImg = assets.footer_path ? `<img src="${assets.footer_path}" style="width:100%; max-height:80px; object-fit:contain;">` : '';
    
    // Firma y Sello
    const signImg = (STATE.USE_SIG && assets.signature_path) ? `<img src="${assets.signature_path}" style="width:140px;">` : '';
    const stampImg = (STATE.USE_SIG && assets.stamp_path) ? `<img src="${assets.stamp_path}" style="width:90px;">` : '';

    // 4. Estructura HTML
    return `
        <div class="doc-page doc-letter land">
            <div class="doc-header" style="text-align:center; margin-bottom:15px;">${headerImg}</div>

            <div class="doc-wrap">
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3b82f6;" contenteditable="true">
                    <h1 style="color: #3b82f6; margin-bottom: 5px; font-size: 22px;">RÉCIPE MÉDICO</h1>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 1.1em; background: #f8fafc; padding: 10px; border-radius: 8px;">
                    <div><strong>Paciente:</strong> ${pNombre}</div>
                    <div><strong>ID:</strong> ${doc}</div>
                    <div><strong>Fecha:</strong> ${date}</div>
                </div>
                
                <div style="display: flex; gap: 40px; min-height: 350px;">
                    
                    <div style="flex: 1; border-right: 1px dashed #94a3b8; padding-right: 20px;">
                        <h3 style="color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom:5px; margin-top: 0;">Rp. (Medicamentos)</h3>
                        <div contenteditable="true" style="white-space: pre-line; font-family: 'Courier New', monospace; font-size: 1.1em; line-height: 1.6; outline:none;">${recipe}</div>
                    </div>
                    
                    <div style="flex: 1; padding-left: 10px;">
                        <h3 style="color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom:5px; margin-top: 0;">Indicaciones</h3>
                        <div contenteditable="true" style="white-space: pre-line; font-size: 0.95em; line-height: 1.5; outline:none;">${indicaciones}</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; display:flex; justify-content:center; gap:20px; align-items:flex-end;">
                    <div>${signImg}</div>
                    <div>${stampImg}</div>
                </div>

                <div style="text-align: center; font-size: 0.8em; color: #666; margin-top: 10px;">
                    <div style="border-top: 1px solid #000; width: 250px; margin: 0 auto 5px;"></div>
                    <strong>${dr.name || ''}</strong><br>
                    ${dr.title_line_1 || ''}<br>
                    ${(dr.phones || []).join(' / ')}
                </div>
            </div>
            
            <div class="doc-footer" style="position:absolute; bottom:0; left:0; width:100%; text-align:center;">${footerImg}</div>
        </div>
    `;
}

// --- LÓGICA REACTIVA DE MEDICAMENTOS ---

export function updateRecipeTextbox(card) {
    const activeChips = card.querySelectorAll('.recipe-chips-container .chip.on');
    const selectedMeds = Array.from(activeChips).map(c => c.textContent);
    
    const txtRecipe = card.querySelector('.txt-recipe');
    
    if (txtRecipe && !txtRecipe.dataset.userEdited) {
        txtRecipe.value = selectedMeds.join('\n');
    }
}

export function updateIndicacionesSection(card) {
    const selectedByGroup = {};
    
    card.querySelectorAll('.recipe-chips-group').forEach(groupContainer => {
        const groupName = groupContainer.dataset.group;
        const medsInGroup = [...groupContainer.querySelectorAll('.chip.on')].map(c => c.textContent);
        
        if (medsInGroup.length > 0) {
            selectedByGroup[groupName] = medsInGroup;
        }
    });

    let indicacionesAuto = [];
    
    Object.entries(selectedByGroup).forEach(([groupName, meds]) => {
        const options = CIMA_DATA.INDICACIONES_OPTIONS[groupName] || CIMA_DATA.INDICACIONES_OPTIONS["Otros"];
        const defaultOption = options.length > 0 ? options[0] : "Tomar según indicación médica.";
        
        meds.forEach(med => {
            indicacionesAuto.push(`• ${med}:\n  ${defaultOption}`);
        });
    });

    const txtInd = card.querySelector('.txt-indicaciones');
    if (txtInd && !txtInd.dataset.userEdited) {
        txtInd.value = indicacionesAuto.join('\n\n');
        updatePlanTratamiento(card, txtInd.value);
    }
}

function updatePlanTratamiento(card, indicacionesText) {
    const txtPlan = card.querySelector('.txt-plan');
    if (!txtPlan || txtPlan.dataset.userEdited === '1') return;
    
    const contacto = "\n\nNOTA DE SEGURIDAD:\nAvisar eventualidad si persisten síntomas a pesar del Tratamiento indicado o empeoramiento de síntomas a los teléfonos de contacto o acudir a la Emergencia.";
    
    txtPlan.value = indicacionesText + contacto;
}
