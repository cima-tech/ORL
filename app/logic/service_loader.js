// app/logic/service_loader.js
import { STATE, showErr } from 'brain';

const LOADED_MODULES = { patient: null, consult: null, informe: null, recipe: null, export: null };

export const ServiceLoader = {
    async init() {
        try {
            // 1. Obtener ID del modelo (Debe venir ya cargado en brain.js por loadUserConfig)
            // Usamos optional chaining por seguridad
            const modelId = STATE.currentUser?.preferences?.default_model;
            
            if (!modelId) throw new Error("El usuario no tiene un 'default_model' configurado en su JSON.");

            // 2. Cargar catálogo
            const response = await fetch('./app/catalog/models.json');
            if (!response.ok) throw new Error("Fallo al leer catalog/models.json");
            const catalog = await response.json();
            
            // 3. Validar modelo
            const modelConfig = catalog[modelId];
            if (!modelConfig) throw new Error(`El modelo '${modelId}' no existe en el catálogo.`);
            if (!modelConfig.path) throw new Error(`El modelo '${modelId}' no tiene una ruta (path) definida.`);

            console.log(`[ServiceLoader] Importando desde: ${modelConfig.path}...`);

            // 4. Importar Módulos (Usando la ruta del JSON)
            const basePath = modelConfig.path;
            
            const [modPatient, modConsult, modInforme, modRecipe, modExport] = await Promise.all([
                import(`${basePath}/patient.js`),
                import(`${basePath}/consult.js`),
                import(`${basePath}/informe.js`),
                import(`${basePath}/recipe.js`),
                import(`${basePath}/export.js`)
            ]);

            LOADED_MODULES.patient = modPatient;
            LOADED_MODULES.consult = modConsult;
            LOADED_MODULES.informe = modInforme;
            LOADED_MODULES.recipe = modRecipe;
            LOADED_MODULES.export = modExport;

            return true;

        } catch (e) {
            console.error(e);
            showErr(`Error de Carga: ${e.message}`);
            return false;
        }
    },

    get(moduleName) {
        if (!LOADED_MODULES[moduleName]) throw new Error(`Módulo '${moduleName}' no disponible. ServiceLoader no inicializado.`);
        return LOADED_MODULES[moduleName];
    }
};
