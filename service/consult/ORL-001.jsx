// ARCHIVO: service/consult/ORL-001.jsx
import React, { useState, useEffect } from 'react';

// ==========================================
// 1. DATA MAESTRA ORL (Completa y Original)
// ==========================================
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

    PHYSICAL_EXAM: {
        "Cara": ["Simetría Facial","Asimetría Facial","Parálisis Facial Periférica","Parálisis Facial Periférica derecha","Parálisis Facial Periférica izquierda","Parálisis Facial Central","Edema Facial","Malformación Craneofacial"],
        "Oído Derecho": ["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula","CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo","Membrana Timpánica indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpánico amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"],
        "Oído Izquierdo": ["Pabellón Auricular Indemne Normoimplantado","Microtia Grado 1","Microtia Grado 2","Microtia Grado 3","Anotia","Fístula","CAE Libre","CAE con Otocerumen","CAE estenótico","Atresia CAE","CAE con LOE","CAE con Otorrea Fétida","CAE Descamativo","Membrana Timpánica indemne, movilidad conservada","Opaca","abombada con líquido retrotimpánico escaso","abombada con líquido retrotimpánico que limita movilidad","eritematosa con líquido retrotimpánico amarillento","con perforación anterior","con perforación posterior","con perforación central","con perforación amplia","con perforación puntiforme"],
        "Nariz": ["Fosa nasal permeable","LOE","LOE que obstruye compleamente fosa nasal izquierda","LOE que obstruye completamente fosa nasal derecha","Tabique Central","con desviación Dextroconvexa","con desviación Levoconvexa","con espolón óseo","Cornete inferior eutrófico","Cornete inferior hipertrófico obstructivo","Cornete inferior con degeneración polipoidea","Cornete medio eutrófico","Cornete medio hipertrófico","Poliposis nasal","Mucosa Indemne","Mucosa Pálida","Mucosa Eritematosa a nivel de Plexos","Epistaxis Anterior","Epistaxis Posterior","Rinorrea Hialina","Rinorrea Blanquecina","Rinorrea Amarillenta"],
        "Orofaringe": ["Lengua húmeda móvil","Lengua seca","Tonsilas grado I","Tonsilas grado II","Tonsilas grado III","Tonsilas grado IV","Tonsilas asimétricas","Tonsilas con placas blanquecinas","Rinofaringe congestiva","con rinorrea posterior escasa","con rinorrea posterior blanquecina","con placas blanquecinas"],
        "Cuello": ["Móvil, sin lesiones aparentes"]
    },

    // ESTUDIOS MASIVOS COMPLETOS (solo algunos para ejemplo)
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
            "Adenoides":["Absentes","Leves","Moderadas","Severas"],
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
        }
    }
};

