/* consultmodels/ORL-001.js */

/*
  [GLOSARIO-ORL]
  ORL_DATA -> Constantes de catálogos médicos
  ORL_UI -> Lógica de manipulación DOM específica de la consulta
  ORL_DOCS -> Generadores de estructura de documentos
*/

// [JS-ORL-001] DATOS Y CATÁLOGOS
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
    
    PHYSICAL_EXAM: {"Cara":{"Simetría":["Simetría Facial","Asimetría Facial","Parálisis Facial Periférica","Parálisis Facial Periférica derecha","Parálisis Facial Periférica izquierda","Parálisis Facial Central","Edema Facial","Malformación Craneofacial"]},"Oído Derecho":{"Oído Externo":["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],"Conducto Auditivo Externo":["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],"Oído Medio":["Membrana Timpánica"],"Membrana Timpánica":["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]},"Oído Izquierdo":{"Oído Externo":["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],"Conducto Auditivo Externo":["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],"Oído Medio":["Membrana Timpánica"],"Membrana Timpánica":["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]},"Nariz":{"Fosa Nasal":["Fosa nasal permeable","LOE","LOE que obstruye compleamente fosa nasal izquierda","LOE que obstruye completamente fosa nasal derecha"],"Tabique":["Central","con desviación Dextroconvexa","con desviación Levoconvexa","con espolón óseo"],"Cornetes":["Cornete inferior eutrófico","Cornete inferior hipertrófico obstructivo","Cornete inferior con degeneración polipoidea","Cornete medio eutrófico","Cornete medio hipertrófico","Poliposis nasal"],"Mucosa":["Mucosa Indemne","Mucosa Pálida","Mucosa Eritematosa a nivel de Plexos","Epistaxis Anterior","Epistaxis Posterior"],"Rinorrea":["Rinorrea Hialina","Rinorrea Blanquecina","Rinorrea Amarillenta"]},"Orofaringe":{"Lengua":["Lengua húmeda móvil","Lengua seca"],"Tonsilas":["Tonsilas grado I","Tonsilas grado II","Tonsilas grado III","Tonsilas grado IV","Tonsilas asimétricas","Tonsilas con placas blanquecinas"],"Rinofaringe":["congestiva","con rinorrea posterior escasa","con rinorrea posterior blanquecina","con placas blanquecinas"]},"Cuello":{"Aspecto":["Móvil, sin lesiones aparentes"]}}
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
            // Buscar datos de paciente en el contexto global o pasarlos como argumento
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

    renderChips: function(containerSelector, dataArray, targetInputSelector) {
        const container = this.container.querySelector(containerSelector);
        if (!container) return;
        container.innerHTML = '';

        dataArray.forEach(text => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = text;
            chip.onclick = () => {
                chip.classList.toggle('on');
                if (targetInputSelector) {
                    this.updateTextInput(targetInputSelector, text, chip.classList.contains('on'));
                }
            };
            container.appendChild(chip);
        });
    },

    updateTextInput: function(selector, text, isAdding) {
        const input = this.container.querySelector(selector);
        if (!input) return;
        let currentVal = input.value;
        // Lógica simple de concatenación
        if (isAdding) {
            input.value = currentVal ? `${currentVal}, ${text}` : text;
        } else {
            // Para remover sería más complejo si el usuario editó, así que solo agregamos
            // Implementación básica:
            const parts = currentVal.split(', ');
            const idx = parts.indexOf(text);
            if (idx > -1) parts.splice(idx, 1);
            input.value = parts.join(', ');
        }
    },

    renderPhysicalExam: function() {
        const container = this.container.querySelector('.pe-panels');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(ORL_DATA.PHYSICAL_EXAM).forEach(([section, subSections]) => {
            const secDiv = document.createElement('div');
            secDiv.className = 'glass-panel pe-section';
            secDiv.style.marginTop = "10px";
            secDiv.innerHTML = `<div style="font-weight:700; color:var(--accent-blue)">${section}</div>`;

            Object.entries(subSections).forEach(([subKey, chips]) => {
                const subDiv = document.createElement('div');
                subDiv.className = 'input-row';
                subDiv.innerHTML = `<div class="col small" style="font-weight:600;color:var(--text-secondary)">${subKey}</div><div class="col chips"></div>`;
                
                const chipsContainer = subDiv.querySelector('.chips');
                const isTrigger = (section.includes("Oído") && subKey === "Oído Medio");
                const isDependent = (section.includes("Oído") && subKey === "Membrana Timpánica");

                if (isDependent) {
                    subDiv.dataset.dependency = `trigger-${section.replace(/\s/g,'')}`;
                    subDiv.classList.add('hidden');
                }

                chips.forEach(chipText => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.textContent = chipText;
                    
                    if (isTrigger && chipText === "Membrana Timpánica") {
                        chip.onclick = () => {
                            chip.classList.toggle('on');
                            const dependent = secDiv.querySelector(`[data-dependency="trigger-${section.replace(/\s/g,'')}"]`);
                            if(dependent) dependent.classList.toggle('hidden', !chip.classList.contains('on'));
                        }
                    } else {
                        chip.onclick = () => chip.classList.toggle('on');
                    }
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
            group.innerHTML = `<div class="small" style="font-weight:700;color:var(--accent-blue)">${category}</div><div class="chips"></div>`;
            const chipBox = group.querySelector('.chips');

            meds.forEach(med => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = med;
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
            wrapper.id = `ind-wrap-${medName.replace(/\s/g, '')}`;
            
            const label = document.createElement('label');
            label.className = 'small';
            label.textContent = medName;
            
            const select = document.createElement('select');
            select.className = 'indicacion-select';
            select.dataset.med = medName;
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
        // Helper to get value by name (assuming form inputs have name="path.to.property")
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
    // Aquí se pueden agregar generateCons, generateOrdLab, etc.
};

export const ORL_MODULE = {
    DATA: ORL_DATA,
    UI: ORL_UI,
    DOCS: ORL_DOCS
};