import { STATE, showErr } from 'brain';

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

            const catalogUrl = new URL('./app/catalog/models.json', document.baseURI).href;
            const response = await fetch(catalogUrl);
            if (!response.ok) throw new Error("Fallo leyendo catálogo de modelos");
            const catalog = await response.json();
            
            const modelConfig = catalog[modelId];
            if (!modelConfig || !modelConfig.path) throw new Error(`Modelo '${modelId}' inválido.`);

            const basePath = new URL(modelConfig.path, document.baseURI).href;
            console.log(`[Loader] Importando desde: ${basePath}`);

            const [modPatient, modConsult, modInforme, modRecipe, modExport] = await Promise.all([
                import(`${basePath}/patient.js`),
                import(`${basePath}/consult.js`),
                import(`${basePath}/informe.js`),
                import(`${basePath}/recipe-indicaciones.js`),
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
            showErr(`Fallo Crítico: ${e.message}`);
            return false;
        }
    },
    
    get(name) {
        if (!LOADED_MODULES[name]) throw new Error(`Módulo '${name}' no cargado.`);
        return LOADED_MODULES[name];
    }
};
