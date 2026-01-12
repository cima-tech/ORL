/* consultmodels/ORL-001.js */

/*
  [GLOSARIO-ORL]
  ORL_DATA -> Constantes de catálogos médicos (Masivo)
  ORL_UI -> Lógica de manipulación DOM específica de la consulta
  ORL_DOCS -> Generadores de estructura de documentos
*/

// [JS-ORL-001] DATOS Y CATÁLOGOS
// NOTA: Si el chat cortó esta sección, copia y pega tu bloque ORL_DATA original (medicamentos y diagnósticos) aquí, antes de `ORL_UI`.
const ORL_DATA = {
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

    STUDIES: {"Nasofibrolaringoscopia":{"Fosas Nasales":["Permeables","No Permeables"],"Correderas Nasales":["Sin Rinorrea","Rinorrea Blanca Escasa","Rinorrea Blanca Moderada","Rinorrea Blanca Abundante","Rinorrea Hialina Escasa","Rinorrea Hialina Moderada","Rinorrea Hialina Abundante","Rinorrea Amarilla Escasa","Rinorrea Amarilla Moderada","Rinorrea Amarilla Abundante","Rinorrea Verde Escasa","Rinorrea Verde Moderada","Rinorrea Verde Abundante"],"Tabique":["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Levoconvexa Con Espolón Oseo Derecho","Levoconvexa Con Espolón Oseo Izquierdo","Dextroconvexa Con Espolón Oseo Derecho","Dextroconvexa Con Espolón Oseo Izquierdo","Central Con Espolón Óseo Derecho","Central Con Espolón Óseo Izquierdo"],"Cornete Inferior Derecho":["Eutrófico","Hipertrófico","Polipoide"],"Cornete Medio Derecho":["Eutrófico","Hipertrófico","Polipoide"],"Meato Medio Derecho":["Libre","Comprometido"],"Coana Derecha":["Permeable","No Permeable"],"Cornete Inferior Izquierdo":["Eutrófico","Hipertrófico","Polipoide"],"Cornete Medio Izquierdo":["Eutrófico","Hipertrófico","Polipoide"],"Meato Medio Izquierdo":["Libre","Comprometido"],"Coana Izquierda":["Permeable","No Permeable"],"Paladar":["Con Cierre Coronal","Competente","Incompetente"],"Adenoides":["Ausentes","Leves","Moderadas","Severas"],"Rinofaringe":["Indemne","Congestiva Granulosa","Granulosa","Con Rinorrea Posterior Blanca Escasa","Con Rinorrea Posterior Hialina Escasa","Con Rinorrea Posterior Amarilla Escasa","Con Rinorrea Posterior Verde Escasa","Con Rinorrea Posterior Blanca Moderada","Con Rinorrea Posterior Hialina Moderada","Con Rinorrea Posterior Amarilla Moderada","Con Rinorrea Posterior Verde Moderada","Con Rinorrea Posterior Blanca Abundante","Con Rinorrea Posterior Hialina Abundante","Con Rinorrea Posterior Amarilla Abundante","Con Rinorrea Posterior Verde Abundante"],"Base De Lengua":["Sin Lesiones","Con Loe"],"Senos Piriformes":["Indemnes","Seno Piriforme Derecho Con Loe","Seno Piriforme Derecho Sin Lesiones","Seno Piriforme Izquierdo Con Loe","Seno Piriforme Izquierdo Sin Lesiones"],"Valleculas":["Indemnes","Vallecula Derecha Con Loe","Vallecula Derecha Sin Lesiones","Vallecula Izquierda Con Loe","Vallecula Izquierda Sin Lesiones"],"Epiglotis":["Indemne Erecta","Móvil","Eritematosa","En Omega"],"Bandas Ventriculares":["Indemnes","Hipertróficas","Con Loe"],"Cuerda Vocal Derecha":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],"Cuerda Vocal Izquierda":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],"Cierre Glótico":["Completo","Incompleto En Huso","Incompleto Irregular","En Reloj De Arena","Con Hiato Anterior","Con Hiato Posterior"],"Subglotis":["Permeable 100%","Estenosis Subglótica Cotton I","Estenosis Subglótica Cotton Ii","Estenosis Subglótica Cotton Iii"],"Mucosa":["Indemne","Eritematosa","Pálida","Con Plexo Derecho Friable","Con Plexo Izquierdo Friable"]},"Endoscopia Nasal":{"Fosas Nasales":["Permeables","No Permeables"],"Tabique":["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Levoconvexa Con Espolón Oseo Derecho","Levoconvexa Con Espolón Oseo Izquierdo","Dextroconvexa Con Espolón Oseo Derecho","Dextroconvexa Con Espolón Oseo Izquierdo","Central Con Espolón Óseo Derecho","Central Con Espolón Óseo Izquierdo"],"Cornete Medio Derecho":["Eutrófico","Hipertrófico","Polipoide","Concha Media Bullosa Derecha","Paradójico Derecho"],"Cornete Medio Izquierdo":["Eutrófico","Hipertrófico","Polipoide","Concha Media Bullosa Izquierda","Paradójico Izquierdo"],"Meato Medio Derecho":["Libre","Comprometido"],"Meato Medio Izquierdo":["Libre","Comprometido"],"Coana Derecha":["Permeable","No Permeable"],"Coana Izquierda":["Permeable","No Permeable"],"Sinusopatía":["Sin Sinusopatía","Con Sinusopatía Maxilar Derecha","Con Sinusopatía Maxilar Izquierda","Con Sinusopatía Frontal Derecha","Con Sinusopatía Frontal Izquierda","Con Sinusopatía Etmoidal Anterior Derecha","Con Sinusopatía Etmoidal Anterior Izquierda","Con Sinusopatía Etmoidal Posterior Derecha","Con Sinusopatía Etmoidal Posterior Izquierda","Con Sinusopatía Esfenoidal Anterior Derecha","Con Sinusopatía Esfenoidal Anterior Izquierda","Con Sinusopatía Maxiloetmoidal Derecha","Con Sinusopatía Maxiloetmoidal Izquierda"]},"Telelaringoscopia":{"Cierre Glótico":["Completo","Incompleto En Huso","Incompleto Irregular","En Reloj De Arena","Con Hiato Anterior","Con Hiato Posterior"],"Bandas Ventriculares":["Indemnes","Hipertróficas","Con Loe"],"Cuerda Vocal Derecha":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],"Cuerda Vocal Izquierda":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],"Subglotis":["Permeable 100%","Estenosis Cotton I","Estenosis Cotton Ii","Estenosis Cotton Iii"]},"Impedanciometría":{"Oído Derecho":["Curva Tipo A","Curva Tipo As","Curva Tipo B","Curva Tipo C"],"Oído Izquierdo":["Curva Tipo A","Curva Tipo As","Curva Tipo B","Curva Tipo C"]},"Tomografía de Oído":{"Cae Derecho":["Permeable","No Permeable"],"Om Derecho":["Neumatizado","Con Velamiento"],"Scutum Derecho":["Indemne","Amputado"],"Co Derecha":["Cadena Osicular Indemne","Cadena Osicular Alterada"],"Mastoides Derecha":["Neumatizada","Poco Neumatizada","Velada Completamente"],"Cóclea Derecha":["Indemne Con 2 Vueltas Y Media","Con Malformación","Impresiona","Osificada"],"Cai Derecho":["Indemne","Hipoplásico","Con Loe"],"Cae Izquierdo":["Permeable","No Permeable"],"Om Izquierdo":["Neumatizado","Con Velamiento"],"Scutum Izquierdo":["Indemne","Amputado"],"Co Izquierda":["Cadena Osicular Indemne","Cadena Osicular Alterada"],"Mastoides Izquierda":["Neumatizada","Poco Neumatizada","Velada Completamente"],"Cóclea Izquierda":["Indemne Con 2 Vueltas Y Media","Con Malformación","Impresiona","Osificada"],"Cai Izquierdo":["Indemne","Hipoplásico","Con Loe"]},"Tomografía de Nariz y SPN":{"Tabique":["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Espolón Óseo Derecho","Espolón Óseo Izquierdo"],"Cornetes":["Eutróficos","Hipertróficos","Polipoides","Concha Media Bullosa Derecha","Concha Media Bullosa Izquierda","Cornete Medio Paradójico Derecho","Cornete Medio Paradójico Izquierdo"],"Meato Medio Derecho":["Libre","Comprometido"],"Meato Medio Izquierdo":["Libre","Comprometido"],"Coana Derecha":["Permeable","No Permeable"],"Coana Izquierda":["Permeable","No Permeable"],"Sinusopatía":["Sin Sinusopatía","Con Sinusopatía Maxilar Derecha","Con Sinusopatía Maxilar Izquierda","Con Sinusopatía Frontal Derecha","Con Sinusopatía Frontal Izquierda","Con Sinusopatía Etmoidal Anterior Derecha","Con Sinusopatía Etmoidal Anterior Izquierda","Con Sinusopatía Etmoidal Posterior Derecha","Con Sinusopatía Etmoidal Posterior Izquierda","Con Sinusopatía Esfenoidal Anterior Derecha","Con Sinusopatía Esfenoidal Anterior Izquierda","Con Sinusopatía Maxiloetmoidal Derecha","Con Sinusopatía Maxiloetmoidal Izquierda"]},"Audiometría":{},"Timpanometría":{},"Acufenometría":{},"Prueba de Prótesis Auditiva":{},"PEATC":{},"Estudio de Sueño":{},"Resonancia de Nariz y SPN":{},"Protocolo de Implante Coclear":{}},
    
    PHYSICAL_EXAM: {"Cara":{"Simetría":["Simetría Facial","Asimetría Facial","Parálisis Facial Periférica","Parálisis Facial Periférica derecha","Parálisis Facial Periférica izquierda","Parálisis Facial Central","Edema Facial","Malformación Craneofacial"]},"Oído Derecho":{"Oído Externo":["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],"Conducto Auditivo Externo":["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],"Oído Medio":["Membrana Timpánica"],"Membrana Timpánica":["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpánico amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]},"Oído Izquierdo":{"Oído Externo":["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],"Conducto Auditivo Externo":["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],"Oído Medio":["Membrana Timpánica"],"Membrana Timpánica":["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]},"Nariz":{"Fosa Nasal":["Fosa nasal permeable","LOE","LOE que obstruye compleamente fosa nasal izquierda","LOE que obstruye completamente fosa nasal derecha"],"Tabique":["Central","con desviación Dextroconvexa","con desviación Levoconvexa","con espolón óseo"],"Cornetes":["Cornete inferior eutrófico","Cornete inferior hipertrófico obstructivo","Cornete inferior con degeneración polipoidea","Cornete medio eutrófico","Cornete medio hipertrófico","Poliposis nasal"],"Mucosa":["Mucosa Indemne","Mucosa Pálida","Mucosa Eritematosa a nivel de Plexos","Epistaxis Anterior","Epistaxis Posterior"],"Rinorrea":["Rinorrea Hialina","Rinorrea Blanquecina","Rinorrea Amarillenta"]},"Orofaringe":{"Lengua":["Lengua húmeda móvil","Lengua seca"],"Tonsilas":["Tonsilas grado I","Tonsilas grado II","Tonsilas grado III","Tonsilas grado IV","Tonsilas asimétricas","Tonsilas con placas blanquecinas"],"Rinofaringe":["congestiva","con rinorrea posterior escasa","con rinorrea posterior blanquecina","con placas blanquecinas"]},"Cuello":{"Aspecto":["Móvil, sin lesiones aparentes"]}}
};
// [JS-ORL-002] LÓGICA DE UI DE CONSULTA
const ORL_UI = {
    activeIndications: {},

    init: function(container) {
        this.container = container;
        this.renderChips('.chips-motivo', ORL_DATA.MOTIVOS, '.txt-motivo');
        this.renderChips('.chips-ap', ORL_DATA.ANTECEDENTES, '.txt-ap');
        this.renderChips('.chips-af', ORL_DATA.ANTECEDENTES, '.txt-af');
        this.renderChips('.chips-dx', ORL_DATA.DX, '.txt-dx');
        this.renderPhysicalExam();
        this.renderRecipeChips();
        this.initEA();
    },

    initEA: function() {
        const eaInput = this.container.querySelector('.txt-ea');
        if(eaInput && !eaInput.value) {
            const sex = document.querySelector('[name="demografia.genero"]')?.value || '[sexo]';
            const birthDate = document.querySelector('[name="demografia.fecha_nacimiento"]')?.value;
            const age = this.calculateAge(birthDate);
            const ageStr = (age || age === 0) ? `${age} años` : '[edad]';
            eaInput.value = `Paciente ${sex} de ${ageStr} quien acude a consulta por presentar...`;
        }
    },

    calculateAge: function(birthDateString) {
        if(!birthDateString) return null;
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    },

    // [FIX CHIPS DUPLICADOS] Lógica Inteligente de Chips
    updateTextInput: function(selector, text, isAdding) {
        const input = this.container.querySelector(selector);
        if (!input) return;
        
        // 1. Convertir texto actual a array limpio
        let currentValues = input.value.split(',')
            .map(v => v.trim())
            .filter(v => v !== ''); 

        // 2. Lógica según acción
        if (isAdding) {
            // Si el texto ya existe, NO hacer nada (evitar duplicados)
            if (!currentValues.includes(text)) {
                currentValues.push(text);
                input.value = currentValues.join(', ');
            }
        } else {
            // Remover: filtrar el texto que queremos quitar
            currentValues = currentValues.filter(val => val !== text);
            input.value = currentValues.join(', ');
        }
    },

    renderChips: function(containerSelector, dataArray, targetInputSelector) {
        const container = this.container.querySelector(containerSelector);
        if (!container) return;
        container.innerHTML = '';

        dataArray.forEach(text => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.style.cssText = "padding:5px 10px; background:var(--accent-blue); color:white; border-radius:15px; cursor:pointer; display:inline-block; margin-right:5px; font-size:0.85rem;";
            chip.textContent = text;
            chip.onclick = () => {
                chip.classList.toggle('on');
                // Lógica corregida (no escribir doble)
                if (targetInputSelector) {
                    this.updateTextInput(targetInputSelector, text, chip.classList.contains('on'));
                }
            };
            container.appendChild(chip);
        });
    },

    renderPhysicalExam: function() {
        const container = this.container.querySelector('.pe-panels');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(ORL_DATA.PHYSICAL_EXAM).forEach(([section, subSections]) => {
            const secDiv = document.createElement('div');
            secDiv.className = 'glass-panel pe-section';
            secDiv.style.marginTop = "10px";
            secDiv.style.padding = "15px"; // Padding interno para que quede bonito
            secDiv.innerHTML = `<div style="font-weight:700; color:var(--accent-blue); margin-bottom:10px;">${section}</div>`;

            Object.entries(subSections).forEach(([subKey, chips]) => {
                const subDiv = document.createElement('div');
                subDiv.className = 'input-row';
                subDiv.style.marginBottom = "10px";
                subDiv.innerHTML = `<div class="col small" style="font-weight:600; color:var(--text-secondary);">${subKey}</div><div class="col chips" style="margin-top:5px;"></div>`;
                
                const chipsContainer = subDiv.querySelector('.chips');
                // Mantenemos la lógica del Trigger Oído Medio si existía, pero por ahora simplificamos
                chips.forEach(chipText => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.textContent = chipText;
                    chip.style.cssText = "padding:4px 8px; background:var(--color-glass-heavy); border:1px solid var(--color-border); color:var(--color-text); border-radius:8px; cursor:pointer; display:inline-block; margin-right:5px; font-size:0.75rem;";
                    chip.onclick = () => chip.classList.toggle('on');
                    chipsContainer.appendChild(chip);
                });
                secDiv.appendChild(subDiv);
            });
            container.appendChild(secDiv);
        });
    },

    renderRecipeChips: function() {
        const container = this.container.querySelector('.recipe-chips-container');
        if (!container) return;

        Object.entries(ORL_DATA.RECIPE_MEDS).forEach(([category, meds]) => {
            const group = document.createElement('div');
            group.className = 'glass-panel';
            group.style.padding = "10px";
            group.style.marginBottom = "10px";
            group.innerHTML = `<div class="small" style="font-weight:700; color:var(--accent-blue); margin-bottom:5px;">${category}</div><div class="chips"></div>`;
            const chipBox = group.querySelector('.chips');

            meds.forEach(med => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = med;
                chip.style.cssText = "padding:5px 10px; background:var(--accent-blue); color:white; border-radius:8px; cursor:pointer; display:inline-block; margin-right:5px; font-size:0.8rem;";
                chip.onclick = () => {
                    chip.classList.toggle('on');
                    this.handleMedSelection(med, category, chip.classList.contains('on'));
                };
                chipBox.appendChild(chip);
            });
            container.appendChild(group);
        });
    },

    handleMedSelection: function(medName, category, isSelected) {
        const txtRecipe = this.container.querySelector('.txt-recipe');
        if (txtRecipe) {
            const current = txtRecipe.value.split('\n').filter(Boolean);
            if (isSelected) {
                current.push(medName);
            } else {
                const idx = current.indexOf(medName);
                if (idx > -1) current.splice(idx, 1);
            }
            txtRecipe.value = current.join('\n');
        }

        const indContainer = this.container.querySelector('.indicaciones-dropdowns');
        if (!indContainer) return;

        if (isSelected) {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';
            wrapper.style.marginBottom = "10px";
            wrapper.id = `ind-wrap-${medName.replace(/\s/g, '')}`;
            
            const label = document.createElement('label');
            label.className = 'small';
            label.textContent = medName;
            
            const select = document.createElement('select');
            select.className = 'indicacion-select';
            select.dataset.med = medName;
            select.style.cssText = "width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:5px; border-radius:4px;";
            select.innerHTML = '<option value="">-- Seleccione indicación --</option>';
            
            const options = ORL_DATA.INDICACIONES_OPTIONS[category] || ORL_DATA.INDICACIONES_OPTIONS["Otros"];
            options.forEach(opt => {
                const el = document.createElement('option');
                el.value = opt;
                el.textContent = opt;
                select.appendChild(el);
            });

            select.onchange = () => this.syncIndicationsToText();
            wrapper.appendChild(label);
            wrapper.appendChild(select);
            indContainer.appendChild(wrapper);

        } else {
            const el = this.container.querySelector(`#ind-wrap-${medName.replace(/\s/g, '')}`);
            if (el) el.remove();
            this.syncIndicationsToText();
        }
    },

    syncIndicationsToText: function() {
        const txtInd = this.container.querySelector('.txt-indicaciones');
        const txtPlan = this.container.querySelector('.txt-plan');
        
        const dropdowns = this.container.querySelectorAll('.indicacion-select');
        let lines = [];
        
        dropdowns.forEach(dd => {
            if (dd.value) {
                lines.push(`${dd.dataset.med}: ${dd.value}`);
            }
        });
        
        const finalText = lines.join('\n\n');
        
        if (txtInd) txtInd.value = finalText;
        
        if (txtPlan) {
            const footer = "\n\nAvisar eventualidad si persisten síntomas a pesar del Tratamiento indicado o empeoramiento de síntomas al 0212-5086321 / 0424-1090979 o acudir a la Emergencia.";
            txtPlan.value = finalText + (finalText ? footer : '');
        }
    }
};

