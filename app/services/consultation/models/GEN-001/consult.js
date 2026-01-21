import { $, $$, getLocalDateTime, fmtDateTime, STATE } from 'brain';
// CORRECCIÓN: Import relativo
import { updateRecipeTextbox, renderIndicacionesDropdowns } from './recipe-indicaciones.js';

// ==========================================
// 1. DATA (CONFIGURACIÓN MÉDICA)
// ==========================================
export const CIMA_DATA = {
  MOTIVOS: ["Consulta General", "Chequeo Rutina", "Certificado Salud", "Dolor Abdominal", "Cefalea", "Fiebre", "Tos", "Malestar General", "Diarrea", "Vómitos", "Hipertensión", "Control Diabetes", "Dolor Muscular"],
  
  ANTECEDENTES: ["Alergias","Asma","HTA","Tiroides","DM","IQx","Traumatismos", "Hospitalizaciones"],
  
  DX: ["Hipertensión Arterial", "Diabetes Mellitus T2", "Síndrome Viral", "Infección Respiratoria Alta", "Infección Urinaria", "Gastroenteritis Aguda", "Cefalea Tensional", "Migraña", "Lumbago", "Dermatitis", "Rinitis Alérgica", "Faringitis Aguda", "Bronquitis Aguda", "Anemia", "Dislipidemia"],
  
  RECIPE_MEDS: {
    "Analgésicos/Antipiréticos": ["Acetaminofén 500mg", "Acetaminofén 1g", "Ibuprofeno 400mg", "Ibuprofeno 600mg", "Diclofenac Potásico 50mg", "Ketoprofeno 100mg", "Dipirona 500mg"],
    "Antibióticos": ["Amoxicilina 500mg", "Amoxicilina/Clavulánico 875/125mg", "Azitromicina 500mg", "Ciprofloxacina 500mg", "Levofloxacina 500mg", "Cefadroxilo 500mg", "Trimetroprim/Sulfametoxazol"],
    "Gastrointestinales": ["Omeprazol 20mg", "Pantoprazol 40mg", "Domperidona 10mg", "Metoclopramida 10mg", "Probióticos", "Suero Oral"],
    "Respiratorios": ["Loratadina 10mg", "Cetirizina 10mg", "Desloratadina 5mg", "Jarabe Antitusígeno", "Salbutamol Inhalador", "Budesonida Inhalador"],
    "Crónicos/Metabólicos": ["Losartán Potásico 50mg", "Losartán Potásico 100mg", "Amlodipina 5mg", "Enalapril 10mg", "Metformina 500mg", "Metformina 850mg", "Metformina 1000mg", "Glibenclamida 5mg", "Atorvastatina 20mg"],
    "Vitaminas/Otros": ["Complejo B", "Vitamina C", "Ácido Fólico", "Hierro", "Calcio + Vit D"]
  },
  
  INDICACIONES_OPTIONS: {
    "Analgésicos/Antipiréticos": ["Tomar 1 tableta cada 6 horas por 3 días si hay dolor/fiebre.", "Tomar 1 tableta cada 8 horas por 3 días.", "Tomar 1 tableta cada 12 horas si hay dolor.", "Tomar 1 tableta S.O.S dolor."],
    "Antibióticos": ["Tomar 1 tableta cada 8 horas por 7 días.", "Tomar 1 tableta cada 12 horas por 7 días.", "Tomar 1 tableta cada 12 horas por 10 días.", "Tomar 1 tableta cada 24 horas por 3 días.", "Tomar 1 tableta cada 24 horas por 5 días."],
    "Gastrointestinales": ["Tomar 1 cápsula en ayunas por 1 mes.", "Tomar 1 tableta 30 min antes de cada comida.", "Tomar 1 tableta cada 8 horas por 3 días.", "Tomar 1 sobre diluido en agua después de cada evacuación."],
    "Respiratorios": ["Tomar 1 tableta diaria por 7 días.", "Tomar 10ml cada 8 horas por 5 días.", "Realizar 2 puff cada 4-6 horas.", "Realizar lavados nasales frecuentes."],
    "Crónicos/Metabólicos": ["Tomar 1 tableta diaria por la mañana (orden permanente).", "Tomar 1 tableta diaria con el almuerzo.", "Tomar 1 tableta en la noche.", "Tomar 1 tableta cada 12 horas."],
    "Vitaminas/Otros": ["Tomar 1 tableta diaria con el desayuno por 1 mes.", "Tomar 1 tableta diaria."]
  },

  // CORRECCIÓN SINTAXIS: Se cambia {} por []
  STUDIES: [
    "Electrocardiograma",
    "Prueba de Esfuerzo",
    "Rayos X de Tórax",
    "Perfil 20",
    "Hematología Completa",
    "Examen de Orina",
    "Heces",
    "Perfil Lipídico",
    "Perfil Tiroideo",
    "Ecosonograma Abdominal",
    "Ecosonograma Renal",
    "Tacto Rectal",
    "Antígeno Prostático (PSA)"
   ],

   ADDITIONAL_STUDIES: ["Espirometría", "Holter de Ritmo", "MAPA"]
};

