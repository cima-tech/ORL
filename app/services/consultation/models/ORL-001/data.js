/**
 * Modelo de Consulta ORL-001
 * Define la estructura completa de la consulta ORL con todos los chips y textboxes
 */

window.ORL001_CONSULTATION_MODEL = {
  // Nombre del modelo
  name: 'ORL-001',
  description: 'Modelo completo de consulta ORL con estructura lineal',
  
  // BLOQUE 1: ANAMNESIS
  anamnesis: {
    // 1.1 Motivo de Consulta
    motivoConsulta: {
      textboxId: 'txt-motivo',
      placeholder: '(texto libre)',
      chips: [
        'Obstrucción Nasal',
        'Ronquidos Nocturnos',
        'Respiración Bucal',
        'Rinorrea',
        'Odinofagia',
        'Otorrea',
        'Otalgia',
        'Masa en Cuello',
        'Difonía',
        'Dolor Facial',
        'Cefalea'
      ]
    },
    
    // 1.2 Enfermedad Actual
    enfermedadActual: {
      textboxId: 'txt-ea',
      placeholder: '(autogenerado)',
      autogenerate: true,
      template: 'Paciente {genero} de {edad} años quien acude a consulta por presentar {motivo}.'
    },
    
    // 1.3 Antecedentes
    antecedentesPersonales: {
      textboxId: 'txt-antecedentes-personales',
      placeholder: '(se llena con chips)',
      chips: [
        'Alergias',
        'Asma',
        'HTA',
        'Tiroides',
        'DM',
        'IQx',
        'Trauma Acústico'
      ]
    },
    
    antecedentesFamiliares: {
      textboxId: 'txt-antecedentes-familiares',
      placeholder: '(se llena con chips)',
      chips: [
        'Alergias',
        'Asma',
        'HTA',
        'Tiroides',
        'DM',
        'IQx',
        'Trauma Acústico'
      ]
    }
  },
  
  // BLOQUE 2: EXAMEN FÍSICO
  examenFisico: {
    // 2.1 Cara
    cara: {
      textboxId: 'txt-exam-cara',
      placeholder: 'Hallazgos en cara...',
      chips: [
        'Simetría Facial',
        'Asimetría Facial',
        'Parálisis Facial Periférica',
        'Parálisis Facial Periférica derecha',
        'Parálisis Facial Periférica izquierda',
        'Parálisis Facial Central',
        'Edema Facial',
        'Malformación Craneofacial'
      ]
    },
    
    // 2.2 Oído Derecho
    oidoDerecho: {
      textboxId: 'txt-exam-oido-derecho',
      placeholder: 'Hallazgos oído derecho...',
      groups: {
        'Oído Externo': [
          'Pabellón Auricular Indemne Normoimplantado',
          'Microtia Grado 1',
          'Microtia Grado 2',
          'Microtia Grado 3',
          'Anotia',
          'Fístula'
        ],
        'Conducto Auditivo Externo': [
          'CAE Libre',
          'CAE con Otocerumen',
          'CAE estenótico',
          'Atresia CAE',
          'CAE con LOE',
          'CAE con Otorrea Fétida',
          'CAE Descamativo'
        ],
        'Membrana Timpánica': [
          'indemne, movilidad conservada',
          'Opaca',
          'abombada con líquido retrotimpánico escaso',
          'abombada con líquido retrotimpánico que limita movilidad',
          'eritematosa con líquido retrotimpático amarillento',
          'con perforación anterior',
          'con perforación posterior',
          'con perforación central',
          'con perforación amplia',
          'con perforación puntiforme'
        ]
      }
    },
    
    // 2.3 Oído Izquierdo
    oidoIzquierdo: {
      textboxId: 'txt-exam-oido-izquierdo',
      placeholder: 'Hallazgos oído izquierdo...',
      groups: {
        'Oído Externo': [
          'Pabellón Auricular Indemne Normoimplantado',
          'Microtia Grado 1',
          'Microtia Grado 2',
          'Microtia Grado 3',
          'Anotia',
          'Fístula'
        ],
        'Conducto Auditivo Externo': [
          'CAE Libre',
          'CAE con Otocerumen',
          'CAE estenótico',
          'Atresia CAE',
          'CAE con LOE',
          'CAE con Otorrea Fétida',
          'CAE Descamativo'
        ],
        'Membrana Timpánica': [
          'indemne, movilidad conservada',
          'Opaca',
          'abombada con líquido retrotimpánico escaso',
          'abombada con líquido retrotimpánico que limita movilidad',
          'eritematosa con líquido retrotimpático amarillento',
          'con perforación anterior',
          'con perforación posterior',
          'con perforación central',
          'con perforación amplia',
          'con perforación puntiforme'
        ]
      }
    },
    
    // 2.4 Nariz
    nariz: {
      textboxId: 'txt-exam-nariz',
      placeholder: 'Hallazgos en nariz...',
      groups: {
        'Fosa': [
          'Fosa nasal permeable',
          'LOE',
          'LOE que obstruye compleamente fosa nasal izquierda',
          'LOE que obstruye completamente fosa nasal derecha'
        ],
        'Tabique': [
          'Tabique Central',
          'con desviación Dextroconvexa',
          'con desviación Levoconvexa',
          'con espolón óseo'
        ],
        'Cornetes': [
          'Cornete inferior eutrófico',
          'Cornete inferior hipertrófico obstructivo',
          'Cornete inferior con degeneración polipoidea',
          'Cornete medio eutrófico',
          'Cornete medio hipertrófico',
          'Poliposis nasal'
        ],
        'Mucosa': [
          'Mucosa Indemne',
          'Mucosa Pálida',
          'Mucosa Eritematosa a nivel de Plexos',
          'Epistaxis Anterior',
          'Epistaxis Posterior'
        ],
        'Rinorrea': [
          'Rinorrea Hialina',
          'Rinorrea Blanquecina',
          'Rinorrea Amarillenta'
        ]
      }
    },
    
    // 2.5 Orofaringe
    orofaringe: {
      textboxId: 'txt-exam-orofaringe',
      placeholder: 'Hallazgos en orofaringe...',
      groups: {
        'Lengua': [
          'Lengua húmeda móvil',
          'Lengua seca'
        ],
        'Tonsilas': [
          'Tonsilas grado I',
          'Tonsilas grado II',
          'Tonsilas grado III',
          'Tonsilas grado IV',
          'Tonsilas asimétricas',
          'Tonsilas con placas blanquecinas'
        ],
        'Rinofaringe': [
          'Rinofaringe congestiva',
          'con rinorrea posterior escasa',
          'con rinorrea posterior blanquecina',
          'con placas blanquecinas'
        ]
      }
    },
    
    // 2.6 Cuello
    cuello: {
      textboxId: 'txt-exam-cuello',
      placeholder: 'Hallazgos en cuello...',
      chips: [
        'Móvil, sin lesiones aparentes'
      ]
    }
  },
  
  // BLOQUE 3: ESTUDIOS
  estudios: {
    // Estudios con chips
    estudiosConChips: [
      {
        name: 'Nasofibrolaringoscopia',
        textboxId: 'txt-study-nasofibrolaringoscopia',
        placeholder: 'Conclusión Nasofibrolaringoscopia...',
        groups: {
          'Fosas Nasales': ['Permeables', 'No Permeables'],
          'Correderas Nasales': ['Sin Rinorrea', 'Rinorrea Blanca Escasa', 'Rinorrea Blanca Moderada', 'Rinorrea Blanca Abundante', 'Rinorrea Hialina Escasa', 'Rinorrea Hialina Moderada', 'Rinorrea Hialina Abundante', 'Rinorrea Amarilla Escasa', 'Rinorrea Amarilla Moderada', 'Rinorrea Amarilla Abundante', 'Rinorrea Verde Escasa', 'Rinorrea Verde Moderada', 'Rinorrea Verde Abundante'],
          'Tabique': ['Central', 'Septumdesviación Levoconvexa', 'Septumdesviación Dextroconvexa', 'Levoconvexa Con Espolón Oseo Derecho', 'Levoconvexa Con Espolón Oseo Izquierdo', 'Dextroconvexa Con Espolón Oseo Derecho', 'Dextroconvexa Con Espolón Oseo Izquierdo', 'Central Con Espolón Óseo Derecho', 'Central Con Espolón Óseo Izquierdo'],
          // ... resto de grupos para Nasofibrolaringoscopia
        }
      },
      {
        name: 'Endoscopia Nasal',
        textboxId: 'txt-study-endoscopia-nasal',
        placeholder: 'Conclusión Endoscopia Nasal...',
        groups: {
          'Fosas Nasales': ['Permeables', 'No Permeables'],
          'Tabique': ['Central', 'Septumdesviación Levoconvexa', 'Septumdesviación Dextroconvexa', 'Levoconvexa Con Espolón Oseo Derecho', 'Levoconvexa Con Espolón Oseo Izquierdo', 'Dextroconvexa Con Espolón Oseo Derecho', 'Dextroconvexa Con Espolón Oseo Izquierdo', 'Central Con Espolón Óseo Derecho', 'Central Con Espolón Óseo Izquierdo'],
          // ... resto de grupos para Endoscopia Nasal
        }
      },
      // ... más estudios
    ],
    
    // Estudios adicionales (solo textbox)
    estudiosAdicionales: [
      'Audiometría',
      'Timpanometría',
      'Acufenometría',
      'Prueba de Prótesis Auditiva',
      'PEATC',
      'Estudio de Sueño',
      'Resonancia de Nariz y SPN',
      'Protocolo de Implante Coclear'
    ]
  },
  
  // BLOQUE 4: DIAGNÓSTICO Y PLAN
  diagnosticoPlan: {
    // 4.1 Diagnóstico
    diagnostico: {
      textboxId: 'txt-dx',
      placeholder: '(se llena con chips + libre)',
      chips: [
        'Otocerumen Bilateral',
        'Otocerumen Derecho',
        'Otocerumen Izquierdo',
        'Otitis Externa Bilateral',
        'Otitis Externa Derecha',
        'Otitis Externa Izquierda',
        'Otitis Media Aguda Bilateral',
        'Otitis Media Aguda Derecha',
        'Otitis Media Aguda Izquierda',
        'Otitis Media Crónica Perforada Bilateral',
        'Otitis Media Crónica Perforada Derecha',
        'Otitis Media Crónica Perforada Izquierda',
        'Otitis Media Crónica Sucurativa',
        'Otitis Media Crónica Colestetomatosa',
        'Hipoacusia Neurosensorial Profunda Bilateral',
        'Hipoacusia Neurosensorial Profunda Derecha',
        'Hipoacusia Neurosensorial Profunda Izquierda',
        'Hipoacusia Conductiva Leve Bilateral',
        'Hipoacusia Conductiva Leve Derecha',
        'Hipoacusia Conductiva Leve Izquierda',
        'Presbiacusia',
        'Otitis Media Serosa Bilateral',
        'Otitis Media Serosa Derecha',
        'Otitis Media Serosa Izquierda',
        'Faringoamigdalitis Aguda',
        'Tonsilitis Recurrente',
        'Otitis Media Aguda Recurrente',
        'Alto Riesgo Biológico Para Hipoacusia',
        'Rinopatía Obstructiva',
        'Rinitis Alérgica',
        'Poliposis Nasal',
        'Rinosinusitis Aguda Maxiloetmoidal',
        'Rinosinusitis Aguda Maxilar',
        'Rinosinusitis Maxilar Crónica',
        'Rinosinusitis Crónica Con Poliposis Nasal',
        'Lesión En Cuerda Vocal Derecha',
        'Lesión En Cuerda Vocal Izquierda',
        'Parálisis De Cuerda Vocal Bilateral',
        'Parálisis De Cuerda Vocal Derecha',
        'Parálisis De Cuerda Vocal Izquierda',
        'Epistaxis Anterior',
        'Epistaxis Anteroposterior',
        'Epistaxis Posterior',
        'Frenillo Lingual',
        'Antecedente Quirúrgico'
      ]
    },
    
    // 4.2 Recipe (Medicamentos)
    recipe: {
      textboxId: 'txt-recipe',
      placeholder: '(seleccione medicamentos)',
      groups: {
        'Esteroides Nasales': [
          'Solución Fisiológica',
          'Flinas / Nasonex / Elocon / Flixonase / Nimarin / Budenas (Spray Nasal)',
          'Flinas - Spray Nasal',
          'Nasonex - Spray Nasal',
          'Elocon - Spray Nasal',
          'Flixonase - Spray Nasal',
          'Nimarin - Spray Nasal',
          'Budenas - Spray Nasal',
          'Momentasona o Fluticasona - Spray Nasal'
        ],
        'Antialérgicos': [
          'Desloratadina - Tabletas 5 mg',
          'Desloratadina - Jarabe',
          'Loratadina - Tabletas 10 mg',
          'Loratadina - Jarabe',
          'Cetirizina - Tabletas 10 mg',
          'Cetirizina - Jarabe',
          'Levocetirizina - Tabletas 5 mg',
          'Levocetirizina - Jarabe',
          'Rinolast - Tabletas',
          'Rinolast - Jarabe',
          'Fexofenadina - Tabletas 120 mg',
          'Fexofenadina - Jarabe',
          'Claricort - Tabletas',
          'Lorecort - Jarabe',
          'Montelukast - Tabletas 4 mg',
          'Montelukast - Tabletas 5 mg',
          'Montelukast - Tabletas 10 mg',
          'Rinomax - Gotas Nasales',
          'Bactroban, Bacitracina, Mupirocina, Muprovan - crema o ungüento'
        ],
        'Gotas óticas': [
          'Quinotic, Quinotic HC, (Gotas Óticas)',
          'Otalex (Gotas Óticas)',
          'Poliótico (Gotas Óticas)',
          'Otirilin o Aceite de Bebé (Gotas)'
        ],
        'Protector Gástrico': [
          'Pantoprazol ó Esomeprazol - Tabletas de 20 mg',
          'Pantoprazol - Tabletas 40 mg'
        ],
        'Antibióticos': [
          'Amoxicilina / Acido Clavulánico - Tabletas 875/125 mg',
          'Amoxicilina / Acido Clavulánico - Suspensión 600 mg / 5 ml',
          'Amoxicilina - Tabletas 500 mg',
          'Amoxicilina - Jarabe',
          'Sultamicilina - Tabletas 750 mg',
          'Sultamicilina - Suspensión 250 mg / 5 ml',
          'Levofloxacina- Tabletas 500 mg',
          'Levofloxacina- Tabletas 750 mg',
          'Moxifloxacina, Moxen, Avelox - Comprimidos 400 mg'
        ],
        'Otros': [
          'Pulmolix - Sobres',
          'Betahistina - 8 mg',
          'Betahistina - 16 mg',
          'Betahistina - 24 mg',
          'Viajesan - Comprimidos'
        ]
      },
      indicacionesOptions: {
        'Esteroides Nasales': [
          'Realizar lavados nasales cada 12 horas por 7 días.',
          'Colocar dos aplicaciones en cada fosa nasal cada 12 horas por 1 mes.',
          'Colocar una aplicación en cada fosa nasal cada 12 horas por 1 mes.'
        ],
        'Antialérgicos': [
          'Tomar 1 tableta diaria por 1 mes.',
          'Dar vía oral 1 cc una vez al día por 1 mes.',
          'Dar vía oral 2 cc una vez al día por 1 mes.',
          'Dar vía oral 3 cc una vez al día por 1 mes.',
          'Dar vía oral 4 cc una vez al día por 1 mes.',
          'Dar vía oral 5 cc una vez al día por 1 mes.',
          'Tomar 1 tableta cada 12 horas por 7 días.',
          'Dar vía oral 1 cc cada 12 horas por 7 días.',
          'Dar vía oral 2 cc cada 12 horas por 7 días.',
          'Dar vía oral 3 cc cada 12 horas por 7 días.',
          'Dar vía oral 4 cc cada 12 horas por 7 días.',
          'Dar vía oral 5 cc cada 12 horas por 7 días.',
          'Colocar 3 Gotas en cada fosa nasal cada 8 horas por 5 días.',
          'Colocar 1 aplicación en cada fosa nasal cada 12 horas por 7 días.',
          'Tomar 1 tableta diaria por 3 meses.'
        ],
        'Gotas óticas': [
          'Aplicar 3 Gotas en cada oído cada 12 horas por 7 días. No mojar los oídos.',
          'Aplicar 3 Gotas en cada oído cada 8 horas por 7 días. No mojar los oídos.',
          'Aplicar 3 Gotas en oído izquierdo cada 8 horas por 7 días. No mojar los oídos.',
          'Aplicar 3 Gotas en oído izquierdo cada 12 horas por 7 días. No mojar los oídos.',
          'Aplicar 3 Gotas en oído derecho cada 8 horas por 7 días. No mojar los oídos.',
          'Aplicar 3 Gotas en oído derecho cada 12 horas por 7 días. No mojar los oídos.'
        ],
        'Protector Gástrico': [
          'Tomar 1 tableta diaria por 3 meses.',
          'Tomar 1 tableta diaria antes del desayuno por 1 mes.',
          'Tomar 1 tableta antes del desayuno y 1 Tableta antes la cena por 1 mes.'
        ],
        'Antibióticos': [
          'Tomar 1 tableta cada 12 horas por 10 días.',
          'Tomar 1 tableta cada 8 horas por 10 días.',
          'Tomar 1 tableta diaria por 10 días.',
          'Dar vía oral 1 cc cada 12 horas por 10 días.',
          'Dar vía oral 2 cc cada 12 horas por 10 días.',
          'Dar vía oral 3 cc cada 12 horas por 10 días.',
          'Dar vía oral 4 cc cada 12 horas por 10 días.',
          'Dar vía oral 5 cc cada 12 horas por 10 días.',
          'Dar vía oral 6 cc cada 12 horas por 10 días.'
        ],
        'Otros': [
          'Tomar 1 tableta cada 12 horas por 10 días.',
          'Tomar 1 tableta cada 8 horas por 10 días.',
          'Tomar 1 tableta diaria por 10 días.'
        ]
      }
    },
    
    // 4.3 Indicaciones
    indicaciones: {
      textboxId: 'txt-indicaciones',
      placeholder: '(se generan automáticamente)'
    },
    
    // 4.4 Plan
    plan: {
      textboxId: 'txt-plan',
      placeholder: '(hereda de indicaciones + texto legal)',
      legalText: '\n\nAvisar eventualidad si persisten síntomas a pesar del Tratamiento indicado o empeoramiento de síntomas al 0212-5086321 / 0424-1090979 o acudir a la Emergencia.'
    }
  },
  
  // Plantillas para documentos
  templates: {
    informe: {
      title: 'INFORME MÉDICO',
      subtitle: 'Otorrinolaringología',
      footer: {
        name: 'Dra. Valentina González Yanez',
        title: 'ORL - Hospital de Clínicas Caracas'
      }
    },
    receta: {
      title: 'RECETA MÉDICA',
      footer: {
        name: 'Dra. Valentina González Yanez',
        title: 'ORL - Hospital de Clínicas Caracas',
        contact: 'Tel: (0212) 5086321 - (0424) 1090979'
      }
    }
  }
};