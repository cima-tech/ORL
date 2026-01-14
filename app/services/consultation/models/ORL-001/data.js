import { $, $$, getLocalDateTime, STATE } from '../../../../logic/brain.js';
import { updateRecipeTextbox, updateIndicacionesSection } from './recipe-indicaciones.js';

// =========== BASE DE CONOCIMIENTO MÉDICO (DATA FULL) ===========
export const CIMA_DATA = {
  MOTIVOS: ["Obstrucción Nasal","Ronquidos Nocturnos","Respiración Bucal","Rinorrea","Odinofagia","Otorrea","Otalgia","Masa en Cuello","Difonía","Dolor Facial","Cefalea"],
  
  ANTECEDENTES: ["Alergias","Asma","HTA","Tiroides","DM","IQx","Trauma Acústico"],
  
  DX: ["Otocerumen Bilateral","Otocerumen Derecho","Otocerumen Izquierdo","Otitis Externa Bilateral","Otitis Externa Derecha","Otitis Externa Izquierda","Otitis Media Aguda Bilateral","Otitis Media Aguda Derecha","Otitis Media Aguda Izquierda","Otitis Media Crónica Perforada Bilateral","Otitis Media Crónica Perforada Derecha","Otitis Media Crónica Perforada Izquierda","Otitis Media Crónica Sucurativa","Otitis Media Crónica Colestetomatosa","Hipoacusia Neurosensorial Profunda Bilateral","Hipoacusia Neurosensorial Profunda Derecha","Hipoacusia Neurosensorial Profunda Izquierda","Hipoacusia Conductiva Leve Bilateral","Hipoacusia Conductiva Leve Derecha","Hipoacusia Conductiva Leve Izquierda","Presbiacusia","Otitis Media Serosa Bilateral","Otitis Media Serosa Derecha","Otitis Media Serosa Izquierda","Faringoamigdalitis Aguda","Tonsilitis Recurrente","Otitis Media Aguda Recurrente","Alto Riesgo Biológico Para Hipoacusia","Rinopatía Obstructiva","Rinitis Alérgica","Poliposis Nasal","Rinosinusitis Aguda Maxiloetmoidal","Rinosinusitis Aguda Maxilar","Rinosinusitis Maxilar Crónica","Rinosinusitis Crónica Con Poliposis Nasal","Lesión En Cuerda Vocal Derecha","Lesión En Cuerda Vocal Izquierda","Parálisis De Cuerda Vocal Bilateral","Parálisis De Cuerda Vocal Derecha","Parálisis De Cuerda Vocal Izquierda","Epistaxis Anterior","Epistaxis Anteroposterior","Epistaxis Posterior","Frenillo Lingual","Antecedente Quirúrgico"],
  
  RECIPE_MEDS: {
    "Esteroides Nasales": ["Solución Fisiológica","Flinas / Nasonex / Elocon / Flixonase / Nimarin / Budenas (Spray Nasal)","Flinas - Spray Nasal","Nasonex - Spray Nasal","Elocon - Spray Nasal","Flixonase - Spray Nasal","Nimarin - Spray Nasal","Budenas - Spray Nasal","Momentasona o Fluticasona - Spray Nasal"],
    "Antialérgicos": ["Desloratadina - Tabletas 5 mg","Desloratadina - Jarabe","Loratadina - Tabletas 10 mg","Loratadina - Jarabe","Cetirizina - Tabletas 10 mg","Cetirizina - Jarabe","Levocetirizina - Tabletas 5 mg","Levocetirizina - Jarabe","Rinolast - Tabletas","Rinolast - Jarabe","Fexofenadina - Tabletas 120 mg","Fexofenadina - Jarabe","Claricort - Tabletas","Lorecort - Jarabe","Montelukast - Tabletas 4 mg","Montelukast - Tabletas 5 mg","Montelukast - Tabletas 10 mg","Rinomax - Gotas Nasales","Bactroban, Bacitracina, Mupirocina, Muprovan - crema o ungüento"],
    "Gotas óticas": ["Quinotic, Quinotic HC, (Gotas Óticas)","Otalex (Gotas Óticas)","Poliótico (Gotas Óticas)","Otirilin o Aceite de Bebé (Gotas)"],
    "Protector Gástrico": ["Pantoprazol ó Esomeprazol - Tabletas de 20 mg","Pantoprazol - Tabletas 40 mg"],
    "Antibióticos": ["Amoxicilina / Acido Clavulánico - Tabletas 875/125 mg","Amoxicilina / Acido Clavulánico - Suspensión 600 mg / 5 ml","Amoxicilina - Tabletas 500 mg","Amoxicilina - Jarabe","Sultamicilina - Tabletas 750 mg","Sultamicilina - Suspensión 250 mg / 5 ml","Levofloxacina- Tabletas 500 mg","Levofloxacina- Tabletas 750 mg","Moxifloxacina, Moxen, Avelox - Comprimidos 400 mg"],
    "Otros": ["Pulmolix - Sobres","Betahistina - 8 mg","Betahistina - 16 mg","Betahistina - 24 mg","Viajesan - Comprimidos"]
  },
  
  INDICACIONES_OPTIONS: {
    "Esteroides Nasales": ["Realizar lavados nasales cada 12 horas por 7 días.","Colocar dos aplicaciones en cada fosa nasal cada 12 horas por 1 mes.","Colocar una aplicación en cada fosa nasal cada 12 horas por 1 mes."],
    "Antialérgicos": ["Tomar 1 tableta diaria por 1 mes.","Dar vía oral 1 cc una vez al día por 1 mes.","Dar vía oral 2 cc una vez al día por 1 mes.","Dar vía oral 3 cc una vez al día por 1 mes.","Dar vía oral 4 cc una vez al día por 1 mes.","Dar vía oral 5 cc una vez al día por 1 mes.","Tomar 1 tableta cada 12 horas por 7 días.","Dar vía oral 1 cc cada 12 horas por 7 días.","Dar vía oral 2 cc cada 12 horas por 7 días.","Dar vía oral 3 cc cada 12 horas por 7 días.","Dar vía oral 4 cc cada 12 horas por 7 días.","Dar vía oral 5 cc cada 12 horas por 7 días.","Colocar 3 Gotas en cada fosa nasal cada 8 horas por 5 días.","Colocar 1 aplicación en cada fosa nasal cada 12 horas por 7 días.","Tomar 1 tableta diaria por 3 meses."],
    "Gotas óticas": ["Aplicar 3 Gotas en cada oído cada 12 horas por 7 días. No mojar los oídos.","Aplicar 3 Gotas en cada oído cada 8 horas por 7 días. No mojar los oídos.","Aplicar 3 Gotas en oído izquierdo cada 8 horas por 7 días. No mojar los oídos.","Aplicar 3 Gotas en oído izquierdo cada 12 horas por 7 días. No mojar los oídos.","Aplicar 3 Gotas en oído derecho cada 8 horas por 7 días. No mojar los oídos.","Aplicar 3 Gotas en oído derecho cada 12 horas por 7 días. No mojar los oídos."],
    "Protector Gástrico": ["Tomar 1 tableta diaria por 3 meses.","Tomar 1 tableta diaria antes del desayuno por 1 mes.","Tomar 1 tableta antes del desayuno y 1 Tableta antes la cena por 1 mes."],
    "Antibióticos": ["Tomar 1 tableta cada 12 horas por 10 días.","Tomar 1 tableta cada 8 horas por 10 días.","Tomar 1 tableta diaria por 10 días.","Dar vía oral 1 cc cada 12 horas por 10 días.","Dar vía oral 2 cc cada 12 horas por 10 días.","Dar vía oral 3 cc cada 12 horas por 10 días.","Dar vía oral 4 cc cada 12 horas por 10 días.","Dar vía oral 5 cc cada 12 horas por 10 días.","Dar vía oral 6 cc cada 12 horas por 10 días."],
    "Otros": ["Tomar 1 tableta cada 12 horas por 10 días.","Tomar 1 tableta cada 8 horas por 10 días.","Tomar 1 tableta diaria por 10 días."]
  },

  STUDIES: {
    "Nasofibrolaringoscopia": {
      "Fosas Nasales": ["Permeables","No Permeables"],
      "Correderas Nasales": ["Sin Rinorrea","Rinorrea Blanca Escasa","Rinorrea Blanca Moderada","Rinorrea Blanca Abundante","Rinorrea Hialina Escasa","Rinorrea Hialina Moderada","Rinorrea Hialina Abundante","Rinorrea Amarilla Escasa","Rinorrea Amarilla Moderada","Rinorrea Amarilla Abundante","Rinorrea Verde Escasa","Rinorrea Verde Moderada","Rinorrea Verde Abundante"],
      "Tabique": ["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Levoconvexa Con Espolón Oseo Derecho","Levoconvexa Con Espolón Oseo Izquierdo","Dextroconvexa Con Espolón Oseo Derecho","Dextroconvexa Con Espolón Oseo Izquierdo","Central Con Espolón Óseo Derecho","Central Con Espolón Óseo Izquierdo"],
      "Cornete Inferior Derecho": ["Eutrófico","Hipertrófico","Polipoide"],
      "Cornete Medio Derecho": ["Eutrófico","Hipertrófico","Polipoide"],
      "Meato Medio Derecho": ["Libre","Comprometido"],
      "Coana Derecha": ["Permeable","No Permeable"],
      "Cornete Inferior Izquierdo": ["Eutrófico","Hipertrófico","Polipoide"],
      "Cornete Medio Izquierdo": ["Eutrófico","Hipertrófico","Polipoide"],
      "Meato Medio Izquierdo": ["Libre","Comprometido"],
      "Coana Izquierda": ["Permeable","No Permeable"],
      "Paladar": ["Con Cierre Coronal","Competente","Incompetente"],
      "Adenoides": ["Ausentes","Leves","Moderadas","Severas"],
      "Rinofaringe": ["Indemne","Congestiva Granulosa","Granulosa","Con Rinorrea Posterior Blanca Escasa","Con Rinorrea Posterior Hialina Escasa","Con Rinorrea Posterior Amarilla Escasa","Con Rinorrea Posterior Verde Escasa","Con Rinorrea Posterior Blanca Moderada","Con Rinorrea Posterior Hialina Moderada","Con Rinorrea Posterior Amarilla Moderada","Con Rinorrea Posterior Verde Moderada","Con Rinorrea Posterior Blanca Abundante","Con Rinorrea Posterior Hialina Abundante","Con Rinorrea Posterior Amarilla Abundante","Con Rinorrea Posterior Verde Abundante"],
      "Base De Lengua": ["Sin Lesiones","Con Loe"],
      "Senos Piriformes": ["Indemnes","Seno Piriforme Derecho Con Loe","Seno Piriforme Derecho Sin Lesiones","Seno Piriforme Izquierdo Con Loe","Seno Piriforme Izquierdo Sin Lesiones"],
      "Valleculas": ["Indemnes","Vallecula Derecha Con Loe","Vallecula Derecha Sin Lesiones","Vallecula Izquierda Con Loe","Vallecula Izquierda Sin Lesiones"],
      "Epiglotis": ["Indemne Erecta","Móvil","Eritematosa","En Omega"],
      "Bandas Ventriculares": ["Indemnes","Hipertróficas","Con Loe"],
      "Cuerda Vocal Derecha": ["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
      "Cuerda Vocal Izquierda": ["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
      "Cierre Glótico": ["Completo","Incompleto En Huso","Incompleto Irregular","En Reloj De Arena","Con Hiato Anterior","Con Hiato Posterior"],
      "Subglotis": ["Permeable 100%","Estenosis Subglótica Cotton I","Estenosis Subglótica Cotton Ii","Estenosis Subglótica Cotton Iii"],
      "Mucosa": ["Indemne","Eritematosa","Pálida","Con Plexo Derecho Friable","Con Plexo Izquierdo Friable"]
    },
    "Endoscopia Nasal": {
      "Fosas Nasales": ["Permeables","No Permeables"],
      "Tabique": ["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Levoconvexa Con Espolón Oseo Derecho","Levoconvexa Con Espolón Oseo Izquierdo","Dextroconvexa Con Espolón Oseo Derecho","Dextroconvexa Con Espolón Oseo Izquierdo","Central Con Espolón Óseo Derecho","Central Con Espolón Óseo Izquierdo"],
      "Cornete Medio Derecho": ["Eutrófico","Hipertrófico","Polipoide","Concha Media Bullosa Derecha","Paradójico Derecho"],
      "Cornete Medio Izquierdo": ["Eutrófico","Hipertrófico","Polipoide","Concha Media Bullosa Izquierda","Paradójico Izquierdo"],
      "Meato Medio Derecho": ["Libre","Comprometido"],
      "Meato Medio Izquierdo": ["Libre","Comprometido"],
      "Coana Derecha": ["Permeable","No Permeable"],
      "Coana Izquierda": ["Permeable","No Permeable"],
      "Sinusopatía": ["Sin Sinusopatía","Con Sinusopatía Maxilar Derecha","Con Sinusopatía Maxilar Izquierda","Con Sinusopatía Frontal Derecha","Con Sinusopatía Frontal Izquierda","Con Sinusopatía Etmoidal Anterior Derecha","Con Sinusopatía Etmoidal Anterior Izquierda","Con Sinusopatía Etmoidal Posterior Derecha","Con Sinusopatía Etmoidal Posterior Izquierda","Con Sinusopatía Esfenoidal Anterior Derecha","Con Sinusopatía Esfenoidal Anterior Izquierda","Con Sinusopatía Maxiloetmoidal Derecha","Con Sinusopatía Maxiloetmoidal Izquierda"]
    },
    "Telelaringoscopia": {
      "Cierre Glótico": ["Completo","Incompleto En Huso","Incompleto Irregular","En Reloj De Arena","Con Hiato Anterior","Con Hiato Posterior"],
      "Bandas Ventriculares": ["Indemnes","Hipertróficas","Con Loe"],
      "Cuerda Vocal Derecha": ["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
      "Cuerda Vocal Izquierda": ["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
      "Subglotis": ["Permeable 100%","Estenosis Cotton I","Estenosis Cotton Ii","Estenosis Cotton Iii"]
    },
    "Impedanciometría": {
      "Oído Derecho": ["Curva Tipo A","Curva Tipo As","Curva Tipo B","Curva Tipo C"],
      "Oído Izquierdo": ["Curva Tipo A","Curva Tipo As","Curva Tipo B","Curva Tipo C"]
    },
    "Tomografía de Oído": {
      "Cae Derecho": ["Permeable","No Permeable"],
      "Om Derecho": ["Neumatizado","Con Velamiento"],
      "Scutum Derecho": ["Indemne","Amputado"],
      "Co Derecha": ["Cadena Osicular Indemne","Cadena Osicular Alterada"],
      "Mastoides Derecha": ["Neumatizada","Poco Neumatizada","Velada Completamente"],
      "Cóclea Derecha": ["Indemne Con 2 Vueltas Y Media","Con Malformación","Impresiona","Osificada"],
      "Cai Derecho": ["Indemne","Hipoplásico","Con Loe"],
      "Cae Izquierdo": ["Permeable","No Permeable"],
      "Om Izquierdo": ["Neumatizado","Con Velamiento"],
      "Scutum Izquierdo": ["Indemne","Amputado"],
      "Co Izquierda": ["Cadena Osicular Indemne","Cadena Osicular Alterada"],
      "Mastoides Izquierda": ["Neumatizada","Poco Neumatizada","Velada Completamente"],
      "Cóclea Izquierda": ["Indemne Con 2 Vueltas Y Media","Con Malformación","Impresiona","Osificada"],
      "Cai Izquierdo": ["Indemne","Hipoplásico","Con Loe"]
    },
    "Tomografía de Nariz y SPN": {
      "Tabique": ["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Espolón Óseo Derecho","Espolón Óseo Izquierdo"],
      "Cornetes": ["Eutróficos","Hipertróficos","Polipoides","Concha Media Bullosa Derecha","Concha Media Bullosa Izquierda","Cornete Medio Paradójico Derecho","Cornete Medio Paradójico Izquierdo"],
      "Meato Medio Derecho": ["Libre","Comprometido"],
      "Meato Medio Izquierdo": ["Libre","Comprometido"],
      "Coana Derecha": ["Permeable","No Permeable"],
      "Coana Izquierda": ["Permeable","No Permeable"],
      "Sinusopatía": ["Sin Sinusopatía","Con Sinusopatía Maxilar Derecha","Con Sinusopatía Maxilar Izquierda","Con Sinusopatía Frontal Derecha","Con Sinusopatía Frontal Izquierda","Con Sinusopatía Etmoidal Anterior Derecha","Con Sinusopatía Etmoidal Anterior Izquierda","Con Sinusopatía Etmoidal Posterior Derecha","Con Sinusopatía Etmoidal Posterior Izquierda","Con Sinusopatía Esfenoidal Anterior Derecha","Con Sinusopatía Esfenoidal Anterior Izquierda","Con Sinusopatía Maxiloetmoidal Derecha","Con Sinusopatía Maxiloetmoidal Izquierda"]
    }
  },
  
  PHYSICAL_EXAM: {
    "Cara": ["Simetría Facial","Asimetría Facial","Parálisis Facial Periférica","Parálisis Facial Periférica derecha","Parálisis Facial Periférica izquierda","Parálisis Facial Central","Edema Facial","Malformación Craneofacial"],
    "Oído Derecho": {
      "Oído Externo": ["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],
      "Conducto Auditivo Externo": ["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],
      "Membrana Timpánica": ["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]
    },
    "Oído Izquierdo": {
      "Oído Externo": ["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],
      "Conducto Auditivo Externo": ["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],
      "Membrana Timpánica": ["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]
    },
    "Nariz": {
      "Fosa": ["Fosa nasal permeable","LOE","LOE que obstruye compleamente fosa nasal izquierda","LOE que obstruye completamente fosa nasal derecha"],
      "Tabique": ["Tabique Central","con desviación Dextroconvexa","con desviación Levoconvexa","con espolón óseo"],
      "Cornetes": ["Cornete inferior eutrófico","Cornete inferior hipertrófico obstructivo","Cornete inferior con degeneración polipoidea","Cornete medio eutrófico","Cornete medio hipertrófico","Poliposis nasal"],
      "Mucosa": ["Mucosa Indemne","Mucosa Pálida","Mucosa Eritematosa a nivel de Plexos","Epistaxis Anterior","Epistaxis Posterior"],
      "Rinorrea": ["Rinorrea Hialina","Rinorrea Blanquecina","Rinorrea Amarillenta"]
    },
    "Orofaringe": {
      "Lengua": ["Lengua húmeda móvil","Lengua seca"],
      "Tonsilas": ["Tonsilas grado I","Tonsilas grado II","Tonsilas grado III","Tonsilas grado IV","Tonsilas asimétricas","Tonsilas con placas blanquecinas"],
      "Rinofaringe": ["Rinofaringe congestiva","con rinorrea posterior escasa","con rinorrea posterior blanquecina","con placas blanquecinas"]
    },
    "Cuello": ["Móvil, sin lesiones aparentes"]
  },

  ADDITIONAL_STUDIES: [
    "Audiometría",
    "Timpanometría",
    "Acufenometría",
    "Prueba de Prótesis Auditiva",
    "PEATC",
    "Estudio de Sueño",
    "Resonancia de Nariz y SPN",
    "Protocolo de Implante Coclear"
  ]
};

// =========== COMPONENTES DE UI (CHIPS) ===========
function createChip(label, type = 'normal') {
    const s = document.createElement('span');
    s.className = 'chip' + (type === 'study' ? ' study-chip' : '');
    s.textContent = label;
    s.dataset.active = '0';
    
    s.addEventListener('click', () => {
        const isActive = s.dataset.active === '1';
        s.dataset.active = isActive ? '0' : '1';
        s.classList.toggle('on', !isActive);
        // Disparar evento personalizado para que otros escuchen cambios
        s.dispatchEvent(new CustomEvent('chip-toggle', { bubbles: true, detail: { label, active: !isActive } }));
    });
    return s;
}

function createChipGroup(title, items, container) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'chip-group';
    groupDiv.innerHTML = `<div class="chip-group-title">${title}</div><div class="chips"></div>`;
    const chipsDiv = groupDiv.querySelector('.chips');
    items.forEach(item => chipsDiv.appendChild(createChip(item)));
    container.appendChild(groupDiv);
}

// =========== GENERADOR DE TARJETA DE VISITA (ESTRUCTURA HTML EXACTA) ===========
export function createVisitCard(type = 'Primera') {
    STATE.visitIdCounter++;
    const cardId = 'visit-' + STATE.visitIdCounter;
    
    const wrap = document.createElement('div');
    wrap.id = cardId;
    wrap.className = 'card visit-card';
    wrap.dataset.type = type;

    // Datos para EA autogenerada
    const edad = $("#edad_auto")?.value || '';
    const genero = $("#genero")?.value || '';
    const edadStr = (edad || edad === 0) ? `${edad} años` : '[edad]';
    const eaAuto = `Paciente ${genero || '[género]'} de ${edadStr} quien acude a consulta por presentar [Motivo de consulta].`;

    wrap.innerHTML = `
    <div class="visit-header">
      <button type="button" class="visit-toggle-btn">
        <i class="bi bi-chevron-down"></i>
      </button>
      <span class="badge">${type}</span>
      <span style="flex: 1; margin-left: 10px;">Consulta ${type.toLowerCase()}</span>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn btn-primary btn-small btn-inf">
          <i class="bi bi-file-text"></i> Informe
        </button>
        <button type="button" class="btn btn-success btn-small btn-rp">
          <i class="bi bi-prescription"></i> Receta
        </button>
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
        
        <div class="exam-area">
          <div class="exam-area-title"><i class="bi bi-emoji-neutral"></i> Cara</div>
          <label class="form-label">Hallazgos en Cara</label>
          <input class="form-input txt-exam-cara" placeholder="Hallazgos en cara...">
          <div class="chips chips-exam-cara" style="margin-top: 8px;"></div>
        </div>
        
        <div class="exam-area">
          <div class="exam-area-title"><i class="bi bi-ear"></i> Oído Derecho</div>
          <label class="form-label">Hallazgos Oído Derecho</label>
          <textarea class="form-input txt-exam-oido-derecho" rows="2" placeholder="Hallazgos oído derecho..."></textarea>
          <div class="chips-exam-oido-derecho" style="margin-top: 8px;"></div>
        </div>
        
        <div class="exam-area">
          <div class="exam-area-title"><i class="bi bi-ear"></i> Oído Izquierdo</div>
          <label class="form-label">Hallazgos Oído Izquierdo</label>
          <textarea class="form-input txt-exam-oido-izquierdo" rows="2" placeholder="Hallazgos oído izquierdo..."></textarea>
          <div class="chips-exam-oido-izquierdo" style="margin-top: 8px;"></div>
        </div>
        
        <div class="exam-area">
          <div class="exam-area-title"><i class="bi bi-droplet"></i> Nariz</div>
          <label class="form-label">Hallazgos en Nariz</label>
          <textarea class="form-input txt-exam-nariz" rows="2" placeholder="Hallazgos en nariz..."></textarea>
          <div class="chips-exam-nariz" style="margin-top: 8px;"></div>
        </div>
        
        <div class="exam-area">
          <div class="exam-area-title"><i class="bi bi-mic"></i> Orofaringe</div>
          <label class="form-label">Hallazgos en Orofaringe</label>
          <textarea class="form-input txt-exam-orofaringe" rows="2" placeholder="Hallazgos en orofaringe..."></textarea>
          <div class="chips-exam-orofaringe" style="margin-top: 8px;"></div>
        </div>
        
        <div class="exam-area">
          <div class="exam-area-title"><i class="bi bi-person-standing"></i> Cuello</div>
          <label class="form-label">Hallazgos en Cuello</label>
          <input class="form-input txt-exam-cuello" placeholder="Hallazgos en cuello...">
          <div class="chips chips-exam-cuello" style="margin-top: 8px;"></div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="form-section-title">3. Estudios</div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Seleccionar Estudios</label>
            <div class="chips chips-studies" style="margin-top: 8px;"></div>
            <div id="studies-content-${cardId}" style="margin-top: 16px;"></div>
          </div>
        </div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Estudios Adicionales (sin chips, solo texto)</label>
            <div class="additional-studies-container" style="margin-top: 8px;"></div>
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
            <textarea class="form-input txt-indicaciones" rows="6" placeholder="(se generan automáticamente)"></textarea>
            <div class="indicaciones-dropdowns" style="margin-top: 8px;"></div>
          </div>
        </div>
        
        <div class="row">
          <div class="col">
            <label class="form-label">Plan / Tratamiento Final</label>
            <textarea class="form-input txt-plan" rows="8" placeholder="(hereda de indicaciones + texto legal)"></textarea>
          </div>
        </div>
      </div>
      
      <div class="doc-status-area" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(96, 165, 250, 0.1);"></div>
    </div>
  `;

  // --- INYECCIÓN DE CHIPS ---
  // Utilizamos las utilidades definidas arriba (createChip y createChipGroup)
  
  // 1. Motivos
  const motivoContainer = wrap.querySelector('.chips-motivo');
  CIMA_DATA.MOTIVOS.forEach(m => motivoContainer.appendChild(createChip(m)));
  
  // 2. Antecedentes
  const antPersContainer = wrap.querySelector('.chips-antecedentes-personales');
  const antFamContainer = wrap.querySelector('.chips-antecedentes-familiares');
  CIMA_DATA.ANTECEDENTES.forEach(a => antPersContainer.appendChild(createChip(a)));
  CIMA_DATA.ANTECEDENTES.forEach(a => antFamContainer.appendChild(createChip(a)));
  
  // 3. Examen Físico: Cara y Cuello (Listas planas)
  const caraContainer = wrap.querySelector('.chips-exam-cara');
  CIMA_DATA.PHYSICAL_EXAM.Cara.forEach(i => caraContainer.appendChild(createChip(i)));
  
  const cuelloContainer = wrap.querySelector('.chips-exam-cuello');
  CIMA_DATA.PHYSICAL_EXAM.Cuello.forEach(i => cuelloContainer.appendChild(createChip(i)));

  // 4. Examen Físico: Oídos, Nariz, Orofaringe (Listas agrupadas)
  // Oído Derecho
  const odContainer = wrap.querySelector('.chips-exam-oido-derecho');
  Object.entries(CIMA_DATA.PHYSICAL_EXAM["Oído Derecho"]).forEach(([group, items]) => {
      createChipGroup(group, items, odContainer);
  });
  // Oído Izquierdo
  const oiContainer = wrap.querySelector('.chips-exam-oido-izquierdo');
  Object.entries(CIMA_DATA.PHYSICAL_EXAM["Oído Izquierdo"]).forEach(([group, items]) => {
      createChipGroup(group, items, oiContainer);
  });
  // Nariz
  const narizContainer = wrap.querySelector('.chips-exam-nariz');
  Object.entries(CIMA_DATA.PHYSICAL_EXAM.Nariz).forEach(([group, items]) => {
      createChipGroup(group, items, narizContainer);
  });
  // Orofaringe
  const oroContainer = wrap.querySelector('.chips-exam-orofaringe');
  Object.entries(CIMA_DATA.PHYSICAL_EXAM.Orofaringe).forEach(([group, items]) => {
      createChipGroup(group, items, oroContainer);
  });

  // 5. Estudios (Chips dinámicos)
  const studiesContainer = wrap.querySelector('.chips-studies');
  Object.keys(CIMA_DATA.STUDIES).forEach(studyName => {
      studiesContainer.appendChild(createChip(studyName, 'study'));
  });

  // 6. Estudios Adicionales (Textareas)
  const addStudiesContainer = wrap.querySelector('.additional-studies-container');
  CIMA_DATA.ADDITIONAL_STUDIES.forEach(studyName => {
    const studyDiv = document.createElement('div');
    studyDiv.style.marginBottom = '12px';
    studyDiv.innerHTML = `
      <div style="font-weight: 600; color: #94a3b8; margin-bottom: 4px;">${studyName}</div>
      <textarea class="form-input txt-study-${studyName.toLowerCase().replace(/ /g, '-')}" rows="2" placeholder="Conclusión ${studyName}..."></textarea>
    `;
    addStudiesContainer.appendChild(studyDiv);
  });

  // 7. Diagnósticos (DX)
  const dxContainer = wrap.querySelector('.chips-dx');
  CIMA_DATA.DX.forEach(d => dxContainer.appendChild(createChip(d)));

  // 8. Recipe (Agrupado)
  const recipeContainer = wrap.querySelector('.recipe-chips-container');
  Object.entries(CIMA_DATA.RECIPE_MEDS).forEach(([group, meds]) => {
    // Usamos la clase recipe-chips-group para identificarla en recipe-indicaciones.js
    const groupDiv = document.createElement('div');
    groupDiv.style.marginBottom = '12px';
    groupDiv.innerHTML = `
      <div style="font-weight: 600; color: #60a5fa; margin: 8px 0;">${group}</div>
      <div class="chips recipe-chips-group" data-group="${group}"></div>
    `;
    const chipsBox = groupDiv.querySelector('.chips');
    meds.forEach(med => chipsBox.appendChild(createChip(med)));
    recipeContainer.appendChild(groupDiv);
  });

  // --- EVENT LISTENERS ESPECÍFICOS DE LA TARJETA ---

  // Toggle de colapso de tarjeta
  wrap.querySelector('.visit-toggle-btn').addEventListener('click', () => {
    const body = wrap.querySelector('.visit-body');
    const icon = wrap.querySelector('.visit-toggle-btn i');
    body.classList.toggle('hidden');
    icon.className = body.classList.contains('hidden') ? 'bi bi-chevron-right' : 'bi bi-chevron-down';
  });

  // Toggle de contenido de Estudios
  wrap.querySelectorAll('.chips-studies .chip').forEach(chipEl => {
    chipEl.addEventListener('click', function() {
      const studyName = this.textContent;
      const studiesContent = wrap.querySelector(`#studies-content-${cardId}`);
      const studyId = `study-${studyName.toLowerCase().replace(/ /g, '-')}-${cardId}`;
      
      // La clase 'on' ya se toggles en el helper createChip, aquí solo reaccionamos
      // Nota: Como el evento click dispara antes que nuestro custom event, verificamos estado del DOM
      // Sin embargo, usaremos el custom event global para mayor seguridad o lógica directa aquí
      
      // Lógica de toggle visual del área de estudio
      // Pequeño timeout para permitir que la clase 'on' se actualice primero visualmente
      setTimeout(() => {
        const isOn = this.classList.contains('on');
        
        if (isOn) {
           if (!document.getElementById(studyId)) {
               const studyDiv = document.createElement('div');
               studyDiv.id = studyId;
               studyDiv.className = 'study-content';
               studyDiv.innerHTML = `
                 <div style="font-weight: 700; color: #60a5fa; margin-bottom: 12px;">${studyName}</div>
                 <label class="form-label">Conclusión ${studyName}</label>
                 <textarea class="form-input txt-study-${studyName.toLowerCase().replace(/ /g, '-')}" rows="3" placeholder="Conclusión..."></textarea>
                 <div class="study-chips-container" style="margin-top: 12px;"></div>
               `;
               const subChipsContainer = studyDiv.querySelector('.study-chips-container');
               Object.entries(CIMA_DATA.STUDIES[studyName]).forEach(([groupName, items]) => {
                  createChipGroup(groupName, items, subChipsContainer);
               });
               studiesContent.appendChild(studyDiv);
           }
        } else {
           const studyDiv = document.getElementById(studyId);
           if (studyDiv) studyDiv.remove();
        }
      }, 0);
    });
  });

  // Listeners de actualización de texto al tocar chips (Motivos, DX, Antecedentes, Examen Físico)
  // Helper para actualizar inputs desde chips
  const updateInputFromChips = (inputSel, chipContainerSel) => {
    const input = wrap.querySelector(inputSel);
    if (!input || input.dataset.userEdited === '1') return; // Respetar edición manual
    
    // Obtener chips 'on'
    const chips = Array.from(wrap.querySelectorAll(`${chipContainerSel} .chip.on`));
    
    // Si es examen físico agrupado, el formato es "Grupo: item, item"
    // Verificamos si los chips están dentro de grupos
    const isGrouped = wrap.querySelector(chipContainerSel).querySelector('.chip-group');
    
    if (isGrouped) {
        const groupedText = {};
        chips.forEach(c => {
            const gTitle = c.closest('.chip-group').querySelector('.chip-group-title').textContent;
            if(!groupedText[gTitle]) groupedText[gTitle] = [];
            groupedText[gTitle].push(c.textContent);
        });
        let text = "";
        Object.entries(groupedText).forEach(([g, items]) => {
            text += `${g}: ${items.join(', ')}\n`;
        });
        input.value = text.trim();
    } else {
        // Lista plana separada por comas
        input.value = chips.map(c => c.textContent).join(', ');
    }
  };

  // Asignar listeners globales a la tarjeta para delegación
  wrap.addEventListener('chip-toggle', (e) => {
      const target = e.target;
      
      if (target.closest('.chips-motivo')) updateInputFromChips('.txt-motivo', '.chips-motivo');
      if (target.closest('.chips-dx')) updateInputFromChips('.txt-dx', '.chips-dx');
      if (target.closest('.chips-antecedentes-personales')) updateInputFromChips('.txt-antecedentes-personales', '.chips-antecedentes-personales');
      if (target.closest('.chips-antecedentes-familiares')) updateInputFromChips('.txt-antecedentes-familiares', '.chips-antecedentes-familiares');
      
      // Examen Físico
      if (target.closest('.chips-exam-cara')) updateInputFromChips('.txt-exam-cara', '.chips-exam-cara');
      if (target.closest('.chips-exam-oido-derecho')) updateInputFromChips('.txt-exam-oido-derecho', '.chips-exam-oido-derecho');
      if (target.closest('.chips-exam-oido-izquierdo')) updateInputFromChips('.txt-exam-oido-izquierdo', '.chips-exam-oido-izquierdo');
      if (target.closest('.chips-exam-nariz')) updateInputFromChips('.txt-exam-nariz', '.chips-exam-nariz');
      if (target.closest('.chips-exam-orofaringe')) updateInputFromChips('.txt-exam-orofaringe', '.chips-exam-orofaringe');
      if (target.closest('.chips-exam-cuello')) updateInputFromChips('.txt-exam-cuello', '.chips-exam-cuello');

      // Recipe e Indicaciones (Importado de otro módulo)
      if (target.closest('.recipe-chips-container')) {
          updateRecipeTextbox(wrap);
          updateIndicacionesSection(wrap);
      }
  });

  // Marcar inputs como editados manualmente para no sobrescribir
  wrap.querySelectorAll('textarea, input[type="text"]').forEach(input => {
      input.addEventListener('input', () => input.dataset.userEdited = '1');
  });

  return wrap;

}