// ==========================================
// 2. TEMPLATE HTML (LA VISTA DE LA TARJETA)
// ==========================================
const VISIT_TEMPLATE = (cardId, type, createdTime, createdBy, eaAuto) => `
    <div class="visit-header">
      <div style="flex: 1; display: flex; flex-direction: column; margin-left: 10px;">
          <div style="display:flex; align-items:center; gap:10px;">
             <span class="badge" style="background:#10b981; color:white;">${type}</span>
             <span style="font-weight:600;">Medicina General</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
             Creado: ${fmtDateTime(createdTime)} por ${createdBy}
          </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-primary btn-small btn-inf"><i class="bi bi-file-text"></i> Informe</button>
        <button type="button" class="btn btn-success btn-small btn-rp"><i class="bi bi-prescription"></i> Receta</button>
        <button type="button" class="btn btn-ghost btn-small text-danger btn-del-visit"><i class="bi bi-x-lg"></i></button>
        <button type="button" class="visit-toggle-btn btn btn-ghost btn-small"><i class="bi bi-chevron-down"></i></button>
      </div>
    </div>
    
    <div class="visit-body">
      <div class="row">
        <div class="col">
          <label class="form-label">Fecha y Hora</label>
          <input type="datetime-local" class="form-input visit-date" value="${getLocalDateTime()}">
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">1. Anamnesis</div>
        <div class="row">
          <div class="col">
            <label class="form-label">Motivo de Consulta</label>
            <input class="form-input txt-motivo" placeholder="(texto libre)">
            <div class="chips chips-motivo" style="margin-top: 8px;"></div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label class="form-label">Enfermedad Actual</label>
            <textarea class="form-input txt-ea" rows="3" placeholder="(autogenerado)">${eaAuto}</textarea>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label class="form-label">Antecedentes Personales</label>
            <input class="form-input txt-antecedentes-personales" placeholder="(se llena con chips)">
            <div class="chips chips-antecedentes-personales" style="margin-top: 8px;"></div>
          </div>
          <div class="col">
            <label class="form-label">Antecedentes Familiares</label>
            <input class="form-input txt-antecedentes-familiares" placeholder="(se llena con chips)">
            <div class="chips chips-antecedentes-familiares" style="margin-top: 8px;"></div>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">2. Examen Físico</div>
        
        <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="col">
                <label class="form-label">Tensión Arterial</label>
                <input class="form-input txt-exam-ta" placeholder="120/80 mmHg">
            </div>
            <div class="col">
                <label class="form-label">Frecuencia Cardíaca</label>
                <input class="form-input txt-exam-fc" placeholder="lpm">
            </div>
            <div class="col">
                <label class="form-label">Frecuencia Resp.</label>
                <input class="form-input txt-exam-fr" placeholder="rpm">
            </div>
            <div class="col">
                <label class="form-label">Temperatura</label>
                <input class="form-input txt-exam-temp" placeholder="°C">
            </div>
            <div class="col">
                <label class="form-label">SatO2</label>
                <input class="form-input txt-exam-sat" placeholder="%">
            </div>
            <div class="col">
                <label class="form-label">Peso Actual</label>
                <input class="form-input txt-exam-peso" placeholder="kg">
            </div>
        </div>

        <div class="exam-area" style="margin-top:15px;">
          <div class="exam-area-title">Hallazgos Generales</div>
          <label class="form-label">Descripción</label>
          <textarea class="form-input txt-exam-general" rows="3" placeholder="Cabeza, cuello, tórax, abdomen, extremidades..."></textarea>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">3. Estudios Solicitados</div>
        <div class="row">
          <div class="col">
            <label class="form-label">Seleccionar Estudios</label>
            <div class="chips chips-studies" style="margin-top: 8px;"></div>
            <textarea class="form-input txt-estudios-solicitados" rows="3" style="margin-top:10px;" placeholder="Detalle de estudios..."></textarea>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">4. Diagnóstico y Plan</div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Diagnóstico</label>
            <input class="form-input txt-dx" placeholder="(se llena con chips + libre)">
            <div class="chips chips-dx" style="margin-top: 8px;"></div>
          </div>
        </div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Medicamentos / RP</label>
            <textarea class="form-input txt-recipe" rows="4" placeholder="(seleccione medicamentos)"></textarea>
            <div class="recipe-chips-container" style="margin-top: 8px;"></div>
          </div>
        </div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Indicaciones (Posología)</label>
            <div class="indicaciones-dropdowns" style="margin-bottom: 10px;"></div>
            <textarea class="form-input txt-indicaciones" rows="6" placeholder="(se generan automáticamente)"></textarea>
          </div>
        </div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Plan / Recomendaciones</label>
            <textarea class="form-input txt-plan" rows="4" placeholder="Dieta, ejercicios, reposo, control..."></textarea>
          </div>
        </div>
      </div>
      
      <div class="patient-nav">
        <button type="button" class="btn btn-ghost btn-small" onclick="document.getElementById('${cardId}').scrollIntoView({behavior: 'smooth'})">
            <i class="bi bi-arrow-up"></i> Subir
        </button>
        <button type="button" class="btn btn-ghost btn-small btn-collapse-card">
            <i class="bi bi-arrows-collapse"></i> Colapsar
        </button>
      </div>
    </div>
`;

