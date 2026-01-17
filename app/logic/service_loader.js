import { STATE, showErr } from 'brain';

// Singleton para almacenar los módulos cargados en memoria
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
            // 1. Obtener el ID del modelo preferido del usuario
            const modelId = STATE.currentUser.preferences.default_model || "ORL-001";
            
            // 2. Cargar el catálogo de modelos
            const response = await fetch('./app/catalog/models.json');
            if (!response.ok) throw new Error("No se pudo cargar el catálogo de modelos");
            const catalog = await response.json();
            
            // 3. Validar existencia
            const modelConfig = catalog[modelId];
            if (!modelConfig) throw new Error(`Modelo ${modelId} no encontrado en el catálogo`);
            
            console.log(`[ServiceLoader] Cargando especialidad: ${modelConfig.name}...`);

            // 4. IMPORTACIÓN DINÁMICA (La Magia)
            // Usamos rutas relativas basadas en el path del JSON
            const basePath = modelConfig.path;

            // Cargamos todos los módulos del cartucho en paralelo
            const [modPatient, modConsult, modInforme, modRecipe, modExport] = await Promise.all([
                import(`${basePath}/patient.js`),
                import(`${basePath}/consult.js`),
                import(`${basePath}/informe.js`),
                import(`${basePath}/recipe.js`),
                import(`${basePath}/export.js`)
            ]);

            // 5. Guardar referencias en memoria
            LOADED_MODULES.patient = modPatient;
            LOADED_MODULES.consult = modConsult;
            LOADED_MODULES.informe = modInforme;
            LOADED_MODULES.recipe = modRecipe;
            LOADED_MODULES.export = modExport;

            console.log("[ServiceLoader] Módulos cargados exitosamente.");
            return true;

        } catch (e) {
            console.error(e);
            showErr(`Error crítico cargando módulos: ${e.message}`);
            return false;
        }
    },

    // API Pública para que Engine y Toolbar pidan los módulos
    get(moduleName) {
        if (!LOADED_MODULES[moduleName]) {
            throw new Error(`El módulo '${moduleName}' no ha sido cargado o no existe.`);
        }
        return LOADED_MODULES[moduleName];
    }
};
