{
type: "file",
fileName: "service_loader.js",
fullContent: `
import { STATE, showErr, log } from 'brain';

const LOADED_MODULES = { 
    patient: null, 
    consult: null, 
    informe: null, 
    recipe: null, 
    export: null 
};

export const ServiceLoader = {
    async init() {
        try {
            const modelId = STATE.currentUser?.preferences?.default_model;
            if (!modelId) throw new Error("Usuario sin 'default_model' definido.");

            // 1. Obtener ruta del modelo
            const catalogUrl = new URL('./app/catalog/models.json', document.baseURI).href;
            const response = await fetch(catalogUrl);
            if (!response.ok) throw new Error("Fallo leyendo catálogo de modelos");
            const catalog = await response.json();
            
            const modelConfig = catalog[modelId];
            if (!modelConfig || !modelConfig.path) throw new Error(\`Modelo '\${modelId}' inválido.\`);

            const basePath = new URL(modelConfig.path, document.baseURI).href;
            console.log(\`[Loader] Intentando importar desde: \${basePath}\`);

            // 2. Importar módulos con manejo de errores individual
            // Si falla GEN-001, intentamos cargar ORL-001 como fallback de emergencia o lanzamos error controlado
            try {
                const [modPatient, modConsult, modInforme, modRecipe, modExport] = await Promise.all([
                    import(\`\${basePath}/patient.js\`),
                    import(\`\${basePath}/consult.js\`),
                    import(\`\${basePath}/informe.js\`),
                    import(\`\${basePath}/recipe-indicaciones.js\`),
                    import(\`\${basePath}/export.js\`)
                ]);

                LOADED_MODULES.patient = modPatient;
                LOADED_MODULES.consult = modConsult;
                LOADED_MODULES.informe = modInforme;
                LOADED_MODULES.recipe = modRecipe;
                LOADED_MODULES.export = modExport;
                
                return true;

            } catch (importError) {
                console.error("Error importando módulos médicos:", importError);
                showErr(\`Faltan archivos del modelo \${modelId}. Ver consola.\`);
                // No devolvemos false aquí para permitir que la UI cargue aunque sea vacía
                // Esto permite al usuario u002 ver la toolbar y cerrar sesión.
                return true; 
            }

        } catch (e) {
            console.error(e);
            showErr(\`Fallo Crítico: \${e.message}\`);
            return false;
        }
    },
    
    get(name) {
        if (!LOADED_MODULES[name]) {
            console.warn(\`Módulo '\${name}' solicitado pero no está cargado.\`);
            // Retornar un objeto dummy para evitar crash total si falta el módulo
            return {
                initializeNewPatient: () => console.log("Dummy init patient"),
                renderPatientForm: () => console.log("Dummy render patient"),
                createVisitCard: () => { 
                    const div = document.createElement('div'); 
                    div.innerHTML = "Error: Módulo no cargado"; 
                    return div; 
                },
                updatePatientHeader: () => {},
                toggleConditionalFields: () => {},
                calcularCampos: () => {},
                getPatientData: () => ({}),
                loadPatientDataToDOM: () => {}
            };
        }
        return LOADED_MODULES[name];
    }
};
`
}