// [JS-ORL-003] GENERADORES DE DOCUMENTOS
const ORL_DOCS = {
    getContext: function() {
        const getVal = (path) => {
            const el = document.querySelector(`[name="${path}"]`);
            return el ? el.value : '';
        };

        return {
            paciente: {
                nombre: getVal('nombres.primer_nombre') + ' ' + getVal('nombres.primer_apellido'),
                ci: getVal('identificacion.documento_numero'),
                edad: ORL_UI.calculateAge(getVal('demografia.fecha_nacimiento')),
                fecha: new Date().toLocaleDateString()
            },
            consulta: {
                dx: document.querySelector('.txt-dx')?.value,
                plan: document.querySelector('.txt-plan')?.value,
                recipe: document.querySelector('.txt-recipe')?.value,
                indicaciones: document.querySelector('.txt-indicaciones')?.value
            }
        };
    },

    generateInf: function() {
        const ctx = this.getContext();
        return {
            type: 'INF',
            title: 'INFORME MÉDICO',
            orientation: 'portrait',
            content: {
                motivo: document.querySelector('.txt-motivo')?.value,
                ea: document.querySelector('.txt-ea')?.value,
                dx: ctx.consulta.dx,
                plan: ctx.consulta.plan
            }
        };
    },
    generateRpInd: function() {
        const ctx = this.getContext();
        return {
            type: 'RP',
            title: 'RECIPE E INDICACIONES',
            orientation: 'landscape',
            layout: 'split',
            leftCol: { title: 'Rp.', content: ctx.consulta.recipe },
            rightCol: { title: 'Indicaciones', content: ctx.consulta.indicaciones }
        };
    }
};
// [PUENTE-CONTRATO] CONEXIÓN CON INDEX.JS
// Este bloque conecta tu lógica existente con el nuevo sistema modular

