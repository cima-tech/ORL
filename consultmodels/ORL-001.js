/* consultmodels/ORL-001.js */

// [DATA-01] DATOS Y CATÁLOGOS (GENÉRICO)
const MODEL_DATA = {
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
        "Nasofibrolaringoscopia":{
            "Fosas Nasales":["Permeables","No Permeables"],
            "Correderas Nasales":["Sin Rinorrea","Rinorrea Blanca Escasa","Rinorrea Blanca Moderada","Rinorrea Blanca Abundante","Rinorrea Hialina Escasa","Rinorrea Hialina Moderada","Rinorrea Hialina Abundante","Rinorrea Amarilla Escasa","Rinorrea Amarilla Moderada","Rinorrea Amarilla Abundante","Rinorrea Verde Escasa","Rinorrea Verde Moderada","Rinorrea Verde Abundante"],
            "Tabique":["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Levoconvexa Con Espolón Oseo Derecho","Levoconvexa Con Espolón Oseo Izquierdo","Dextroconvexa Con Espolón Oseo Derecho","Dextroconvexa Con Espolón Oseo Izquierdo","Central Con Espolón Óseo Derecho","Central Con Espolón Óseo Izquierdo"],
            "Cornete Inferior Derecho":["Eutrófico","Hipertrófico","Polipoide"],
            "Cornete Medio Derecho":["Eutrófico","Hipertrófico","Polipoide"],
            "Meato Medio Derecho":["Libre","Comprometido"],
            "Coana Derecha":["Permeable","No Permeable"],
            "Cornete Inferior Izquierdo":["Eutrófico","Hipertrófico","Polipoide"],
            "Cornete Medio Izquierdo":["Eutrófico","Hipertrófico","Polipoide"],
            "Meato Medio Izquierdo":["Libre","Comprometido"],
            "Coana Izquierda":["Permeable","No Permeable"],
            "Paladar":["Con Cierre Coronal","Competente","Incompetente"],
            "Adenoides":["Ausentes","Leves","Moderadas","Severas"],
            "Rinofaringe":["Indemne","Congestiva Granulosa","Granulosa","Con Rinorrea Posterior Blanca Escasa","Con Rinorrea Posterior Hialina Escasa","Con Rinorrea Posterior Amarilla Escasa","Con Rinorrea Posterior Verde Escasa","Con Rinorrea Posterior Blanca Moderada","Con Rinorrea Posterior Hialina Moderada","Con Rinorrea Posterior Amarilla Moderada","Con Rinorrea Posterior Verde Moderada","Con Rinorrea Posterior Blanca Abundante","Con Rinorrea Posterior Hialina Abundante","Con Rinorrea Posterior Amarilla Abundante","Con Rinorrea Posterior Verde Abundante"],
            "Base De Lengua":["Sin Lesiones","Con Loe"],
            "Senos Piriformes":["Indemnes","Seno Piriforme Derecho Con Loe","Seno Piriforme Derecho Sin Lesiones","Seno Piriforme Izquierdo Con Loe","Seno Piriforme Izquierdo Sin Lesiones"],
            "Valleculas":["Indemnes","Vallecula Derecha Con Loe","Vallecula Derecha Sin Lesiones","Vallecula Izquierda Con Loe","Vallecula Izquierda Sin Lesiones"],
            "Epiglotis":["Indemne Erecta","Móvil","Eritematosa","En Omega"],
            "Bandas Ventriculares":["Indemnes","Hipertróficas","Con Loe"],
            "Cuerda Vocal Derecha":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
            "Cuerda Vocal Izquierda":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
            "Cierre Glótico":["Completo","Incompleto En Huso","Incompleto Irregular","En Reloj De Arena","Con Hiato Anterior","Con Hiato Posterior"],
            "Subglotis":["Permeable 100%","Estenosis Subglótica Cotton I","Estenosis Subglótica Cotton Ii","Estenosis Subglótica Cotton Iii"],
            "Mucosa":["Indemne","Eritematosa","Pálida","Con Plexo Derecho Friable","Con Plexo Izquierdo Friable"]
        },
        "Endoscopia Nasal":{
            "Fosas Nasales":["Permeables","No Permeables"],
            "Tabique":["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Levoconvexa Con Espolón Oseo Derecho","Levoconvexa Con Espolón Oseo Izquierdo","Dextroconvexa Con Espolón Oseo Derecho","Dextroconvexa Con Espolón Oseo Izquierdo","Central Con Espolón Óseo Derecho","Central Con Espolón Óseo Izquierdo"],
            "Cornete Medio Derecho":["Eutrófico","Hipertrófico","Polipoide","Concha Media Bullosa Derecha","Paradójico Derecho"],
            "Cornete Medio Izquierdo":["Eutrófico","Hipertrófico","Polipoide","Concha Media Bullosa Izquierda","Paradójico Izquierdo"],
            "Meato Medio Derecho":["Libre","Comprometido"],
            "Meato Medio Izquierdo":["Libre","Comprometido"],
            "Coana Derecha":["Permeable","No Permeable"],
            "Coana Izquierda":["Permeable","No Permeable"],
            "Sinusopatía":["Sin Sinusopatía","Con Sinusopatía Maxilar Derecha","Con Sinusopatía Maxilar Izquierda","Con Sinusopatía Frontal Derecha","Con Sinusopatía Frontal Izquierda","Con Sinusopatía Etmoidal Anterior Derecha","Con Sinusopatía Etmoidal Anterior Izquierda","Con Sinusopatía Etmoidal Posterior Derecha","Con Sinusopatía Etmoidal Posterior Izquierda","Con Sinusopatía Esfenoidal Anterior Derecha","Con Sinusopatía Esfenoidal Anterior Izquierda","Con Sinusopatía Maxiloetmoidal Derecha","Con Sinusopatía Maxiloetmoidal Izquierda"]
        },
        "Telelaringoscopia":{
            "Cierre Glótico":["Completo","Incompleto En Huso","Incompleto Irregular","En Reloj De Arena","Con Hiato Anterior","Con Hiato Posterior"],
            "Bandas Ventriculares":["Indemnes","Hipertróficas","Con Loe"],
            "Cuerda Vocal Derecha":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
            "Cuerda Vocal Izquierda":["Indemne","Indemne Móvil","Móvil Con Loe","Móvil Con Leucoplasia","Inmóvil Con Loe","Inmóvil Con Leucoplasia"],
            "Subglotis":["Permeable 100%","Estenosis Cotton I","Estenosis Cotton Ii","Estenosis Cotton Iii"]
        },
        "Impedanciometría":{
            "Oído Derecho":["Curva Tipo A","Curva Tipo As","Curva Tipo B","Curva Tipo C"],
            "Oído Izquierdo":["Curva Tipo A","Curva Tipo As","Curva Tipo B","Curva Tipo C"]
        },
        "Tomografía de Oído":{
            "Cae Derecho":["Permeable","No Permeable"],
            "Om Derecho":["Neumatizado","Con Velamiento"],
            "Scutum Derecho":["Indemne","Amputado"],
            "Co Derecha":["Cadena Osicular Indemne","Cadena Osicular Alterada"],
            "Mastoides Derecha":["Neumatizada","Poco Neumatizada","Velada Completamente"],
            "Cóclea Derecha":["Indemne Con 2 Vueltas Y Media","Con Malformación","Impresiona","Osificada"],
            "Cai Derecho":["Indemne","Hipoplásico","Con Loe"],
            "Cae Izquierdo":["Permeable","No Permeable"],
            "Om Izquierdo":["Neumatizado","Con Velamiento"],
            "Scutum Izquierdo":["Indemne","Amputado"],
            "Co Izquierda":["Cadena Osicular Indemne","Cadena Osicular Alterada"],
            "Mastoides Izquierda":["Neumatizada","Poco Neumatizada","Velada Completamente"],
            "Cóclea Izquierda":["Indemne Con 2 Vueltas Y Media","Con Malformación","Impresiona","Osificada"],
            "Cai Izquierdo":["Indemne","Hipoplásico","Con Loe"]
        },
        "Tomografía de Nariz y SPN":{
            "Tabique":["Central","Septumdesviación Levoconvexa","Septumdesviación Dextroconvexa","Espolón Óseo Derecho","Espolón Óseo Izquierdo"],
            "Cornetes":["Eutróficos","Hipertróficos","Polipoides","Concha Media Bullosa Derecha","Concha Media Bullosa Izquierda","Cornete Medio Paradójico Derecho","Cornete Medio Paradójico Izquierdo"],
            "Meato Medio Derecho":["Libre","Comprometido"],
            "Meato Medio Izquierdo":["Libre","Comprometido"],
            "Coana Derecha":["Permeable","No Permeable"],
            "Coana Izquierda":["Permeable","No Permeable"],
            "Sinusopatía":["Sin Sinusopatía","Con Sinusopatía Maxilar Derecha","Con Sinusopatía Maxilar Izquierda","Con Sinusopatía Frontal Derecha","Con Sinusopatía Frontal Izquierda","Con Sinusopatía Etmoidal Anterior Derecha","Con Sinusopatía Etmoidal Anterior Izquierda","Con Sinusopatía Etmoidal Posterior Derecha","Con Sinusopatía Etmoidal Posterior Izquierda","Con Sinusopatía Esfenoidal Anterior Derecha","Con Sinusopatía Esfenoidal Anterior Izquierda","Con Sinusopatía Maxiloetmoidal Derecha","Con Sinusopatía Maxiloetmoidal Izquierda"]
        },
        "Audiometría":{},"Timpanometría":{},"Acufenometría":{},"Prueba de Prótesis Auditiva":{},"PEATC":{},"Estudio de Sueño":{},"Resonancia de Nariz y SPN":{},"Protocolo de Implante Coclear":{}
    },
    
    PHYSICAL_EXAM: {
        "Cara":{"Simetría":["Simetría Facial","Asimetría Facial","Parálisis Facial Periférica","Parálisis Facial Periférica derecha","Parálisis Facial Periférica izquierda","Parálisis Facial Central","Edema Facial","Malformación Craneofacial"]},
        "Oído Derecho":{"Oído Externo":["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],"Conducto Auditivo Externo":["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],"Oído Medio":["Membrana Timpánica"],"Membrana Timpánica":["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]},
        "Oído Izquierdo":{"Oído Externo":["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula"],"Conducto Auditivo Externo":["CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo"],"Oído Medio":["Membrana Timpánica"],"Membrana Timpánica":["indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpático amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"]},
        "Nariz":{"Fosa Nasal":["Fosa nasal permeable","LOE","LOE que obstruye compleamente fosa nasal izquierda","LOE que obstruye completamente fosa nasal derecha"],"Tabique":["Central","con desviación Dextroconvexa","con desviación Levoconvexa","con espolón óseo"],"Cornetes":["Cornete inferior eutrófico","Cornete inferior hipertrófico obstructivo","Cornete inferior con degeneración polipoidea","Cornete medio eutrófico","Cornete medio hipertrófico","Poliposis nasal"],"Mucosa":["Mucosa Indemne","Mucosa Pálida","Mucosa Eritematosa a nivel de Plexos","Epistaxis Anterior","Epistaxis Posterior"],"Rinorrea":["Rinorrea Hialina","Rinorrea Blanquecina","Rinorrea Amarillenta"]},
        "Orofaringe":{"Lengua":["Lengua húmeda móvil","Lengua seca"],"Tonsilas":["Tonsilas grado I","Tonsilas grado II","Tonsilas grado III","Tonsilas grado IV","Tonsilas asimétricas","Tonsilas con placas blanquecinas"],"Rinofaringe":["congestiva","con rinorrea posterior escasa","con rinorrea posterior blanquecina","con placas blanquecinas"]},
        "Cuello":{"Aspecto":["Móvil, sin lesiones aparentes"]}
    }
};

// [UI-LOGIC] LÓGICA DE MANIPULACIÓN DOM GENÉRICA
const MODEL_UI = {
    activeIndications: {},
    currentPatient: null,

    init: function(container, data = {}, patient = null) {
        this.container = container;
        this.currentPatient = patient; // Guardar referencia al paciente
        
        // Renderizar Chips de Texto
        this.renderChips('.chips-motivo', MODEL_DATA.MOTIVOS, '.txt-motivo');
        this.renderChips('.chips-ap', MODEL_DATA.ANTECEDENTES, '.txt-ap');
        this.renderChips('.chips-af', MODEL_DATA.ANTECEDENTES, '.txt-af');
        this.renderChips('.chips-dx', MODEL_DATA.DX, '.txt-dx');
        
        // Renderizar Estudios (Nuevo)
        this.renderStudySelector();
        
        // Renderizar Receta Chips
        this.renderRecipeChips();
        
        // Inicializar Enfermedad Actual
        this.initEA();
    },

    initEA: function() {
        const eaInput = this.container.querySelector('.txt-ea');
        if(eaInput && !eaInput.value) {
            // Si tenemos paciente cargado, usar sus datos
            if (this.currentPatient) {
                const sex = this.currentPatient.demografia?.genero || '[sexo]';
                const age = this.currentPatient.demografia?.edad_auto || '[edad]';
                eaInput.value = `Paciente ${sex} de ${age} años quien acude a consulta por presentar...`;
            } else {
                eaInput.value = `Paciente quien acude a consulta por presentar...`;
            }
        }
    },

    renderStudySelector: function() {
        const select = document.createElement('select');
        select.id = 'sel-estudio-tipo';
        select.className = 'model-select';
        select.style.cssText = "width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;";
        select.innerHTML = `<option value="">Seleccione Tipo de Estudio...</option>` +
            Object.keys(MODEL_DATA.STUDIES).map(k => `<option value="${k}">${k}</option>`).join('');
        
        // Listener para renderizar estudios específicos
        select.onchange = () => {
            this.renderStudyDetails(select.value);
        };

        // Inyectar en lugar específico (asumo que tienes un div 'study-detail-container' en el HTML o lo creas)
        // Por simplicidad, lo inyecto después del select
        const container = this.container.querySelector('.studies-section');
        if (container) {
            const wrapper = document.createElement('div');
            wrapper.style.marginTop = "10px";
            wrapper.appendChild(select);
            container.appendChild(wrapper);
        }
    },

    renderStudyDetails: function(studyType) {
        const detailContainer = this.container.querySelector('.studies-detail-container');
        if (!detailContainer) return;

        detailContainer.innerHTML = '';

        if (!studyType) return; // Si no seleccionó nada, limpiar

        const data = MODEL_DATA.STUDIES[studyType];
        if (!data) return;

        Object.entries(data).forEach(([section, items]) => {
            const secDiv = document.createElement('div');
            secDiv.className = 'glass-panel';
            secDiv.style.padding = "10px";
            secDiv.style.marginBottom = "10px";
            secDiv.innerHTML = `<div style="font-weight:700; color:var(--accent-blue); margin-bottom:5px;">${section}</div>`;

            const row = document.createElement('div');
            row.className = 'input-row';
            
            Object.entries(items).forEach(([key, chips]) => {
                const subDiv = document.createElement('div');
                subDiv.style.marginBottom = "5px";
                
                // Label
                const label = document.createElement('label');
                label.textContent = key;
                label.style.display = "block";
                label.style.fontWeight = "600";
                label.style.color = "var(--text-secondary)";
                label.style.marginBottom = "2px";

                // Chips
                const chipBox = document.createElement('div');
                chips.forEach(chipText => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.textContent = chipText;
                    chip.style.cssText = "padding:4px 8px; background:var(--color-glass-heavy); border:1px solid var(--color-border); border-radius:8px; cursor:pointer; display:inline-block; margin-right:5px; font-size:0.75rem;";
                    chip.addEventListener('click', () => chip.classList.toggle('on'));
                    chipBox.appendChild(chip);
                });

                subDiv.appendChild(label);
                subDiv.appendChild(chipBox);
                row.appendChild(subDiv);
            });

            secDiv.appendChild(row);
            detailContainer.appendChild(secDiv);
        });
    },

    updateTextInput: function(selector, text, isAdding) {
        const input = this.container.querySelector(selector);
        if (!input) return;
        let currentValues = input.value.split(',').map(v => v.trim()).filter(v => v !== ''); 
        if (isAdding) {
            if (!currentValues.includes(text)) {
                currentValues.push(text);
                input.value = currentValues.join(', ');
            }
        } else {
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
            chip.textContent = text;
            // [FIX] Estilos !important para asegurar visibilidad
            chip.style.cssText = `
                padding:5px 10px !important; 
                margin-right:5px !important; 
                background: var(--color-glass-heavy) !important; 
                border:1px solid var(--color-border) !important; 
                border-radius: 12px !important; 
                cursor: pointer !important; 
                display: inline-block !important; 
                font-size:0.85rem !important; 
                color: var(--color-text) !important; 
                transition: all 0.3s ease !important;
            `;
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                const isNowActive = chip.classList.toggle('on');
                if (isNowActive) {
                    chip.style.background = 'var(--color-accent) !important';
                    chip.style.color = 'white !important';
                    chip.style.borderColor = 'var(--color-accent) !important';
                    chip.style.transform = 'scale(1.05)';
                } else {
                    chip.style.background = 'var(--color-glass-heavy) !important';
                    chip.style.color = 'var(--color-text) !important';
                    chip.style.borderColor = 'var(--color-border) !important';
                    chip.style.transform = 'scale(1)';
                }
                if (targetInputSelector) {
                    this.updateTextInput(targetInputSelector, text, isNowActive);
                }
            });
            container.appendChild(chip);
        });
    },

    renderPhysicalExam: function() {
        const container = this.container.querySelector('.pe-chips-container');
        if (!container) return;
        container.innerHTML = '';
        Object.entries(MODEL_DATA.PHYSICAL_EXAM).forEach(([section, subSections]) => {
            const secDiv = document.createElement('div');
            secDiv.className = 'glass-panel pe-section';
            secDiv.style.marginTop = "10px";
            secDiv.style.padding = "15px";
            secDiv.innerHTML = `<div style="font-weight:700; color:var(--accent-blue); margin-bottom:10px;">${section}</div>`;
            Object.entries(subSections).forEach(([subKey, chips]) => {
                const subDiv = document.createElement('div');
                subDiv.className = 'input-row';
                subDiv.style.marginBottom = "10px";
                subDiv.innerHTML = `<div class="col small" style="font-weight:600; color:var(--text-secondary); width:150px;">${subKey}</div><div class="col chips" style="flex:1;"></div>`;
                const chipsContainer = subDiv.querySelector('.chips');
                chips.forEach(chipText => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.textContent = chipText;
                    chip.style.cssText = "padding:4px 8px !important; background:var(--color-glass-heavy) !important; border:1px solid var(--color-border) !important; border-radius:8px !important; cursor:pointer !important; display:inline-block !important; margin-right:5px !important; font-size:0.75rem !important;";
                    chip.addEventListener('click', () => chip.classList.toggle('on'));
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
        Object.entries(MODEL_DATA.RECIPE_MEDS).forEach(([category, meds]) => {
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
                chip.style.cssText = "padding:5px 10px !important; background:var(--accent-blue) !important; color:white !important; border-radius:8px !important; cursor:pointer !important; display:inline-block !important; margin-right:5px !important; font-size:0.8rem !important;";
                chip.addEventListener('click', () => chip.classList.toggle('on'));
                this.handleMedSelection(med, category, chip.classList.contains('on'));
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
                if(!current.includes(medName)) current.push(medName);
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
            const options = MODEL_DATA.INDICACIONES_OPTIONS[category] || MODEL_DATA.INDICACIONES_OPTIONS["Otros"];
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

// [GEN-DOCS] GENERADORES DE DOCUMENTOS
const MODEL_DOCS = {
    getContext: function() {
        const getVal = (path) => {
            const el = document.querySelector(`[name="${path}"]`);
            return el ? el.value : '';
        };
        return {
            paciente: {
                nombre: getVal('nombres.primer_nombre') + ' ' + getVal('nombres.primer_apellido'),
                ci: getVal('identificacion.documento_numero'),
                edad: MODEL_UI.calculateAge(getVal('demografia.fecha_nacimiento')),
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
    },
    generateOrd: function() {
        const ctx = this.getContext();
        return {
            type: 'ORD',
            title: 'ORDEN QUIRÚRGICA',
            orientation: 'portrait',
            content: {
                motivo: ctx.consulta.motivo,
                dx: ctx.consulta.dx,
                plan: ctx.consulta.plan,
                estudios: document.getElementById('txt-estudios')?.value,
                pe: document.getElementById('txt-pe-notas')?.value
            }
        };
    }
};

// [CONTRATO UNIVERSAL] CONEXIÓN CON INDEX.JS
export const MODEL_DEFINITION = {
    id: "ORL-001",
    name: "Consulta Modelo Universal (ORL)",
    
    // [REESTRUCTURACIÓN FINAL PRO] INICIALIZACIÓN UI
    initUI: function(container, data = {}, patient = null) {
        // 1. INYECTAR ESTRUCTURA HTML ORDENADO ESTRÍCTAMENTE
        container.innerHTML = `
            <div style="margin-bottom:20px; color:var(--text-dim); font-weight:600; font-size:0.9rem;">
                * Campos obligatorios marcados con (*)
            </div>

            <!-- SECCIÓN 1: ENFERMEDAD ACTUAL -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Enfermedad Actual (*)</label>
                    <textarea class="txt-ea" rows="5" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Describa el padecimiento actual..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 2: MOTIVO DE CONSULTA -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Motivo de Consulta (*)</label>
                    <input type="text" class="txt-motivo" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Ej: Dolor de garganta...">
                    <div class="chips-container chips-motivo" style="margin-top:10px;"></div>
                </div>
            </div>

            <!-- SECCIÓN 3: ANTECEDENTES PERSONALES Y FAMILIARES -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div style="margin-bottom:10px; font-size:0.8rem; color:var(--text-dim);">Datos traídos desde la Ficha del Paciente</div>
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Antecedentes Personales</label>
                    <textarea class="txt-ap" rows="2" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Ej: Asma actual..."></textarea>
                    <div class="chips-container chips-ap" style="margin-top:10px;"></div>
                </div>
                 <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Antecedentes Familiares</label>
                    <textarea class="txt-af" rows="2" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Ej: Hipertensión..."></textarea>
                    <div class="chips-container chips-af" style="margin-top:10px;"></div>
                </div>
            </div>

            <!-- SECCIÓN 4: EXAMEN FÍSICO (SIEMPRE VISIBLE + TEXTO FUERA) -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-stethoscope"></i> Examen Físico ORL
                </div>
                
                <!-- [FIX] TEXTO PARA NOTAS DE EXAMEN FUERA DE PE-PANELS -->
                <div style="margin-top:15px;">
                    <label style="font-weight:600; color:var(--accent-blue); display:block; margin-bottom:5px;">Notas de Examen Físico</label>
                    <textarea id="txt-pe-notas" rows="4" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Detalles adicionales del examen físico..."></textarea>
                </div>

                <!-- Chips de Examen -->
                <div class="pe-chips-container" style="margin-top:15px;"></div>
            </div>

            <!-- SECCIÓN 5: ESTUDIOS EN CONSULTA -->
            <div class="glass-panel studies-section" style="padding:20px; margin-bottom:20px;">
                 <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-x-ray"></i> Estudios Solicitados / Realizados
                </div>
                 <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Tipo de Estudio</label>
                    <!-- Select inyectado por JS -->
                </div>
                 <!-- Contenedor Detalles Estudios -->
                 <div class="studies-detail-container"></div>
            </div>

            <!-- SECCIÓN 6: DIAGNÓSTICO -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Diagnóstico (*)</label>
                    <input type="text" class="txt-dx" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Diagnóstico presuntivo...">
                    <div class="chips-container chips-dx" style="margin-top:10px;"></div>
                </div>
            </div>

            <!-- SECCIÓN 7: PLAN Y TRATAMIENTO -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
                <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--accent-blue);">Plan y Tratamiento (*)</label>
                    <textarea class="txt-plan" rows="6" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--color-border); color:var(--color-text); padding:10px; border-radius:8px;" placeholder="Plan de manejo, indicaciones generales..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 8: RECETA E INDICACIONES (DINÁMICAS) -->
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

            <!-- SECCIÓN 9: GENERACIÓN DE DOCUMENTOS -->
            <div class="glass-panel" style="padding:20px; margin-bottom:20px; background:var(--color-glass);">
                 <div style="margin-bottom:15px; font-weight:700; color:var(--accent-blue);">
                    <i class="fas fa-file-medical-alt"></i> Generación de Documentos
                </div>
                 <div class="input-group" style="width:100%;">
                    <label style="font-weight:600; color:var(--text-dim); display:block; margin-bottom:10px;">Seleccione qué incluir en la impresión final:</label>
                    <div class="chips-container chips-docs" style="margin-bottom:15px;">
                        <label class="chk-doc-inf" style="padding:5px 10px !important; background:var(--color-glass-heavy) !important; border:1px solid var(--color-border) !important; border-radius:12px !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; gap:5px !important;">
                            <input type="checkbox" class="chk-doc-inf" style="width:auto;">
                            Informe Médico (INF)
                        </label>
                        <label class="chk-doc-rp" style="padding:5px 10px !important; background:var(--color-glass-heavy) !important; border:1px solid var(--color-border) !important; border-radius:12px !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; gap:5px !important;">
                            <input type="checkbox" class="chk-doc-rp" style="width:auto;">
                            Recipe e Indicaciones (RP)
                        </label>
                        <label class="chk-doc-ord" style="padding:5px 10px !important; background:var(--color-glass-heavy) !important; border:1px solid var(--color-border) !important; border-radius:12px !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; gap:5px !important;">
                            <input type="checkbox" class="chk-doc-ord" style="width:auto;">
                            Orden Quirúrgica (ORD)
                        </label>
                        <label class="chk-doc-lab" style="padding:5px 10px !important; background:var(--color-glass-heavy) !important; border:1px solid var(--color-border) !important; border-radius:12px !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; gap:5px !important;">
                            <input type="checkbox" class="chk-doc-lab" style="width:auto;">
                            Consentimientos (CON)
                        </label>
                         <label class="chk-doc-con" style="padding:5px 10px !important; background:var(--color-glass-heavy) !important; border:1px solid var(--color-border) !important; border-radius:12px !important; cursor:pointer !important; display:inline-flex !important; align-items:center !important; gap:5px !important;">
                            <input type="checkbox" class="chk-doc-con" style="width:auto;">
                            Laboratorios (LAB)
                        </label>
                    </div>
                 </div>
            </div>
        `;

        // 2. Ejecutar Lógica Genérica (Pasar 'patient')
        MODEL_UI.init(container, data, patient);

        // 3. Si hay datos (Edición), llenar campos
        if (data && Object.keys(data).length > 0) {
            const setVal = (sel, val) => {
                const el = container.querySelector(sel);
                if(el) el.value = val || '';
            };
            setVal('.txt-ea', data.ea);
            setVal('.txt-motivo', data.motivo);
            setVal('.txt-ap', data.ap);
            setVal('.txt-af', data.af);
            setVal('#txt-pe-notas', data.pe_notas);
            setVal('.txt-dx', data.dx);
            setVal('.txt-plan', data.plan);
            setVal('.txt-recipe', data.recipe);
            setVal('.txt-indicaciones', data.indicaciones);
            
            // Restaurar Checkboxes de Documentos
            if (data.docs_generated && Array.isArray(data.docs_generated)) {
                const chkInf = container.querySelector('.chk-doc-inf');
                const chkRp = container.querySelector('.chk-doc-rp');
                const chkOrd = container.querySelector('.chk-doc-ord');
                const chkCon = container.querySelector('.chk-doc-con');
                const chkLab = container.querySelector('.chk-doc-lab');

                if(chkInf) chkInf.checked = data.docs_generated.includes("INF");
                if(chkRp) chkRp.checked = data.docs_generated.includes("RP");
                if(chkOrd) chkOrd.checked = data.docs_generated.includes("ORD");
                if(chkCon) chkCon.checked = data.docs_generated.includes("CON");
                if(chkLab) chkLab.checked = data.docs_generated.includes("LAB");
            }
        }
    },
    
    getData: function(container) {
        const getVal = (sel) => container.querySelector(sel)?.value || '';
        const getDocs = () => {
            const docs = [];
            if (container.querySelector('.chk-doc-inf')?.checked) docs.push("INF");
            if (container.querySelector('.chk-doc-rp')?.checked) docs.push("RP");
            if (container.querySelector('.chk-doc-ord')?.checked) docs.push("ORD");
            if (container.querySelector('.chk-doc-con')?.checked) docs.push("CON");
            if (container.querySelector('.chk-doc-lab')?.checked) docs.push("LAB");
            return docs;
        };
        return {
            ea: getVal('.txt-ea'),
            motivo: getVal('.txt-motivo'),
            ap: getVal('.txt-ap'), 
            af: getVal('.txt-af'), 
            pe_notas: getVal('#txt-pe-notas'),
            dx: getVal('.txt-dx'),
            plan: getVal('.txt-plan'),
            recipe: getVal('.txt-recipe'),
            indicaciones: getVal('.txt-indicaciones'),
            docs_generated: getDocs()
        };
    },
    
    validate: function(data) {
        if (!data.motivo && !data.ea) return "Debe ingresar al menos un Motivo o Enfermedad Actual.";
        if (!data.dx) return "Debe ingresar un Diagnóstico.";
        if (!data.plan) return "Debe ingresar un Plan y Tratamiento.";
        return null; 
    },
    
    getSummary: function(data) {
        return data.motivo || data.dx || "Consulta Modelo";
    }
};

export const MODEL_MODULE = {
    DATA: MODEL_DATA,
    UI: MODEL_UI,
    DOCS: MODEL_DOCS
};