// ==========================================
// 2. COMPONENTE PRINCIPAL ORL001
// ==========================================
export default function ORL001({ onDataChange, initialData }) {
    // Estado principal del formulario de consulta
    const [formData, setFormData] = useState(initialData || {
        motivo: '', ea: '', ap: '', af: '', dx: '', plan: '', recipe: '', indicaciones: ''
    });
    
    // Estado para examen físico
    const [examData, setExamData] = useState({});
    
    // Estado para estudios
    const [studiesData, setStudiesData] = useState({});
    
    // Estado para múltiples consultas
    const [consults, setConsults] = useState([{ id: 1, formData: {}, examData: {}, studiesData: {} }]);
    const [activeConsultIndex, setActiveConsultIndex] = useState(0);
    
    // Efecto para notificar cambios al componente padre
    useEffect(() => {
        if (onDataChange) {
            const currentConsult = consults[activeConsultIndex];
            onDataChange({ 
                consults, 
                activeConsultIndex,
                currentConsult: {
                    formData: currentConsult.formData,
                    examData: currentConsult.examData,
                    studiesData: currentConsult.studiesData
                }
            });
        }
    }, [consults, activeConsultIndex]);
    
    // Efecto para escuchar eventos desde la barra de herramientas HTML
    useEffect(() => {
        // Evento para agregar nueva consulta desde botón HTML
        const handleAddConsultaEvent = (event) => {
            addNewConsult();
        };
        
        // Evento para eliminar última consulta desde botón HTML
        const handleDeleteLastEvent = () => {
            deleteLastConsult();
        };
        
        // Evento para cargar datos desde localStorage
        const handleLoadConsultData = (event) => {
            if (event.detail) {
                // Cargar datos de consulta desde localStorage
                // Aquí asumimos que event.detail es el objeto con consults
                if (event.detail.consults) {
                    setConsults(event.detail.consults);
                    setActiveConsultIndex(0);
                }
            }
        };
        
        // Evento para resetear consulta
        const handleResetConsult = () => {
            resetConsult();
        };
        
        // Evento para cerrar consulta
        const handleCloseConsult = () => {
            // No hacemos nada especial al cerrar, solo guardar
        };
        
        // Registrar listeners de eventos globales
        window.addEventListener('addConsulta', handleAddConsultaEvent);
        window.addEventListener('deleteLast', handleDeleteLastEvent);
        window.addEventListener('loadConsultData', handleLoadConsultData);
        window.addEventListener('resetConsult', handleResetConsult);
        window.addEventListener('closeConsult', handleCloseConsult);
        
        // Limpiar listeners al desmontar
        return () => {
            window.removeEventListener('addConsulta', handleAddConsultaEvent);
            window.removeEventListener('deleteLast', handleDeleteLastEvent);
            window.removeEventListener('loadConsultData', handleLoadConsultData);
            window.removeEventListener('resetConsult', handleResetConsult);
            window.removeEventListener('closeConsult', handleCloseConsult);
        };
    }, []);
    
    // =========== FUNCIONES DE GESTIÓN DE CONSULTAS ===========
    const addNewConsult = () => {
        // Validar que haya datos de paciente
        const patientId = document.getElementById('patient_id')?.value.trim();
        const patientName = document.getElementById('full_name')?.value.trim();
        
        if (!patientId || !patientName) {
            alert('Complete al menos ID y nombre del paciente antes de agregar consulta');
            return;
        }
        
        // Crear nueva consulta con datos de la consulta actual
        const newConsult = {
            id: Date.now(),
            formData: { ...formData },
            examData: { ...examData },
            studiesData: { ...studiesData }
        };
        
        setConsults(prev => [...prev, newConsult]);
        setActiveConsultIndex(prev.length);
    };
    
    const deleteLastConsult = () => {
        if (consults.length <= 1) {
            alert('No se puede eliminar la única consulta');
            return;
        }
        
        setConsults(prev => {
            const newConsults = prev.slice(0, -1);
            // Si eliminamos la consulta activa, activamos la anterior
            if (activeConsultIndex >= newConsults.length) {
                setActiveConsultIndex(newConsults.length - 1);
            }
            return newConsults;
        });
    };
    
    const resetConsult = () => {
        setConsults([{ id: 1, formData: {}, examData: {}, studiesData: {} }]);
        setActiveConsultIndex(0);
        setFormData({ motivo: '', ea: '', ap: '', af: '', dx: '', plan: '', recipe: '', indicaciones: '' });
        setExamData({});
        setStudiesData({});
    };
    
    // Cambiar a una consulta específica
    const switchConsult = (index) => {
        if (index >= 0 && index < consults.length) {
            setActiveConsultIndex(index);
            const consult = consults[index];
            setFormData(consult.formData);
            setExamData(consult.examData);
            setStudiesData(consult.studiesData);
        }
    };
    
    // Actualizar la consulta actual cuando cambian los datos
    useEffect(() => {
        const updateCurrentConsult = () => {
            setConsults(prev => {
                const newConsults = [...prev];
                newConsults[activeConsultIndex] = {
                    ...newConsults[activeConsultIndex],
                    formData: { ...formData },
                    examData: { ...examData },
                    studiesData: { ...studiesData }
                };
                return newConsults;
            });
        };
        
        updateCurrentConsult();
    }, [formData, examData, studiesData]);
    
    // =========== MANEJADORES DE FORMULARIO ===========
    const handleTxtChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    
    const addChip = (field, txt) => {
        setFormData(prev => ({
            ...prev, 
            [field]: prev[field] ? `${prev[field]}, ${txt}` : txt
        }));
    };
    
    // =========== MANEJADORES DE EXAMEN FÍSICO ===========
    const handleExamTxt = (area, val) => {
        setExamData(prev => ({...prev, [area]: val}));
    };
    
    const toggleExamChip = (area, txt) => {
        const current = examData[area] || "";
        if (!current.includes(txt)) {
            handleExamTxt(area, current ? `${current}, ${txt}` : txt);
        }
    };
    
    // =========== MANEJADORES DE ESTUDIOS ===========
    const handleStudyTxt = (study, area, val) => {
        setStudiesData(prev => ({
            ...prev,
            [study]: { ...(prev[study] || {}), [area]: val }
        }));
    };
    
    const toggleStudyChip = (study, area, txt) => {
        const currentStudy = studiesData[study] || {};
        const currentVal = currentStudy[area] || "";
        if (!currentVal.includes(txt)) {
            handleStudyTxt(study, area, currentVal ? `${currentVal}, ${txt}` : txt);
        }
    };
    
    // =========== RENDERIZADO DEL COMPONENTE ===========
    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            {/* Selector de consultas */}
            {consults.length > 1 && (
                <div className="glass-panel p-4 rounded-2xl">
                    <h3 className="text-lg font-bold text-rose-600 mb-2">Consultas</h3>
                    <div className="flex flex-wrap gap-2">
                        {consults.map((consult, index) => (
                            <button
                                key={consult.id}
                                onClick={() => switchConsult(index)}
                                className={`px-3 py-1 rounded-full text-sm ${activeConsultIndex === index ? 'bg-rose-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Consulta #{index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* 1. ANAMNESIS */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-rose-600 mb-4">Anamnesis</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Motivo de Consulta (*)</label>
                        <input 
                            name="motivo" 
                            value={formData.motivo} 
                            onChange={handleTxtChange} 
                            className="input-glass" 
                            placeholder="Describa el motivo principal..."
                        />
                        <div className="chips-wrapper">
                            {ORL_DATA.MOTIVOS.map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => addChip('motivo', m)} 
                                    className="chip"
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="label">Enfermedad Actual (*)</label>
                        <textarea 
                            name="ea" 
                            value={formData.ea} 
                            onChange={handleTxtChange} 
                            rows={4} 
                            className="input-glass" 
                            placeholder="Describa la enfermedad actual del paciente..."
                        />
                    </div>
                </div>
            </div>
            
            {/* 2. EXAMEN FÍSICO */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-blue-600 mb-4">Examen Físico</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(ORL_DATA.PHYSICAL_EXAM).map(([area, items]) => (
                        <div key={area} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="font-bold text-blue-400 block mb-2">{area}</label>
                            
                            {/* Textbox editable para cada área */}
                            <textarea 
                                value={examData[area] || ''}
                                onChange={(e) => handleExamTxt(area, e.target.value)}
                                rows={3}
                                className="w-full bg-black/20 text-sm p-2 rounded-lg border-0 focus:ring-1 focus:ring-blue-500 mb-2"
                                placeholder={`Hallazgos en ${area}...`}
                            />
                            
                            {/* Chips interactivos */}
                            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {items.map(item => (
                                    <button 
                                        key={item} 
                                        onClick={() => toggleExamChip(area, item)} 
                                        className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 hover:text-white px-2 py-1 rounded transition-colors"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 3. ESTUDIOS E IMÁGENES */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-purple-600 mb-4">Estudios e Imágenes</h3>
                <div className="space-y-8">
                    {Object.entries(ORL_DATA.STUDIES).map(([studyName, areas]) => (
                        <div key={studyName} className="border-b border-gray-700 pb-6 last:border-0">
                            <h4 className="text-lg font-bold text-gray-200 mb-3">{studyName}</h4>
                            
                            {Object.keys(areas).length === 0 ? (
                                <textarea 
                                    placeholder={`Resultados de ${studyName}...`}
                                    className="w-full bg-black/20 p-2 rounded"
                                    onChange={(e) => handleStudyTxt(studyName, 'General', e.target.value)}
                                />
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(areas).map(([areaName, options]) => (
                                        <div key={areaName} className="bg-purple-900/10 p-2 rounded">
                                            <label className="text-xs font-bold text-purple-400 uppercase block mb-1">
                                                {areaName}
                                            </label>
                                            <input 
                                                value={(studiesData[studyName] && studiesData[studyName][areaName]) || ''}
                                                onChange={(e) => handleStudyTxt(studyName, areaName, e.target.value)}
                                                className="w-full text-xs bg-black/20 border-0 rounded p-1.5 mb-1"
                                                placeholder={`Valor para ${areaName}`}
                                            />
                                            <div className="flex flex-wrap gap-1">
                                                {options.map(opt => (
                                                    <button 
                                                        key={opt} 
                                                        onClick={() => toggleStudyChip(studyName, areaName, opt)}
                                                        className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100/10 text-purple-200 hover:bg-purple-500"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 4. DIAGNÓSTICO Y PLAN */}
            <div className="glass-panel p-6 rounded-2xl">
                <div className="grid gap-4">
                    <label className="label text-rose-500">Diagnóstico</label>
                    <input 
                        name="dx" 
                        value={formData.dx} 
                        onChange={handleTxtChange} 
                        className="input-glass font-bold" 
                        placeholder="Diagnóstico principal..."
                    />
                    <div className="chips-wrapper">
                        {ORL_DATA.DX.map(d => (
                            <button 
                                key={d} 
                                onClick={() => addChip('dx', d)} 
                                className="chip"
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                    
                    <label className="label text-green-500 mt-4">Plan Terapéutico</label>
                    <textarea 
                        name="plan" 
                        value={formData.plan} 
                        onChange={handleTxtChange} 
                        rows={4} 
                        className="input-glass" 
                        placeholder="Plan de tratamiento..."
                    />
                </div>
            </div>
            
            {/* 5. RECETA MÉDICA */}
            <div className="glass-panel p-6 rounded-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="label">Récipes</label>
                        <textarea 
                            name="recipe" 
                            value={formData.recipe} 
                            onChange={handleTxtChange} 
                            rows={6} 
                            className="input-glass font-mono text-sm" 
                            placeholder="Medicamentos recetados..."
                        />
                        <div className="h-32 overflow-y-auto bg-black/10 p-2 rounded">
                            {Object.entries(ORL_DATA.RECIPE_MEDS).map(([cat, meds]) => (
                                <div key={cat} className="mb-2">
                                    <span className="text-xs font-bold text-gray-400 block">{cat}</span>
                                    {meds.map(m => (
                                        <button 
                                            key={m} 
                                            onClick={() => addChip('recipe', m)} 
                                            className="text-[10px] mr-1 mb-1 px-2 bg-gray-700 rounded hover:bg-white hover:text-black"
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="label">Indicaciones</label>
                        <textarea 
                            name="indicaciones" 
                            value={formData.indicaciones} 
                            onChange={handleTxtChange} 
                            rows={6} 
                            className="input-glass font-mono text-sm" 
                            placeholder="Indicaciones para el paciente..."
                        />
                    </div>
                </div>
            </div>
            
            {/* Estilos inline para el componente */}
            <style>{`
                .label { 
                    display: block; 
                    font-size: 0.875rem; 
                    font-weight: bold; 
                    margin-bottom: 0.25rem; 
                    color: #2c3e50; 
                }
                .input-glass { 
                    width: 100%; 
                    padding: 0.625rem; 
                    background-color: rgba(255, 255, 255, 0.95); 
                    border: 1px solid rgba(255, 255, 255, 0.3); 
                    border-radius: 0.5rem; 
                    color: #2c3e50;
                    transition: all 0.2s;
                }
                .input-glass:focus { 
                    outline: none; 
                    border-color: #4a6fa5; 
                    box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.1); 
                }
                .chips-wrapper { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 0.5rem; 
                    margin-top: 0.5rem; 
                }
                .chip { 
                    font-size: 0.75rem; 
                    padding: 0.25rem 0.75rem; 
                    border-radius: 9999px; 
                    background-color: #f0f4ff; 
                    border: 1px solid #d1d9ff;
                    color: #4a6fa5;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .chip:hover { 
                    background-color: #4a6fa5; 
                    color: white; 
                    transform: translateY(-1px);
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar { 
                    width: 6px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #4a6fa5; 
                    border-radius: 4px; 
                }
                .animate-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