export const MODEL_DEFINITION = {
    id: "ORL-001",
    name: "Consulta ORL (Otorrinolaringología)",
    
    // [REESTRUCTURACIÓN FINAL] INICIALIZACIÓN UI
    initUI: function(container, data = {}) {
      // Si estamos creando una nueva consulta y hay consultas anteriores
    if (!data.id && data.inheritPrevious) {
        // Aquí se cargarían los datos de la última consulta
        // y se pre-llenarían los campos
    }
    // ... resto del código existente
}  
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
            </div>

            <!-- SECCIÓN 2: ANTECEDENTES -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
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

            <!-- SECCIÓN 3: EXAMEN FÍSICO (SIEMPRE VISIBLE) -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-stethoscope"></i> Examen Físico ORL
                </div>
                <div class="pe-panels"></div>
            </div>

            <!-- SECCIÓN 4: ESTUDIOS EN CONSULTA -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                 <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-x-ray"></i> Estudios Solicitados / Realizados
                </div>
                 <div class="input-group" style="width:100%;">
                    <!-- Campo de estudios simplificado por ahora -->
                    <textarea id="txt-studies" rows="4" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Detalles de estudios (Ej: Nasofibrolaringoscopia, Audiometría)..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 5: DIAGNÓSTICO -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Diagnóstico (*)</label>
                    <input type="text" class="txt-dx" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Diagnóstico presuntivo...">
                    <div class="chips-container chips-dx" style="margin-top:10px;"></div>
                </div>
            </div>

            <!-- SECCIÓN 6: PLAN Y TRATAMIENTO -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Plan y Tratamiento (*)</label>
                    <textarea class="txt-plan" rows="6" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Plan de manejo, indicaciones generales..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 7: RECETA E INDICACIONES (DINÁMICAS) -->
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

        // 1. Ahora SÍ ejecutamos tu lógica original (chips, eventos)
        ORL_UI.init(container);

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
            setVal('#txt-studies', data.estudios);
            setVal('.txt-plan', data.plan);
            setVal('.txt-recipe', data.recipe);
            setVal('.txt-indicaciones', data.indicaciones);
        }
    },
    
    // 2. Obtener Datos: Extrae la info del DOM que tú pintaste
    getData: function(container) {
        const getVal = (sel) => container.querySelector(sel)?.value || '';
        
        return {
            ea: getVal('.txt-ea'),
            motivo: getVal('.txt-motivo'),
            ap: getVal('.txt-ap'), // Antecedentes personales
            af: getVal('.txt-af'), // Antecedentes familiares
            dx: getVal('.txt-dx'),
            estudios: getVal('#txt-studies'),
            plan: getVal('.txt-plan'),
            recipe: getVal('.txt-recipe'),
            indicaciones: getVal('.txt-indicaciones')
        };
    },
    
    // 3. Validar: Chequeos básicos antes de guardar
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
        return null; // Todo OK
    },
    
    // 4. Resumen: Texto corto para la lista principal
    getSummary: function(data) {
        return data.motivo || data.dx || "Consulta ORL";
    }
};

