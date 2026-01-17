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
            // 1. Obtener ID del modelo
            const modelId = STATE.currentUser?.preferences?.default_model;
            
            if (!modelId) throw new Error("El usuario no tiene un 'default_model' configurado.");

            // 2. Cargar catálogo
            // Usamos ruta absoluta relativa a la raíz para el JSON también por seguridad
            const catalogUrl = new URL('./app/catalog/models.json', document.baseURI).href;
            const response = await fetch(catalogUrl);
            
            if (!response.ok) throw new Error("Fallo al leer catalog/models.json");
            const catalog = await response.json();
            
            // 3. Validar modelo
            const modelConfig = catalog[modelId];
            if (!modelConfig) throw new Error(`Modelo '${modelId}' no existe en el catálogo.`);
            if (!modelConfig.path) throw new Error(`El modelo '${modelId}' no tiene una ruta (path) definida.`);

            // 4. CALCULAR RUTA ABSOLUTA (EL FIX)
            // Esto convierte "./app/services..." en "https://tusitio.com/ORL/app/services..."
            // ignorando que este script está metido dentro de /app/logic/
            const basePath = new URL(modelConfig.path, document.baseURI).href;

            console.log(`[ServiceLoader] Importando desde: ${basePath}`);

            // 5. Importar Módulos usando la ruta absoluta
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
        if (!LOADED_MODULES[moduleName]) {
            throw new Error(`Módulo '${moduleName}' no disponible. ServiceLoader no inicializado.`);
        }
        return LOADED_MODULES[moduleName];
    }
};
