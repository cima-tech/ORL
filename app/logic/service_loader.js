import { STATE, showErr } from 'brain';

// Almacén en memoria de los módulos cargados
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
            // 1. Identificar qué modelo cargar (desde preferences del usuario)
            const modelId = STATE.currentUser.preferences.default_model || "ORL-001";
            
            // 2. Cargar el catálogo
            const response = await fetch('./app/catalog/models.json');
            if (!response.ok) throw new Error("No se pudo cargar app/catalog/models.json");
            const catalog = await response.json();
            
            // 3. Verificar si el modelo existe
            const modelConfig = catalog[modelId];
            if (!modelConfig) throw new Error(`El modelo '${modelId}' no existe en el catálogo.`);
            
            console.log(`[ServiceLoader] Iniciando carga dinámica de: ${modelConfig.name} (${modelId})...`);

            // 4. Importación Dinámica (Dynamic Imports)
            // Usamos la ruta definida en el JSON
            const basePath = modelConfig.path;

            // Cargamos todos los componentes del cartucho en paralelo
            const [modPatient, modConsult, modInforme, modRecipe, modExport] = await Promise.all([
                import(`${basePath}/patient.js`),
                import(`${basePath}/consult.js`),
                import(`${basePath}/informe.js`),
                import(`${basePath}/recipe.js`),
                import(`${basePath}/export.js`)
            ]);

            // 5. Guardar en memoria
            LOADED_MODULES.patient = modPatient;
            LOADED_MODULES.consult = modConsult;
            LOADED_MODULES.informe = modInforme;
            LOADED_MODULES.recipe = modRecipe;
            LOADED_MODULES.export = modExport;

            console.log("[ServiceLoader] Carga completada. Sistema listo.");
            return true;

        } catch (e) {
            console.error(e);
            showErr(`Error Crítico de Sistema: ${e.message}`);
            return false;
        }
    },

    // Método para que Engine y Toolbar pidan los módulos
    get(moduleName) {
        if (!LOADED_MODULES[moduleName]) {
            throw new Error(`Error Interno: El módulo '${moduleName}' se solicitó antes de inicializar ServiceLoader.`);
        }
        return LOADED_MODULES[moduleName];
    }
};
