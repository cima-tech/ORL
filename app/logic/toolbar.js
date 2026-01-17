// app/logic/toolbar.js
import { $, STATE, rotateWallpaper, flash, showErr, fmtDate } from './brain.js';
// Engine sigue importándose igual porque está en logic
import { saveCurrentHistory, resetStory, handleAddConsulta, getSearchResults, loadHistoryRecord } from './engine.js'; 

// ... (GENERADORES DE HTML SE MANTIENEN IGUAL QUE EN V4.2) ...
// Copia getNavGroupHTML, getHistoryGroupHTML, getConsultToolsHTML, getPreviewGroupHTML, renderToolbar, etc.
// No cambian porque solo manipulan HTML y llaman funciones del engine.

// ... (LA ÚNICA FUNCIÓN QUE CAMBIA ES openDocGlobal y eventos de exportación) ...

// En bindEvents, dentro del click de #btnDownload:
// ANTES: import { exportToPNG } from 'export';
// AHORA: STATE.Service.export.exportToPNG();

function bindEvents() {
    // ... (resto de eventos igual) ...

    $("#btnDownload")?.addEventListener('click', () => { 
        // Llamada Dinámica al servicio de Exportación
        if(STATE.Service.export) {
            STATE.Service.export.exportToPNG(); 
            $("#exportModal").classList.remove('active'); 
        }
    });
    
    $("#btnShareWA")?.addEventListener('click', () => {
        if(STATE.Service.export) STATE.Service.export.shareViaWhatsApp();
    });

    // ... (resto igual)
}

// ... (Resto de funciones auxiliares) ...

// Interceptor Global - AQUI USAMOS LOS SERVICIOS DINÁMICOS
window.openDocGlobal = function(kind, cardId) {
    const card = document.getElementById(cardId);
    if(!card) return;
    STATE.currentPreviewCard = card;
    STATE.currentPreviewDoc = kind;
    STATE.UI.isPreviewMode = true; 
    
    let html = "";
    if (kind === 'INF') {
        // Dinámico
        html = STATE.Service.informe.buildReportHTML(card);
    } else {
        // Dinámico
        html = STATE.Service.recipe.buildRecipeHTML(card);
    }
    
    const preview = $("#docPreview");
    if(preview) preview.innerHTML = html;
    
    // Necesitamos re-renderizar toolbar para que toolbar.js reconozca el import de renderToolbar
    // Como estamos en el mismo archivo, llamamos directo a la exportada o a la interna si la separamos.
    // En este caso, initToolbarEvents llama a renderToolbar, así que renderToolbar está en scope.
    // Pero espera, renderToolbar es exportada. La usamos directo.
    // Nota: Asegúrate que renderToolbar esté definida o accesible. 
    // Si da error, usa la referencia exportada o muevela arriba.
    // Para simplificar, asumo que está en el mismo archivo:
    // renderToolbar(); 
    // *Corrección*: Como JS modules son estrictos, mejor llamamos a initToolbarEvents() o extraemos renderToolbar.
    // Simplemente llamemos a initToolbarEvents() que redibuja todo.
    initToolbarEvents();
};

// ... (Asegúrate de copiar todo el contenido de toolbar.js v4.2 y solo cambiar esas líneas de import/uso)