// ==========================================
// 3. LOGICA DEL COMPONENTE (ENGINE)
// ==========================================

// Helper para crear chips
function createChip(label, type = 'normal') {
    const s = document.createElement('span');
    s.className = 'chip' + (type.includes('study') ? ' study-chip' : '');
    s.textContent = label;
    s.dataset.active = '0';
    
    s.addEventListener('click', () => {
        const isActive = s.dataset.active === '1';
        s.dataset.active = isActive ? '0' : '1';
        s.classList.toggle('on', !isActive);
        s.dispatchEvent(new CustomEvent('chip-toggle', { bubbles: true, detail: { label, active: !isActive } }));
    });
    return s;
}

// Función principal exportada
export function createVisitCard(type = 'Primera') {
    STATE.visitIdCounter++;
    const cardId = 'visit-' + STATE.visitIdCounter;
    
    const createdBy = STATE.currentUser?.profile?.name || 'Usuario';
    const createdTime = new Date().toISOString();

    const wrap = document.createElement('div');
    wrap.id = cardId;
    wrap.className = 'card visit-card';
    wrap.dataset.type = type;
    wrap.dataset.createdBy = createdBy;
    wrap.dataset.createdAt = createdTime;

    const edad = $("#edad_auto")?.value || '';
    const genero = $("#genero")?.value || '';
    const edadStr = (edad || edad === 0) ? `${edad} años` : '[edad]';
    const eaAuto = `Paciente ${genero || '[género]'} de ${edadStr} quien acude a consulta por presentar [Motivo de consulta].`;

    // INYECTAR EL TEMPLATE
    wrap.innerHTML = VISIT_TEMPLATE(cardId, type, createdTime, createdBy, eaAuto);

    // --- INYECCIÓN DE CHIPS ---
    const motivoContainer = wrap.querySelector('.chips-motivo');
    CIMA_DATA.MOTIVOS.forEach(m => motivoContainer.appendChild(createChip(m)));
    
    const antPersContainer = wrap.querySelector('.chips-antecedentes-personales');
    const antFamContainer = wrap.querySelector('.chips-antecedentes-familiares');
    CIMA_DATA.ANTECEDENTES.forEach(a => antPersContainer.appendChild(createChip(a)));
    CIMA_DATA.ANTECEDENTES.forEach(a => antFamContainer.appendChild(createChip(a)));
    
    // Estudios
    const studiesContainer = wrap.querySelector('.chips-studies');
    CIMA_DATA.STUDIES.forEach(studyName => {
        studiesContainer.appendChild(createChip(studyName, 'study-simple'));
    });
    CIMA_DATA.ADDITIONAL_STUDIES.forEach(studyName => {
        studiesContainer.appendChild(createChip(studyName, 'study-simple'));
    });

    const dxContainer = wrap.querySelector('.chips-dx');
    CIMA_DATA.DX.forEach(d => dxContainer.appendChild(createChip(d)));

    const recipeContainer = wrap.querySelector('.recipe-chips-container');
    Object.entries(CIMA_DATA.RECIPE_MEDS).forEach(([group, meds]) => {
        const groupDiv = document.createElement('div');
        groupDiv.style.marginBottom = '12px';
        groupDiv.className = 'recipe-chips-group'; 
        groupDiv.dataset.group = group; 
        
        groupDiv.innerHTML = `
          <div style="font-weight: 600; color: #10b981; margin: 8px 0;">${group}</div>
          <div class="chips"></div>
        `;
        const chipsBox = groupDiv.querySelector('.chips');
        meds.forEach(med => chipsBox.appendChild(createChip(med)));
        recipeContainer.appendChild(groupDiv);
    });

    // --- EVENT LISTENERS ---
    
    wrap.querySelector('.visit-toggle-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const body = wrap.querySelector('.visit-body');
        const icon = wrap.querySelector('.visit-toggle-btn i');
        body.classList.toggle('hidden');
        icon.className = body.classList.contains('hidden') ? 'bi bi-chevron-right' : 'bi bi-chevron-down';
    });

    wrap.querySelector('.btn-del-visit')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if(confirm('¿Eliminar esta consulta?')) wrap.remove();
    });
    
    wrap.querySelector('.btn-collapse-card').addEventListener('click', () => {
        wrap.querySelector('.visit-body').classList.add('hidden');
        wrap.querySelector('.visit-toggle-btn i').className = 'bi bi-chevron-right';
    });

    wrap.addEventListener('chip-toggle', (e) => {
        const { label, active } = e.detail;
        const target = e.target;

        // Estudios (Lista Simple)
        if (target.closest('.chips-studies')) {
            const textarea = wrap.querySelector('.txt-estudios-solicitados');
            if (textarea) {
                let current = textarea.value.split('\n').map(l => l.trim()).filter(l => l);
                if (active) {
                    if (!current.includes(label)) current.push(label);
                } else {
                    current = current.filter(l => l !== label);
                }
                textarea.value = current.join('\n');
            }
        }

        // Inputs Normales (Motivo, DX, Antecedentes)
        const simpleInputs = [
            { cont: '.chips-motivo', input: '.txt-motivo' },
            { cont: '.chips-dx', input: '.txt-dx' },
            { cont: '.chips-antecedentes-personales', input: '.txt-antecedentes-personales' },
            { cont: '.chips-antecedentes-familiares', input: '.txt-antecedentes-familiares' }
        ];
        
        simpleInputs.forEach(item => {
            if (target.closest(item.cont)) {
                const chips = Array.from(wrap.querySelectorAll(`${item.cont} .chip.on`));
                const input = wrap.querySelector(item.input);
                if (input && !input.dataset.userEdited) {
                    input.value = chips.map(c => c.textContent).join(', ');
                }
            }
        });

        // Recipe (Llamando a las funciones importadas, pasando CIMA_DATA)
        if (target.closest('.recipe-chips-container')) {
            updateRecipeTextbox(wrap);
            // CORRECCIÓN: Se pasa CIMA_DATA explícitamente para evitar dependencia circular
            renderIndicacionesDropdowns(wrap, CIMA_DATA);
        }
    });

    wrap.querySelectorAll('textarea, input[type="text"]').forEach(input => {
        input.addEventListener('input', () => input.dataset.userEdited = '1');
    });

    return wrap;
}
