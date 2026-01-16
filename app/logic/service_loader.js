// app/logic/service_loader.js
import { STATE, showErr, flash } from 'brain';

// Contenedor de Servicios Activos (Proxy)
export const ActiveModel = {
    patient: null,
    consult: null,
    recipe: null,
    informe: null,
    export: null,
    metadata: null
};

export async function loadServiceModules() {
    try {
        // 1. Cargar Catálogo de Modelos
        const modelsReq = await fetch('./app/logic/models.json');
        if (!modelsReq.ok) throw new Error("No se pudo cargar models.json");
        const modelsCatalog = await modelsReq.json();

        // 2. Determinar Modelo del Usuario (Default ORL-001 si no existe en user.json)
        const userModelId = STATE.currentUser?.preferences?.default_model || "ORL-001";
        const modelConfig = modelsCatalog[userModelId];

        if (!modelConfig) throw new Error(`Modelo no encontrado: ${userModelId}`);

        console.log(`[ServiceLoader] Cargando modelo: ${modelConfig.name} (${userModelId})...`);

        // 3. Importación Dinámica de Módulos (Webpack/ES6 friendly)
        // Nota: Usamos rutas relativas construidas desde el base_path
        
        // A. Patient Service
        if (modelConfig.modules.patient) {
            ActiveModel.patient = await import(`${modelConfig.base_path}/${modelConfig.modules.patient}`);
        }

        // B. Recipe Service
        if (modelConfig.modules.recipe) {
            ActiveModel.recipe = await import(`${modelConfig.base_path}/${modelConfig.modules.recipe}`);
        }
        
        // C. Consult Service
        if (modelConfig.modules.consult) {
            ActiveModel.consult = await import(`${modelConfig.base_path}/${modelConfig.modules.consult}`);
        }

        // D. Informe Service
        if (modelConfig.modules.informe) {
            ActiveModel.informe = await import(`${modelConfig.base_path}/${modelConfig.modules.informe}`);
        }

        // E. Export Service
        if (modelConfig.modules.export) {
            ActiveModel.export = await import(`${modelConfig.base_path}/${modelConfig.modules.export}`);
        }

        ActiveModel.metadata = modelConfig;
        flash(`Módulo cargado: ${modelConfig.name}`);
        return true;

    } catch (e) {
        console.error(e);
        showErr(`Error Crítico cargando servicios: ${e.message}`);
        return false;
    }
}