export const ORL_MODULE = {
    DATA: ORL_DATA,
    UI: ORL_UI,
    DOCS: ORL_DOCS
};

/* consultmodels/ORL-001.js - Con generador de documentos */
// ... (mantener todo el código ORL_DATA, ORL_UI, ORL_DOCS existente)

const DOCUMENT_GENERATOR = {
    generateInforme: function(context, userData) {
        return `
            <div class="document informe">
                <!-- Header con logo y datos del médico -->
                <div class="document-header">
                    ${userData.professional.branding.headerUrl ? 
                        `<img src="user/${userData.id}/layout/${userData.professional.branding.headerUrl}" class="doc-header-img">` : 
                        `<h1>${userData.professional.titlePrefix} ${userData.identity.names} ${userData.identity.lastNames}</h1>
                         <h3>${userData.professional.specialty} - ${userData.professional.medicalAssociationNumber}</h3>`
                    }
                </div>
                
                <!-- Datos del paciente -->
                <div class="patient-data">
                    <h4>INFORME MÉDICO</h4>
                    <table>
                        <tr><td>Paciente:</td><td><strong>${context.paciente.nombre}</strong></td></tr>
                        <tr><td>C.I.:</td><td>${context.paciente.ci}</td></tr>
                        <tr><td>Edad:</td><td>${context.paciente.edad} años</td></tr>
                        <tr><td>Fecha:</td><td>${context.paciente.fecha}</td></tr>
                    </table>
                </div>
                
                <!-- Contenido de la consulta -->
                <div class="consultation-content">
                    <h4>MOTIVO DE CONSULTA</h4>
                    <p>${context.consulta.motivo || 'No especificado'}</p>
                    
                    <h4>ENFERMEDAD ACTUAL</h4>
                    <p>${context.consulta.ea || 'No especificado'}</p>
                    
                    <h4>DIAGNÓSTICO</h4>
                    <p>${context.consulta.dx || 'No especificado'}</p>
                    
                    <h4>PLAN Y TRATAMIENTO</h4>
                    <p>${context.consulta.plan || 'No especificado'}</p>
                </div>
                
                <!-- Firma y sello -->
                <div class="document-footer">
                    <div class="signature-area" id="signatureArea">
                        ${userData.professional.branding.signatureUrl ? 
                            `<img src="user/${userData.id}/layout/${userData.professional.branding.signatureUrl}" class="doc-signature">` :
                            `<p>_________________________</p>
                             <p>${userData.professional.titlePrefix} ${userData.identity.names} ${userData.identity.lastNames}</p>`
                        }
                    </div>
                    <div class="stamp-area" id="stampArea">
                        ${userData.professional.branding.stampUrl ? 
                            `<img src="user/${userData.id}/layout/${userData.professional.branding.stampUrl}" class="doc-stamp">` : ''
                        }
                    </div>
                </div>
                
                <!-- Footer -->
                ${userData.professional.branding.footerUrl ? 
                    `<img src="user/${userData.id}/layout/${userData.professional.branding.footerUrl}" class="doc-footer-img">` : 
                    `<div class="doc-footer-text">
                        <p>${userData.contacto?.telefono || ''} | ${userData.contacto?.email || ''}</p>
                    </div>`
                }
            </div>
        `;
    },
    
    generateRecipeIndicaciones: function(context, userData) {
        return `
            <div class="document recipe-landscape">
                <!-- Layout horizontal dividido -->
                <div class="recipe-container">
                    <div class="recipe-left">
                        <h4>RECIPE MÉDICO</h4>
                        <div class="recipe-content">
                            ${context.consulta.recipe ? 
                                context.consulta.recipe.split('\n').map(line => `<p>${line}</p>`).join('') : 
                                '<p>No se prescribieron medicamentos</p>'
                            }
                        </div>
                    </div>
                    <div class="recipe-right">
                        <h4>INDICACIONES</h4>
                        <div class="indicaciones-content">
                            ${context.consulta.indicaciones ? 
                                context.consulta.indicaciones.split('\n').map(line => `<p>${line}</p>`).join('') : 
                                '<p>Sin indicaciones específicas</p>'
                            }
                        </div>
                    </div>
                </div>
                
                <!-- Datos comunes -->
                <div class="recipe-footer">
                    <p><strong>Paciente:</strong> ${context.paciente.nombre} | <strong>C.I.:</strong> ${context.paciente.ci}</p>
                    <p><strong>Fecha:</strong> ${context.paciente.fecha}</p>
                    
                    <div class="recipe-signature">
                        ${userData.professional.branding.signatureUrl ? 
                            `<img src="user/${userData.id}/layout/${userData.professional.branding.signatureUrl}" class="doc-signature-small">` :
                            `<p>_________________________</p>`
                        }
                        <p>${userData.professional.titlePrefix} ${userData.identity.names} ${userData.identity.lastNames}</p>
                        <p>${userData.professional.medicalAssociationNumber}</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ... métodos para los otros 4 tipos de documentos
};

// Actualizar MODEL_DEFINITION para incluir documentos
export const MODEL_DEFINITION = {
    id: "ORL-001",
    name: "Consulta ORL (Otorrinolaringología)",
    
    initUI: function(container, data = {}) {
        // ... (mantener código existente)
    },
    
    getData: function(container) {
        // ... (mantener código existente)
    },
    
    getDocuments: function(consultationData, patientData, userData) {
        const context = {
            paciente: {
                nombre: `${patientData.nombres.primer_nombre} ${patientData.nombres.primer_apellido}`,
                ci: patientData.identificacion.documento_numero,
                edad: patientData.demografia.edad_auto,
                fecha: new Date().toLocaleDateString('es-ES')
            },
            consulta: consultationData,
            medico: {
                nombre: `${userData.identity.names} ${userData.identity.lastNames}`,
                titulo: userData.professional.titlePrefix,
                especialidad: userData.professional.specialty,
                registro: userData.professional.medicalAssociationNumber
            }
        };
        
        return {
            informe: DOCUMENT_GENERATOR.generateInforme(context, userData),
            recipe: DOCUMENT_GENERATOR.generateRecipeIndicaciones(context, userData),
            laboratorio: DOCUMENT_GENERATOR.generateLaboratorio(context, userData),
            quirurgica: DOCUMENT_GENERATOR.generateQuirurgica(context, userData),
            referencia: DOCUMENT_GENERATOR.generateReferencia(context, userData),
            constancia: DOCUMENT_GENERATOR.generateConstancia(context, userData)
        };
    }
};

/* [FIN DEL ARCHIVO ORL-001.js] */


